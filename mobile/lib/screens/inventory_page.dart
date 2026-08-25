import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../services/offline_cache.dart';
import '../theme/app_theme.dart';
import '../widgets/field_ui.dart';

class InventoryPage extends StatefulWidget {
  const InventoryPage({super.key, required this.api});

  final ApiClient api;

  @override
  State<InventoryPage> createState() => _InventoryPageState();
}

class _InventoryPageState extends State<InventoryPage> {
  bool _loading = true;
  bool _fromCache = false;
  String? _error;
  String? _offlineLabel;
  Map<String, dynamic>? _report;

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
      _fromCache = false;
      _offlineLabel = null;
    });
    try {
      final data = await widget.api.getData('/reports/inventory');
      await OfflineCache.saveMap(OfflineCache.inventory, data);
      if (!mounted) return;
      setState(() {
        _report = data;
        _loading = false;
      });
    } catch (error) {
      final cached = await OfflineCache.loadMap(OfflineCache.inventory);
      if (!mounted) return;
      if (cached.data != null) {
        setState(() {
          _report = cached.data;
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

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading && _report == null && _error == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final summary = (_report?['summary'] as Map?)?.cast<String, dynamic>() ?? {};
    final stock = (_report?['stock'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();

    return RefreshIndicator(
      onRefresh: _load,
      color: AppTheme.maroon,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        children: [
          if (_fromCache && _offlineLabel != null) FieldOfflineBanner(label: _offlineLabel!),
          if (_error != null && !_fromCache) FieldErrorBanner(message: _error!, onRetry: _load),
          Row(
            children: [
              Expanded(child: _SummaryTile(label: 'Products', value: '${summary['itemCount'] ?? 0}')),
              const SizedBox(width: 8),
              Expanded(child: _SummaryTile(label: 'Total stock', value: '${summary['totalQuantity'] ?? 0}')),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: _SummaryTile(
                  label: 'Low stock',
                  value: '${summary['lowStock'] ?? 0}',
                  accent: AppTheme.warningText,
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _SummaryTile(
                  label: 'Out of stock',
                  value: '${summary['outOfStock'] ?? 0}',
                  accent: AppTheme.errorText,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const FieldSectionTitle('Current stock'),
          if (stock.isEmpty && (_error == null || _fromCache))
            const FieldEmptyState(
              icon: Icons.inventory_outlined,
              title: 'No inventory data',
            ),
          ...stock.map((item) {
            final status = item['status']?.toString() ?? '';
            return Card(
              child: ListTile(
                title: Text(item['productName']?.toString() ?? 'Product'),
                subtitle: Text(
                  'SKU: ${item['sku'] ?? '—'} · Qty ${item['quantity'] ?? 0}',
                ),
                trailing: FieldStatusChip(status),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _SummaryTile extends StatelessWidget {
  const _SummaryTile({
    required this.label,
    required this.value,
    this.accent,
  });

  final String label;
  final String value;
  final Color? accent;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: accent ?? AppTheme.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
