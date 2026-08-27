import 'package:flutter/material.dart';

import '../navigation/app_navigation.dart';
import '../navigation/mobile_modules.dart';
import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../services/transaction_actions.dart';
import '../services/transaction_lists.dart';
import '../navigation/module_navigation_scope.dart';
import 'transaction_navigation.dart';
import '../widgets/transaction_workflows.dart';

/// Detail screen with live workflow buttons — used for list open and post-create navigation.
class TransactionDetailHost extends StatefulWidget {
  const TransactionDetailHost({
    super.key,
    required this.api,
    required this.module,
    required this.initialRecord,
  });

  final ApiClient api;
  final MobileModule module;
  final Map<String, dynamic> initialRecord;

  @override
  State<TransactionDetailHost> createState() => _TransactionDetailHostState();
}

class _TransactionDetailHostState extends State<TransactionDetailHost> {
  late Map<String, dynamic> _record;
  TransactionLists _lists = const TransactionLists();
  bool _loadingLists = true;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _record = Map<String, dynamic>.from(widget.initialRecord);
    _loadLists();
  }

  Future<void> _loadLists() async {
    setState(() => _loadingLists = true);
    try {
      final lists = await TransactionLists.load(widget.api);
      if (!mounted) return;
      setState(() {
        _lists = lists;
        _loadingLists = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() => _loadingLists = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(friendlyApiError(error))),
      );
    }
  }

  Future<void> _handoff(MobileModule module, Map<String, dynamic> record) async {
    if (!mounted) return;
    await Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => wrapModuleNavigationScope(
          context,
          TransactionDetailHost(
            api: widget.api,
            module: module,
            initialRecord: record,
          ),
        ),
      ),
    );
  }

  Future<void> _refreshRecord(Map<String, dynamic> record) async {
    if (!mounted) return;
    setState(() => _record = record);
    await _loadLists();
  }

  Future<void> _run(Future<void> Function() action) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      await action();
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loadingLists) {
      return Scaffold(
        appBar: transactionAppBar(context, title: _titleForRecord(), showBack: true),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    return buildTransactionDetailPage(
      api: widget.api,
      module: widget.module,
      record: _record,
      popAfterMutations: false,
      canReceive: widget.module == MobileModule.purchaseOrders &&
          canReceivePurchaseOrder(_record, _lists),
      onReceive: widget.module == MobileModule.purchaseOrders &&
              canReceivePurchaseOrder(_record, _lists)
          ? () => _run(() async {
                final next = await receivePurchaseOrder(
                  context,
                  widget.api,
                  _record,
                  _lists,
                );
                if (next != null) await _handoff(MobileModule.receiving, next);
              })
          : null,
      onConfirm: widget.module == MobileModule.receiving && canConfirmReceiving(_record)
          ? () => _run(() async {
                final updated = await confirmReceiving(context, widget.api, _record);
                if (updated != null) await _refreshRecord(updated);
              })
          : null,
      onCreateOutslip: widget.module == MobileModule.receiving &&
              canCreateOutslipFromReceiving(_record, _lists)
          ? () => _run(() async {
                final next = await createOutslipFromReceiving(
                  context,
                  widget.api,
                  _record,
                );
                if (next != null) await _handoff(MobileModule.outslips, next);
              })
          : null,
      onApprove: widget.module == MobileModule.outslips && canApproveOutslip(_record)
          ? () => _run(() async {
                final updated = await approveOutslip(context, widget.api, _record);
                if (updated != null) await _refreshRecord(updated);
              })
          : null,
      onDispatch: widget.module == MobileModule.outslips && canDispatchOutslip(_record)
          ? () => _run(() async {
                final updated = await dispatchOutslip(context, widget.api, _record);
                if (updated != null) await _refreshRecord(updated);
              })
          : null,
      onCreateDr: widget.module == MobileModule.outslips &&
              canCreateDrFromOutslip(_record, _lists)
          ? () => _run(() async {
                final next = await confirmCreateDeliveryReceipt(
                  context,
                  widget.api,
                  _record,
                );
                if (next != null) await _handoff(MobileModule.deliveries, next);
              })
          : null,
      onSetStatus: widget.module == MobileModule.deliveries &&
              (canMarkDeliveryOut(_record) || canMarkDeliveryDelivered(_record))
          ? (status) => _run(() async {
                final updated = await updateDeliveryStatus(
                  context,
                  widget.api,
                  _record,
                  status,
                );
                if (updated != null) await _refreshRecord(updated);
              })
          : null,
      onCreateBilling: widget.module == MobileModule.deliveries &&
              canCreateBillingFromDelivery(_record, _lists)
          ? () => _run(() async {
                final next = await confirmCreateBilling(context, widget.api, _record);
                if (next != null) await _handoff(MobileModule.billing, next);
              })
          : null,
      onRecordPayment: widget.module == MobileModule.billing &&
              canRecordBillingPayment(_record)
          ? () => _run(() async {
                final updated = await recordBillingPayment(
                  context,
                  widget.api,
                  _record,
                );
                if (updated != null) await _refreshRecord(updated);
              })
          : null,
      onApproveQuotation: widget.module == MobileModule.quotations &&
              canApproveQuotation(_record)
          ? () => _run(() async {
                final updated = await approveQuotation(context, widget.api, _record);
                if (updated != null) await _refreshRecord(updated);
              })
          : null,
      onConvert: widget.module == MobileModule.quotations &&
              canConvertQuotation(_record, _lists)
          ? () => _run(() async {
                final next = await convertQuotationToPo(context, widget.api, _record);
                if (next != null) await _handoff(MobileModule.purchaseOrders, next);
              })
          : null,
      onCancel: widget.module == MobileModule.quotations &&
              canCancelQuotation(_record, _lists)
          ? () => _run(() async {
                final updated = await cancelQuotation(context, widget.api, _record);
                if (updated != null) await _refreshRecord(updated);
              })
          : null,
      onEdit: widget.module == MobileModule.quotations && canEditQuotation(_record, _lists)
          ? () => _run(() async {
                final updated = await editQuotation(context, widget.api, _record);
                if (updated != null) await _refreshRecord(updated);
              })
          : null,
    );
  }

  String _titleForRecord() {
    return _record['id']?.toString() ?? mobileModuleTitle(widget.module);
  }
}

Future<void> pushTransactionDetail(
  BuildContext context,
  ApiClient api,
  MobileModule module,
  Map<String, dynamic> record,
) {
  return Navigator.of(context).push(
    MaterialPageRoute(
      builder: (_) => wrapModuleNavigationScope(
        context,
        TransactionDetailHost(
          api: api,
          module: module,
          initialRecord: record,
        ),
      ),
    ),
  );
}
