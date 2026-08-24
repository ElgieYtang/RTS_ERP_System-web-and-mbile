import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../services/offline_cache.dart';
import '../theme/app_theme.dart';
import '../widgets/field_ui.dart';

class OutslipsPage extends StatefulWidget {
  const OutslipsPage({super.key, required this.api});

  final ApiClient api;

  @override
  State<OutslipsPage> createState() => _OutslipsPageState();
}

class _OutslipsPageState extends State<OutslipsPage> {
  bool _loading = true;
  bool _fromCache = false;
  String? _busyId;
  String? _error;
  String? _offlineLabel;
  String _filter = 'action';
  List<Map<String, dynamic>> _rows = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  List<Map<String, dynamic>> get _visible {
    switch (_filter) {
      case 'action':
        return _rows
            .where((r) => r['status'] == 'pending' || r['status'] == 'approved')
            .toList();
      case 'ready':
        return _rows.where((r) => r['status'] == 'for_dispatch').toList();
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
      final data = await widget.api.getList('/outslips');
      await OfflineCache.saveList(OfflineCache.outslips, data);
      if (!mounted) return;
      setState(() {
        _rows = data.cast<Map<String, dynamic>>();
        _loading = false;
      });
    } catch (error) {
      final cached = await OfflineCache.loadList(OfflineCache.outslips);
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

  Future<void> _approve(Map<String, dynamic> row) async {
    if (_fromCache) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Offline')),
      );
      return;
    }

    final id = row['dbId']?.toString() ?? row['id']?.toString();
    if (id == null || _busyId != null) return;

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Approve outslip?'),
        content: Text('Approve ${row['id'] ?? id}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Approve')),
        ],
      ),
    );
    if (ok != true) return;

    setState(() => _busyId = id);
    try {
      await widget.api.post('/outslips/$id/approve');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Outslip approved.')),
      );
      await _load();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    } finally {
      if (mounted) setState(() => _busyId = null);
    }
  }

  Future<void> _dispatch(Map<String, dynamic> row) async {
    if (_fromCache) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Offline')),
      );
      return;
    }

    final id = row['dbId']?.toString() ?? row['id']?.toString();
    if (id == null || _busyId != null) return;

    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Dispatch outslip?'),
        content: Text('Dispatch ${row['id'] ?? id}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Dispatch')),
        ],
      ),
    );
    if (ok != true) return;

    setState(() => _busyId = id);
    try {
      await widget.api.post('/outslips/$id/dispatch');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Outslip dispatched')),
      );
      await _load();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    } finally {
      if (mounted) setState(() => _busyId = null);
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
              (id: 'action', label: 'Needs action'),
              (id: 'ready', label: 'For dispatch'),
              (id: 'all', label: 'All'),
            ],
            onChanged: (value) => setState(() => _filter = value),
          ),
          if (_fromCache && _offlineLabel != null) FieldOfflineBanner(label: _offlineLabel!),
          if (_error != null && !_fromCache) FieldErrorBanner(message: _error!, onRetry: _load),
          if (visible.isEmpty && (_error == null || _fromCache))
            FieldEmptyState(
              icon: Icons.outbox_outlined,
              title: _filter == 'action' ? 'No outslips needing action' : 'No outslips',
            ),
          ...visible.map((row) {
            final id = row['dbId']?.toString() ?? row['id']?.toString() ?? '';
            final status = row['status']?.toString() ?? '';
            final itemCount = (row['items'] as List<dynamic>? ?? const []).length;
            final busy = _busyId == id;

            return Card(
              child: InkWell(
                onTap: () async {
                  await Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => OutslipDetailPage(
                        outslip: row,
                        onApprove: status == 'pending' && !_fromCache ? () => _approve(row) : null,
                        onDispatch: status == 'approved' && !_fromCache ? () => _dispatch(row) : null,
                      ),
                    ),
                  );
                  await _load();
                },
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              row['id']?.toString() ?? 'OS',
                              style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                            ),
                          ),
                          FieldStatusChip(status),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(row['customerName']?.toString().isNotEmpty == true
                          ? row['customerName'].toString()
                          : 'Customer —'),
                      Text(
                        '${row['displayDate'] ?? row['date'] ?? '—'} · '
                        'RCV: ${row['receivingId'] ?? '—'} · '
                        '$itemCount item(s)',
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          if (status == 'pending')
                            FilledButton(
                              onPressed: busy || _fromCache ? null : () => _approve(row),
                              child: Text(busy ? '…' : 'Approve'),
                            ),
                          if (status == 'approved')
                            FilledButton(
                              onPressed: busy || _fromCache ? null : () => _dispatch(row),
                              child: Text(busy ? '…' : 'Dispatch'),
                            ),
                          if (status == 'for_dispatch')
                            const FieldStatusChip('for_dispatch'),
                        ],
                      ),
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

class OutslipDetailPage extends StatelessWidget {
  const OutslipDetailPage({
    super.key,
    required this.outslip,
    this.onApprove,
    this.onDispatch,
  });

  final Map<String, dynamic> outslip;
  final Future<void> Function()? onApprove;
  final Future<void> Function()? onDispatch;

  @override
  Widget build(BuildContext context) {
    final status = outslip['status']?.toString() ?? '';
    final items = (outslip['items'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
    final customer = outslip['customerName']?.toString().isNotEmpty == true
        ? outslip['customerName'].toString()
        : 'Customer —';

    return FieldDetailScaffold(
      title: outslip['id']?.toString() ?? 'Outslip',
      subtitle: customer,
      status: status,
      actions: [
        if (onApprove != null)
          FilledButton(
            onPressed: () async {
              await onApprove!();
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Approve outslip'),
          ),
        if (onDispatch != null) ...[
          if (onApprove != null) const SizedBox(height: 8),
          FilledButton(
            onPressed: () async {
              await onDispatch!();
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Dispatch'),
          ),
        ],
      ],
      children: [
        const SizedBox(height: 12),
        Text(
          'Date: ${outslip['displayDate'] ?? outslip['date'] ?? '—'}',
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
        Text(
          'Receiving ID: ${outslip['receivingId'] ?? '—'}',
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
        const SizedBox(height: 16),
        const FieldSectionTitle('Line items'),
        FieldLineItems(items: items),
      ],
    );
  }
}
