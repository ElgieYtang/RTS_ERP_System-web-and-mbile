import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../services/offline_cache.dart';
import '../services/transaction_actions.dart';
import '../services/transaction_lists.dart';
import '../navigation/mobile_modules.dart';
import '../navigation/transaction_detail_host.dart';
import '../navigation/transaction_navigation.dart';
import '../theme/app_theme.dart';
import '../widgets/field_ui.dart';
import '../widgets/print_document_button.dart';
import '../widgets/transaction_workflows.dart';

class ReceivingsPage extends StatefulWidget {
  const ReceivingsPage({super.key, required this.api});

  final ApiClient api;

  @override
  State<ReceivingsPage> createState() => _ReceivingsPageState();
}

class _ReceivingsPageState extends State<ReceivingsPage> {
  bool _loading = true;
  bool _fromCache = false;
  String? _busyId;
  String? _error;
  String? _offlineLabel;
  String _filter = 'open';
  List<Map<String, dynamic>> _rows = [];
  TransactionLists _lists = const TransactionLists();

  @override
  void initState() {
    super.initState();
    _load();
  }

  List<Map<String, dynamic>> get _visible {
    switch (_filter) {
      case 'open':
        return _rows.where((r) => r['status'] != 'completed').toList();
      case 'completed':
        return _rows.where((r) => r['status'] == 'completed').toList();
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
      final results = await Future.wait([
        widget.api.getList('/receivings'),
        TransactionLists.load(widget.api),
      ]);
      final data = results[0] as List<dynamic>;
      final lists = results[1] as TransactionLists;
      await OfflineCache.saveList(OfflineCache.receivings, data);
      if (!mounted) return;
      setState(() {
        _rows = data.cast<Map<String, dynamic>>();
        _lists = lists;
        _loading = false;
      });
    } catch (error) {
      final cached = await OfflineCache.loadList(OfflineCache.receivings);
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

  Future<void> _confirm(Map<String, dynamic> row) async {
    if (_fromCache) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Offline')),
      );
      return;
    }

    final id = row['dbId']?.toString() ?? row['id']?.toString();
    if (id == null || _busyId != null) return;
    if (!canConfirmReceiving(row)) return;

    setState(() => _busyId = id);
    try {
      final updated = await confirmReceiving(context, widget.api, row);
      if (updated != null) await _load();
    } finally {
      if (mounted) setState(() => _busyId = null);
    }
  }

  Future<void> _createOutslip(Map<String, dynamic> row, {bool popCurrentRoute = false}) async {
    if (_fromCache) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Offline')));
      return;
    }
    if (!canCreateOutslipFromReceiving(row, _lists)) return;

    final created = await createOutslipFromReceiving(context, widget.api, row);
    if (created != null) {
      await _load();
      if (!mounted) return;
      await openCreatedTransaction(
        context,
        widget.api,
        MobileModule.outslips,
        created,
        popCurrentRoute: popCurrentRoute,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && _rows.isEmpty && _error == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final visible = _visible;

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        children: [
          FieldFilterBar(
            value: _filter,
            options: const [
              (id: 'open', label: 'Open'),
              (id: 'completed', label: 'Completed'),
              (id: 'all', label: 'All'),
            ],
            onChanged: (value) => setState(() => _filter = value),
          ),
          if (_fromCache && _offlineLabel != null) FieldOfflineBanner(label: _offlineLabel!),
          if (_error != null && !_fromCache) FieldErrorBanner(message: _error!, onRetry: _load),
          if (visible.isEmpty && (_error == null || _fromCache))
            FieldEmptyState(
              icon: Icons.inventory_2_outlined,
              title: _filter == 'open' ? 'No open receivings' : 'No receivings',
            ),
          ...visible.map((row) {
            final id = row['dbId']?.toString() ?? row['id']?.toString() ?? '';
            final status = row['status']?.toString() ?? '';
            final pending = canConfirmReceiving(row);
            final canCreateOutslip = canCreateOutslipFromReceiving(row, _lists);
            final itemCount = (row['items'] as List<dynamic>? ?? const []).length;
            final busy = _busyId == id;

            return Card(
              child: ListTile(
                title: Text(row['id']?.toString() ?? 'Receiving'),
                subtitle: Text(
                  '${row['supplierName']?.toString().isNotEmpty == true ? row['supplierName'] : '—'} · '
                  '${row['displayDate'] ?? row['date'] ?? '—'}\n'
                  'PO: ${row['purchaseOrderId'] ?? '—'} · $itemCount item(s)',
                ),
                isThreeLine: true,
                trailing: pending
                    ? FilledButton(
                        onPressed: busy || _fromCache ? null : () => _confirm(row),
                        child: Text(busy ? '…' : 'Confirm'),
                      )
                    : canCreateOutslip
                        ? FilledButton.tonal(
                            onPressed: _fromCache ? null : () => _createOutslip(row),
                            child: const Text('Create outslip'),
                          )
                        : FieldStatusChip(status),
                onTap: () async {
                  await pushTransactionDetail(
                    context,
                    widget.api,
                    MobileModule.receiving,
                    row,
                  );
                  await _load();
                },
              ),
            );
          }),
        ],
      ),
    );
  }
}

class ReceivingDetailPage extends StatelessWidget {
  const ReceivingDetailPage({
    super.key,
    required this.receivingId,
    required this.initial,
    this.popAfterMutations = true,
    this.onConfirm,
    this.onCreateOutslip,
  });

  final String receivingId;
  final Map<String, dynamic> initial;
  final bool popAfterMutations;
  final Future<void> Function()? onConfirm;
  final Future<void> Function()? onCreateOutslip;

  @override
  Widget build(BuildContext context) {
    final items = (initial['items'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
    final pending = initial['status']?.toString() != 'completed';
    final supplier = initial['supplierName']?.toString().isNotEmpty == true
        ? initial['supplierName'].toString()
        : 'Supplier —';

    return FieldDetailScaffold(
      title: initial['id']?.toString() ?? 'Receiving',
      subtitle: supplier,
      status: initial['status']?.toString(),
      primaryActions: [
        if (pending && onConfirm != null)
          FilledButton(
            onPressed: () async {
              await onConfirm!();
              if (popAfterMutations && context.mounted) Navigator.pop(context);
            },
            child: const Text('Confirm receiving'),
          ),
        if (!pending && onCreateOutslip != null)
          FilledButton.tonal(
            onPressed: () async => onCreateOutslip!(),
            child: const Text('Create outslip'),
          ),
      ],
      secondaryActions: [
        PrintDocumentButton(
          onPrint: () => printReceiving(initial),
          label: 'Print PDF',
        ),
      ],
      children: [
        FieldDetailMeta(
          rows: [
            (label: 'Date', value: '${initial['displayDate'] ?? initial['date'] ?? '—'}'),
            (label: 'PO', value: '${initial['purchaseOrderId'] ?? '—'}'),
          ],
        ),
        if ((initial['remarks']?.toString() ?? '').isNotEmpty) ...[
          const SizedBox(height: 10),
          Text(
            initial['remarks'].toString(),
            style: const TextStyle(fontSize: 14, height: 1.5, color: AppTheme.textSecondary),
          ),
        ],
        const SizedBox(height: 16),
        const FieldSectionTitle('Line items'),
        FieldLineItems(items: items),
      ],
    );
  }
}
