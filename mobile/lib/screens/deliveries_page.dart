import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../services/offline_cache.dart';
import '../theme/app_theme.dart';
import '../widgets/field_ui.dart';

class DeliveriesPage extends StatefulWidget {
  const DeliveriesPage({super.key, required this.api});

  final ApiClient api;

  @override
  State<DeliveriesPage> createState() => _DeliveriesPageState();
}

class _DeliveriesPageState extends State<DeliveriesPage> {
  bool _loading = true;
  bool _fromCache = false;
  String? _busyId;
  String? _error;
  String? _offlineLabel;
  String _filter = 'active';
  List<Map<String, dynamic>> _rows = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  List<Map<String, dynamic>> get _visible {
    switch (_filter) {
      case 'active':
        return _rows
            .where((r) => r['status'] == 'active' || r['status'] == 'out_for_delivery')
            .toList();
      case 'delivered':
        return _rows.where((r) => r['status'] == 'delivered').toList();
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
      final data = await widget.api.getList('/delivery-receipts');
      await OfflineCache.saveList(OfflineCache.deliveries, data);
      if (!mounted) return;
      setState(() {
        _rows = data.cast<Map<String, dynamic>>();
        _loading = false;
      });
    } catch (error) {
      final cached = await OfflineCache.loadList(OfflineCache.deliveries);
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

  Future<void> _setStatus(Map<String, dynamic> row, String status) async {
    if (_fromCache) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Offline')),
      );
      return;
    }

    final id = row['dbId']?.toString() ?? row['id']?.toString();
    if (id == null || _busyId != null) return;

    final label = fieldStatusLabel(status);
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Mark as $label?'),
        content: Text('Update ${row['id'] ?? id} to "$label".'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Update')),
        ],
      ),
    );
    if (ok != true) return;

    setState(() => _busyId = id);
    try {
      await widget.api.post('/delivery-receipts/$id/status', {'status': status});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Updated to $label')),
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
              (id: 'active', label: 'Active'),
              (id: 'delivered', label: 'Delivered'),
              (id: 'all', label: 'All'),
            ],
            onChanged: (value) => setState(() => _filter = value),
          ),
          if (_fromCache && _offlineLabel != null) FieldOfflineBanner(label: _offlineLabel!),
          if (_error != null && !_fromCache) FieldErrorBanner(message: _error!, onRetry: _load),
          if (visible.isEmpty && (_error == null || _fromCache))
            FieldEmptyState(
              icon: Icons.local_shipping_outlined,
              title: _filter == 'active' ? 'No active deliveries' : 'No deliveries',
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
                      builder: (_) => DeliveryDetailPage(
                        delivery: row,
                        onSetStatus: _fromCache ? null : (next) => _setStatus(row, next),
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
                              row['id']?.toString() ?? 'DR',
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
                        'Outslip: ${row['referenceOutslipId'] ?? '—'} · '
                        '$itemCount item(s)',
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          if (status == 'active')
                            FilledButton(
                              onPressed: busy || _fromCache
                                  ? null
                                  : () => _setStatus(row, 'out_for_delivery'),
                              child: Text(busy ? 'Updating…' : 'Out for delivery'),
                            ),
                          if (status == 'out_for_delivery' || status == 'active')
                            FilledButton.tonal(
                              onPressed:
                                  busy || _fromCache ? null : () => _setStatus(row, 'delivered'),
                              child: const Text('Mark delivered'),
                            ),
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

class DeliveryDetailPage extends StatelessWidget {
  const DeliveryDetailPage({
    super.key,
    required this.delivery,
    required this.onSetStatus,
  });

  final Map<String, dynamic> delivery;
  final Future<void> Function(String status)? onSetStatus;

  @override
  Widget build(BuildContext context) {
    final status = delivery['status']?.toString() ?? '';
    final items = (delivery['items'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
    final customer = delivery['customerName']?.toString().isNotEmpty == true
        ? delivery['customerName'].toString()
        : 'Customer —';

    return FieldDetailScaffold(
      title: delivery['id']?.toString() ?? 'Delivery',
      subtitle: customer,
      status: status,
      actions: onSetStatus == null
          ? null
          : [
              if (status == 'active')
                FilledButton(
                  onPressed: () async {
                    await onSetStatus!('out_for_delivery');
                    if (context.mounted) Navigator.pop(context);
                  },
                  child: const Text('Out for delivery'),
                ),
              if (status == 'out_for_delivery' || status == 'active') ...[
                if (status == 'active') const SizedBox(height: 8),
                FilledButton.tonal(
                  onPressed: () async {
                    await onSetStatus!('delivered');
                    if (context.mounted) Navigator.pop(context);
                  },
                  child: const Text('Mark delivered'),
                ),
              ],
            ],
      children: [
        const SizedBox(height: 12),
        Text(
          'Date: ${delivery['displayDate'] ?? delivery['date'] ?? '—'}',
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
        Text(
          'Outslip: ${delivery['referenceOutslipId'] ?? '—'}',
          style: const TextStyle(color: AppTheme.textSecondary),
        ),
        if (delivery['total'] != null)
          Text('Total: ${delivery['total']}', style: const TextStyle(color: AppTheme.textSecondary)),
        const SizedBox(height: 16),
        const FieldSectionTitle('Line items'),
        FieldLineItems(items: items),
      ],
    );
  }
}
