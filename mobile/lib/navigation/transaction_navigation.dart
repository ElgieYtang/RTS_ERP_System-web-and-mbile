import 'package:flutter/material.dart';

import '../navigation/mobile_modules.dart';
import '../screens/billing_page.dart';
import '../screens/deliveries_page.dart';
import '../screens/outslips_page.dart';
import '../screens/purchase_orders_page.dart';
import '../screens/quotations_page.dart';
import '../screens/receivings_page.dart';
import '../services/api_client.dart';
import 'transaction_detail_host.dart';

Map<String, dynamic>? recordFromPayload(Map<String, dynamic> payload) {
  final data = payload['data'];
  if (data is Map) return Map<String, dynamic>.from(data);
  return null;
}

/// Opens a transaction detail screen with full workflow actions.
Future<void> openCreatedTransaction(
  BuildContext context,
  ApiClient api,
  MobileModule module,
  Map<String, dynamic> record, {
  bool popCurrentRoute = false,
}) async {
  if (!context.mounted) return;
  if (popCurrentRoute && Navigator.canPop(context)) {
    Navigator.pop(context);
  }
  if (!context.mounted) return;

  await pushTransactionDetail(context, api, module, record);
}

Widget buildTransactionDetailPage({
  required ApiClient api,
  required MobileModule module,
  required Map<String, dynamic> record,
  bool popAfterMutations = true,
  bool canReceive = false,
  Future<void> Function()? onReceive,
  Future<void> Function()? onConfirm,
  Future<void> Function()? onCreateOutslip,
  Future<void> Function()? onApprove,
  Future<void> Function()? onDispatch,
  Future<void> Function()? onCreateDr,
  Future<void> Function(String status)? onSetStatus,
  Future<void> Function()? onCreateBilling,
  Future<void> Function()? onRecordPayment,
  Future<void> Function()? onApproveQuotation,
  Future<void> Function()? onConvert,
  Future<void> Function()? onCancel,
  Future<void> Function()? onEdit,
}) {
  switch (module) {
    case MobileModule.purchaseOrders:
      return PurchaseOrderDetailPage(
        api: api,
        order: record,
        canReceive: canReceive,
        onReceive: onReceive,
      );
    case MobileModule.receiving:
      return ReceivingDetailPage(
        receivingId: record['dbId']?.toString() ?? record['id']?.toString() ?? '',
        initial: record,
        popAfterMutations: popAfterMutations,
        onConfirm: onConfirm,
        onCreateOutslip: onCreateOutslip,
      );
    case MobileModule.outslips:
      return OutslipDetailPage(
        outslip: record,
        popAfterMutations: popAfterMutations,
        onApprove: onApprove,
        onDispatch: onDispatch,
        onCreateDr: onCreateDr,
      );
    case MobileModule.deliveries:
      return DeliveryDetailPage(
        api: api,
        delivery: record,
        popAfterMutations: popAfterMutations,
        onSetStatus: onSetStatus,
        onCreateBilling: onCreateBilling,
      );
    case MobileModule.billing:
      return BillingDetailPage(
        billing: record,
        popAfterMutations: popAfterMutations,
        onRecordPayment: onRecordPayment,
      );
    case MobileModule.quotations:
      return QuotationDetailPage(
        api: api,
        quotation: record,
        popAfterMutations: popAfterMutations,
        onApprove: onApproveQuotation,
        onConvert: onConvert,
        onCancel: onCancel,
        onEdit: onEdit,
      );
    default:
      return Scaffold(
        appBar: AppBar(title: Text(record['id']?.toString() ?? 'Record')),
        body: Center(child: Text('${record['id'] ?? 'Record'} created.')),
      );
  }
}
