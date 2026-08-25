import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../services/offline_cache.dart';
import '../navigation/mobile_modules.dart';
import '../navigation/transaction_detail_host.dart';
import '../services/transaction_actions.dart';
import '../theme/app_theme.dart';
import '../widgets/field_ui.dart';

class BillingPage extends StatefulWidget {
  const BillingPage({super.key, required this.api});

  final ApiClient api;

  @override
  State<BillingPage> createState() => _BillingPageState();
}

class _BillingPageState extends State<BillingPage> {
  bool _loading = true;
  bool _fromCache = false;
  String? _busyId;
  String? _error;
  String? _offlineLabel;
  String _filter = 'action';
  List<Map<String, dynamic>> _rows = [];

  List<Map<String, dynamic>> get _visible {
    switch (_filter) {
      case 'action':
        return _rows.where((r) => r['paymentStatus'] != 'paid').toList();
      case 'paid':
        return _rows.where((r) => r['paymentStatus'] == 'paid').toList();
      default:
        return _rows;
    }
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
      _fromCache = false;
      _offlineLabel = null;
    });
    try {
      final data = await widget.api.getList('/billings');
      await OfflineCache.saveList(OfflineCache.billings, data);
      if (!mounted) return;
      setState(() {
        _rows = data.cast<Map<String, dynamic>>();
        _loading = false;
      });
    } catch (error) {
      final cached = await OfflineCache.loadList(OfflineCache.billings);
      if (!mounted) return;
      if (cached.rows.isNotEmpty) {
        setState(() {
          _rows = cached.rows;
          _fromCache = true;
          _offlineLabel = OfflineCache.staleLabel(cached.savedAt);
          _error = friendlyApiError(error);
          _loading = false;
        });
      } else {
        setState(() {
          _error = friendlyApiError(error);
          _loading = false;
        });
      }
    }
  }

  Future<void> _recordPayment(Map<String, dynamic> row) async {
    if (_fromCache) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Offline')));
      return;
    }
    final id = fieldRowId(row);
    if (id.isEmpty || _busyId != null) return;

    final total = (row['total'] as num?)?.toDouble() ?? 0;
    final paid = (row['paidAmount'] as num?)?.toDouble() ?? 0;
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
    if (confirmed != true) return;

    final amount = double.tryParse(amountController.text.trim());
    if (amount == null || amount <= 0) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid payment amount.')),
      );
      return;
    }

    setState(() => _busyId = id);
    try {
      await widget.api.post('/billings/$id/payments', {
        'amount': amount,
        'date': DateTime.now().toIso8601String().split('T').first,
        if (referenceController.text.trim().isNotEmpty) 'reference': referenceController.text.trim(),
        if (remarksController.text.trim().isNotEmpty) 'remarks': remarksController.text.trim(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payment recorded.')));
      await _load();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    } finally {
      if (mounted) setState(() => _busyId = null);
    }
  }

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && _rows.isEmpty && _error == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final visible = _visible;

    return RefreshIndicator(
      onRefresh: _load,
      color: AppTheme.maroon,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        children: [
          FieldFilterBar(
            value: _filter,
            options: const [
              (id: 'action', label: 'Unpaid'),
              (id: 'paid', label: 'Paid'),
              (id: 'all', label: 'All'),
            ],
            onChanged: (value) => setState(() => _filter = value),
          ),
          if (_fromCache && _offlineLabel != null) FieldOfflineBanner(label: _offlineLabel!),
          if (_error != null && !_fromCache) FieldErrorBanner(message: _error!, onRetry: _load),
          if (visible.isEmpty && (_error == null || _fromCache))
            const FieldEmptyState(
              icon: Icons.receipt_long_outlined,
              title: 'No billing records',
            ),
          ...visible.map((row) {
            final id = fieldRowId(row);
            final status = row['paymentStatus']?.toString() ?? 'unpaid';
            final busy = _busyId == id;
            final showPayment = canRecordBillingPayment(row);

            return Card(
              child: InkWell(
                onTap: () => pushTransactionDetail(
                  context,
                  widget.api,
                  MobileModule.billing,
                  row,
                ),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              row['id']?.toString() ?? 'BS',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                            ),
                          ),
                          FieldStatusChip(status),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(row['customerName']?.toString() ?? 'Customer —'),
                      Text(
                        '${row['displayDate'] ?? row['billingDate'] ?? '—'} · '
                        'DR: ${row['referenceDrId'] ?? '—'} · '
                        '${fieldFormatMoney(row['total'])}',
                      ),
                      if (showPayment) ...[
                        const SizedBox(height: 8),
                        FilledButton(
                          onPressed: busy || _fromCache ? null : () => _recordPayment(row),
                          child: Text(busy ? 'Saving…' : 'Record payment'),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class BillingDetailPage extends StatelessWidget {
  const BillingDetailPage({
    super.key,
    required this.billing,
    this.popAfterMutations = true,
    this.onRecordPayment,
  });

  final Map<String, dynamic> billing;
  final bool popAfterMutations;
  final Future<void> Function()? onRecordPayment;

  @override
  Widget build(BuildContext context) {
    final payments = (billing['payments'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();

    return FieldDetailScaffold(
      title: billing['id']?.toString() ?? 'Billing',
      subtitle: billing['customerName']?.toString() ?? 'Customer —',
      status: billing['paymentStatus']?.toString(),
      actions: onRecordPayment == null
          ? null
          : [
              FilledButton(
                onPressed: () async {
                  await onRecordPayment!();
                  if (popAfterMutations && context.mounted) Navigator.pop(context);
                },
                child: const Text('Record payment'),
              ),
            ],
      children: [
        const SizedBox(height: 12),
        Text(
          'Billing date: ${billing['displayDate'] ?? billing['billingDate'] ?? '—'}',
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
        Text(
          'Delivery receipt: ${billing['referenceDrId'] ?? '—'}',
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
        Text(
          'Total: ${fieldFormatMoney(billing['total'])}',
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
        Text(
          'Paid: ${fieldFormatMoney(billing['paidAmount'] ?? 0)}',
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
        if (payments.isNotEmpty) ...[
          const SizedBox(height: 16),
          const FieldSectionTitle('Payments'),
          ...payments.map(
            (payment) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Text(
                '${payment['id'] ?? 'Payment'} · ${fieldFormatMoney(payment['amount'])} · '
                '${payment['displayDate'] ?? payment['date'] ?? '—'}',
                style: const TextStyle(color: AppTheme.textSecondary),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
