import '../widgets/field_ui.dart';
import 'transaction_lists.dart';

bool _idsMatch(dynamic a, dynamic b) {
  if (a == null || b == null) return false;
  return a.toString() == b.toString();
}

String? _quotationPublicId(Map<String, dynamic> quotation) =>
    quotation['id']?.toString();

Map<String, dynamic>? findPoForQuotation(
  Map<String, dynamic> quotation,
  TransactionLists lists,
) {
  final qtnId = _quotationPublicId(quotation);
  final qtnDb = fieldDbId(quotation);
  for (final po in lists.purchaseOrders) {
    if (_idsMatch(po['referenceQuotationId'], qtnId) ||
        _idsMatch(po['referenceQuotationId'], qtnDb) ||
        _idsMatch(po['referenceQuotationNo'], qtnId)) {
      return po;
    }
  }
  return null;
}

bool canApproveQuotation(Map<String, dynamic> row) =>
    row['status']?.toString() == 'pending';

/// Cancel when not already cancelled and no PO has been created from this quotation.
bool canCancelQuotation(Map<String, dynamic> row, TransactionLists lists) {
  final status = row['status']?.toString() ?? '';
  if (status == 'cancelled') return false;
  return findPoForQuotation(row, lists) == null;
}

/// Edit date/status when not cancelled and no PO has been created yet.
bool canEditQuotation(Map<String, dynamic> row, TransactionLists lists) {
  final status = row['status']?.toString() ?? '';
  if (status == 'cancelled') return false;
  return findPoForQuotation(row, lists) == null;
}

bool canConvertQuotation(Map<String, dynamic> row, TransactionLists lists) =>
    row['status']?.toString() == 'approved' && findPoForQuotation(row, lists) == null;

bool hasOpenReceivingForPo(Map<String, dynamic> po, TransactionLists lists) {
  final poDb = fieldDbId(po);
  final poNo = po['id']?.toString();
  return lists.receivings.any((row) {
    final open = row['status']?.toString() != 'completed';
    return open &&
        (_idsMatch(row['purchaseOrderDbId'], poDb) || _idsMatch(row['purchaseOrderId'], poNo));
  });
}

bool canReceivePurchaseOrder(Map<String, dynamic> po, TransactionLists lists) {
  final status = po['status']?.toString() ?? '';
  if (status == 'fully_received' || status == 'cancelled') return false;
  return !hasOpenReceivingForPo(po, lists);
}

bool canConfirmReceiving(Map<String, dynamic> row) =>
    row['status']?.toString() != 'completed';

bool hasOutslipForReceiving(Map<String, dynamic> receiving, TransactionLists lists) {
  final rcvDb = fieldDbId(receiving);
  return lists.outslips.any((row) => _idsMatch(row['receivingId'], rcvDb));
}

bool canCreateOutslipFromReceiving(
  Map<String, dynamic> receiving,
  TransactionLists lists,
) =>
    receiving['status']?.toString() == 'completed' &&
    !hasOutslipForReceiving(receiving, lists);

bool canApproveOutslip(Map<String, dynamic> row) => row['status']?.toString() == 'pending';

bool canDispatchOutslip(Map<String, dynamic> row) => row['status']?.toString() == 'approved';

bool isOutslipReadyForDr(String? status) {
  final value = (status ?? '').toLowerCase();
  return value == 'for_dispatch' || value == 'released';
}

bool hasDrForOutslip(Map<String, dynamic> outslip, TransactionLists lists) {
  final osDb = fieldDbId(outslip);
  final osNo = outslip['id']?.toString();
  return lists.deliveryReceipts.any(
    (row) =>
        _idsMatch(row['referenceOutslipDbId'], osDb) ||
        _idsMatch(row['referenceOutslipId'], osNo),
  );
}

bool canCreateDrFromOutslip(Map<String, dynamic> outslip, TransactionLists lists) =>
    isOutslipReadyForDr(outslip['status']?.toString()) && !hasDrForOutslip(outslip, lists);

bool canMarkDeliveryOut(Map<String, dynamic> row) => row['status']?.toString() == 'active';

bool canMarkDeliveryDelivered(Map<String, dynamic> row) {
  final status = row['status']?.toString() ?? '';
  return status == 'active' || status == 'out_for_delivery';
}

bool canUpdateDeliveryStatus(Map<String, dynamic> delivery, String nextStatus) {
  switch (nextStatus) {
    case 'out_for_delivery':
      return canMarkDeliveryOut(delivery);
    case 'delivered':
      return canMarkDeliveryDelivered(delivery);
    default:
      return false;
  }
}

bool hasBillingForDelivery(Map<String, dynamic> delivery, TransactionLists lists) {
  final drDb = fieldDbId(delivery);
  final drNo = delivery['id']?.toString();
  return lists.billings.any(
    (row) => _idsMatch(row['referenceDrDbId'], drDb) || _idsMatch(row['referenceDrId'], drNo),
  );
}

bool canCreateBillingFromDelivery(Map<String, dynamic> delivery, TransactionLists lists) =>
    delivery['status']?.toString() == 'delivered' && !hasBillingForDelivery(delivery, lists);

bool canRecordBillingPayment(Map<String, dynamic> row) =>
    row['paymentStatus']?.toString() != 'paid';

bool canApproveAccomplishment(Map<String, dynamic> row) {
  final status = row['status']?.toString() ?? '';
  return status != 'approved' && status != 'inactive';
}

bool canEditAccomplishment(Map<String, dynamic> row) {
  final status = row['status']?.toString() ?? '';
  return status != 'approved' && status != 'inactive';
}
