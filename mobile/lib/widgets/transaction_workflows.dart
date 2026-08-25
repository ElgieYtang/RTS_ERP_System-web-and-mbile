import 'package:flutter/material.dart';

import '../navigation/transaction_navigation.dart';
import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../services/transaction_actions.dart';
import '../services/transaction_lists.dart';
import 'field_ui.dart';

bool isOutslipReadyForDr(String? status) {
  final value = (status ?? '').toLowerCase();
  return value == 'for_dispatch' || value == 'released';
}

Future<Map<String, dynamic>?> showCreateOutslipDialog(
  BuildContext context,
  ApiClient api, {
  String? initialReceivingDbId,
  List<Map<String, dynamic>>? completedReceivings,
}) async {
  List<Map<String, dynamic>> customers = [];
  List<Map<String, dynamic>> receivings = completedReceivings ?? [];

  try {
    customers = (await api.getList('/setup/customers'))
        .cast<Map<String, dynamic>>()
        .where((row) => row['status'] != 'Inactive')
        .toList();
    if (receivings.isEmpty) {
      receivings = (await api.getList('/receivings'))
          .cast<Map<String, dynamic>>()
          .where((row) => row['status'] == 'completed')
          .toList();
    }
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }

  if (!context.mounted) return null;
  if (customers.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('No active customers found in setup.')),
    );
    return null;
  }
  if (receivings.isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('No completed receivings available.')),
    );
    return null;
  }

  var customerId = customers.first['id']?.toString() ?? '';
  var receivingDbId = initialReceivingDbId ??
      receivings.first['dbId']?.toString() ??
      receivings.first['id']?.toString() ??
      '';

  final created = await showDialog<Map<String, dynamic>?>(
    context: context,
    builder: (context) => StatefulBuilder(
      builder: (context, setDialogState) => AlertDialog(
        title: const Text('New outslip'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                initialValue: customerId,
                decoration: const InputDecoration(
                  labelText: 'Customer',
                  border: OutlineInputBorder(),
                ),
                items: customers
                    .map(
                      (row) => DropdownMenuItem(
                        value: row['id']?.toString() ?? '',
                        child: Text(row['name']?.toString() ?? 'Customer'),
                      ),
                    )
                    .toList(),
                onChanged: (value) => setDialogState(() => customerId = value ?? customerId),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: receivingDbId,
                decoration: const InputDecoration(
                  labelText: 'From receiving (completed)',
                  border: OutlineInputBorder(),
                ),
                items: receivings
                    .map(
                      (row) => DropdownMenuItem(
                        value: row['dbId']?.toString() ?? row['id']?.toString() ?? '',
                        child: Text(
                          '${row['id'] ?? 'RCV'} — ${row['supplierName'] ?? 'Receiving'}',
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (value) => setDialogState(() => receivingDbId = value ?? receivingDbId),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(
            onPressed: () async {
              final customer = int.tryParse(customerId);
              final receiving = int.tryParse(receivingDbId);
              if (customer == null || receiving == null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Select a customer and receiving.')),
                );
                return;
              }
              try {
                final response = await api.post('/outslips', {
                  'customerId': customer,
                  'receivingId': receiving,
                });
                if (!context.mounted) return;
                Navigator.pop(context, recordFromPayload(response));
              } catch (error) {
                if (!context.mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(friendlyApiError(error))),
                );
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    ),
  );

  return created;
}

Future<Map<String, dynamic>?> confirmCreateDeliveryReceipt(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> outslip,
) async {
  final outslipId = int.tryParse(fieldDbId(outslip));
  if (outslipId == null) return null;

  final ok = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Create delivery receipt?'),
      content: Text('Create DR from ${outslip['id'] ?? 'outslip'}?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Create')),
      ],
    ),
  );
  if (ok != true) return null;

  try {
    final response = await api.post('/delivery-receipts', {'outslipId': outslipId});
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Delivery receipt created.')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}

Future<Map<String, dynamic>?> receivePurchaseOrder(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> po,
  TransactionLists lists,
) async {
  final id = fieldDbId(po);
  if (id.isEmpty) return null;
  if (!canReceivePurchaseOrder(po, lists)) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Receiving already in progress or PO is completed.')),
      );
    }
    return null;
  }

  final ok = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Create receiving?'),
      content: Text('Start receiving for ${po['id'] ?? id}?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Receive')),
      ],
    ),
  );
  if (ok != true) return null;

  try {
    final response = await api.post('/purchase-orders/$id/receivings');
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Receiving created.')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}

Future<Map<String, dynamic>?> confirmReceiving(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> receiving,
) async {
  final id = fieldDbId(receiving);
  if (id.isEmpty) return null;

  final ok = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Confirm receiving'),
      content: Text('Confirm ${receiving['id'] ?? id}?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Confirm')),
      ],
    ),
  );
  if (ok != true) return null;

  try {
    final response = await api.post('/receivings/$id/confirm');
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Receiving confirmed')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}

Future<Map<String, dynamic>?> createOutslipFromReceiving(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> receiving,
) {
  return showCreateOutslipDialog(
    context,
    api,
    initialReceivingDbId: fieldDbId(receiving),
  );
}

Future<Map<String, dynamic>?> approveOutslip(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> outslip,
) async {
  final id = fieldDbId(outslip);
  if (id.isEmpty) return null;

  final ok = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Approve outslip?'),
      content: Text('Approve ${outslip['id'] ?? id}?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Approve')),
      ],
    ),
  );
  if (ok != true) return null;

  try {
    final response = await api.post('/outslips/$id/approve');
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Outslip approved.')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}

Future<Map<String, dynamic>?> dispatchOutslip(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> outslip,
) async {
  final id = fieldDbId(outslip);
  if (id.isEmpty) return null;

  final ok = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Dispatch outslip?'),
      content: Text('Dispatch ${outslip['id'] ?? id}?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Dispatch')),
      ],
    ),
  );
  if (ok != true) return null;

  try {
    final response = await api.post('/outslips/$id/dispatch');
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Outslip dispatched')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}

Future<Map<String, dynamic>?> updateDeliveryStatus(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> delivery,
  String status,
) async {
  final id = fieldDbId(delivery);
  if (id.isEmpty) return null;

  final label = fieldStatusLabel(status);
  final ok = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text('Mark as $label?'),
      content: Text('Update ${delivery['id'] ?? id} to "$label".'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Update')),
      ],
    ),
  );
  if (ok != true) return null;

  try {
    final response = await api.post('/delivery-receipts/$id/status', {'status': status});
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Updated to $label')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}

Future<Map<String, dynamic>?> recordBillingPayment(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> billing,
) async {
  final id = fieldRowId(billing);
  if (id.isEmpty) return null;

  final total = (billing['total'] as num?)?.toDouble() ?? 0;
  final paid = (billing['paidAmount'] as num?)?.toDouble() ?? 0;
  final remaining = (total - paid).clamp(0, double.infinity);
  final amountController = TextEditingController(text: remaining.toStringAsFixed(2));
  final referenceController = TextEditingController();
  final remarksController = TextEditingController();

  final confirmed = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Record payment'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Balance: ${fieldFormatMoney(remaining)}'),
            const SizedBox(height: 12),
            TextField(
              controller: amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(labelText: 'Amount'),
            ),
            TextField(
              controller: referenceController,
              decoration: const InputDecoration(labelText: 'Reference (optional)'),
            ),
            TextField(
              controller: remarksController,
              decoration: const InputDecoration(labelText: 'Remarks (optional)'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Save')),
      ],
    ),
  );
  if (confirmed != true) return null;

  final amount = double.tryParse(amountController.text.trim());
  if (amount == null || amount <= 0) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid payment amount.')),
      );
    }
    return null;
  }

  try {
    final response = await api.post('/billings/$id/payments', {
      'amount': amount,
      'date': DateTime.now().toIso8601String().split('T').first,
      if (referenceController.text.trim().isNotEmpty) 'reference': referenceController.text.trim(),
      if (remarksController.text.trim().isNotEmpty) 'remarks': remarksController.text.trim(),
    });
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Payment recorded.')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}

Future<Map<String, dynamic>?> approveQuotation(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> quotation,
) async {
  final id = fieldRowId(quotation);
  if (id.isEmpty) return null;

  final ok = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Approve quotation?'),
      content: Text('Approve ${quotation['id'] ?? id}?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Approve')),
      ],
    ),
  );
  if (ok != true) return null;

  try {
    final response = await api.put('/quotations/$id', {'status': 'approved'});
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Quotation approved.')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}

Future<Map<String, dynamic>?> cancelQuotation(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> quotation,
) async {
  final id = fieldRowId(quotation);
  if (id.isEmpty) return null;

  final ok = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Cancel quotation?'),
      content: Text('Cancel ${quotation['id'] ?? id}?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Back')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Cancel')),
      ],
    ),
  );
  if (ok != true) return null;

  try {
    final response = await api.post('/quotations/$id/cancel');
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Quotation cancelled.')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}

Future<Map<String, dynamic>?> convertQuotationToPo(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> quotation,
) async {
  final id = fieldRowId(quotation);
  if (id.isEmpty) return null;

  List<Map<String, dynamic>> suppliers = [];
  try {
    suppliers = (await api.getList('/setup/suppliers')).cast<Map<String, dynamic>>();
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }

  final active = suppliers.where((s) => s['status'] != 'Inactive').toList();
  if (active.isEmpty) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No active suppliers found in setup.')),
      );
    }
    return null;
  }

  var supplierId = active.first['id']?.toString() ?? '';
  if (!context.mounted) return null;
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (context) => StatefulBuilder(
      builder: (context, setDialogState) => AlertDialog(
        title: const Text('Convert to purchase order'),
        content: DropdownButtonFormField<String>(
          value: supplierId,
          decoration: const InputDecoration(labelText: 'Supplier'),
          items: active
              .map(
                (s) => DropdownMenuItem(
                  value: s['id']?.toString() ?? '',
                  child: Text(s['name']?.toString() ?? 'Supplier'),
                ),
              )
              .toList(),
          onChanged: (value) => setDialogState(() => supplierId = value ?? supplierId),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Convert')),
        ],
      ),
    ),
  );
  if (confirmed != true || supplierId.isEmpty) return null;

  try {
    final response = await api.post('/quotations/$id/convert-to-po', {
      'supplierId': int.parse(supplierId),
    });
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Purchase order created from quotation.')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}

Future<Map<String, dynamic>?> confirmCreateBilling(
  BuildContext context,
  ApiClient api,
  Map<String, dynamic> delivery,
) async {
  final deliveryId = int.tryParse(fieldDbId(delivery));
  if (deliveryId == null) return null;

  final ok = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Create billing?'),
      content: Text('Create billing for ${delivery['id'] ?? 'delivery'}?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Create')),
      ],
    ),
  );
  if (ok != true) return null;

  try {
    final response = await api.post('/billings', {'deliveryId': deliveryId});
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Billing statement created.')),
      );
    }
    return recordFromPayload(response);
  } catch (error) {
    if (!context.mounted) return null;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    return null;
  }
}
