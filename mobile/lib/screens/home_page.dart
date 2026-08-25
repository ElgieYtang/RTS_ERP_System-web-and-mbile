import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../navigation/mobile_modules.dart';
import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../services/offline_cache.dart';
import '../state/auth_state.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/field_ui.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.onOpenModule});

  final ValueChanged<MobileModule> onOpenModule;

  @override
  HomePageState createState() => HomePageState();
}

class HomePageState extends State<HomePage> {
  bool _loading = true;
  bool _fromCache = false;
  String? _error;
  String? _offlineLabel;
  final Map<MobileModule, int> _counts = {};

  bool get _allQuiet => _counts.values.every((count) => count == 0);

  @override
  void initState() {
    super.initState();
    refreshCounts();
  }

  Future<void> refreshCounts() => _load();

  int _countPendingQuotations(List<dynamic> rows) =>
      rows.where((r) => r is Map && r['status'] == 'pending').length;

  int _countOpenPurchaseOrders(List<dynamic> rows) => rows
      .where((r) => r is Map && r['status'] != 'fully_received' && r['status'] != 'cancelled')
      .length;

  int _countPendingReceiving(List<dynamic> rows) =>
      rows.where((r) => r is Map && r['status'] != 'completed').length;

  int _countOpenOutslips(List<dynamic> rows) => rows
      .where((r) => r is Map && (r['status'] == 'pending' || r['status'] == 'approved'))
      .length;

  int _countActiveDeliveries(List<dynamic> rows) => rows
      .where(
        (r) =>
            r is Map && (r['status'] == 'active' || r['status'] == 'out_for_delivery'),
      )
      .length;

  int _countUnpaidBilling(List<dynamic> rows) =>
      rows.where((r) => r is Map && r['paymentStatus'] != 'paid').length;

  int _countAccomplishments(List<dynamic> rows) =>
      rows.where((r) => r is Map && r['status'] != 'inactive').length;

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
      _fromCache = false;
      _offlineLabel = null;
    });

    try {
      final api = context.read<ApiClient>();
      final results = await Future.wait([
        api.getList('/quotations'),
        api.getList('/purchase-orders'),
        api.getList('/receivings'),
        api.getList('/outslips'),
        api.getList('/delivery-receipts'),
        api.getList('/billings'),
        api.getList('/accomplishments'),
      ]);

      final quotations = results[0] as List<dynamic>;
      final purchaseOrders = results[1] as List<dynamic>;
      final receivings = results[2] as List<dynamic>;
      final outslips = results[3] as List<dynamic>;
      final deliveries = results[4] as List<dynamic>;
      final billings = results[5] as List<dynamic>;
      final accomplishments = results[6] as List<dynamic>;

      final counts = <MobileModule, int>{
        MobileModule.quotations: _countPendingQuotations(quotations),
        MobileModule.purchaseOrders: _countOpenPurchaseOrders(purchaseOrders),
        MobileModule.receiving: _countPendingReceiving(receivings),
        MobileModule.outslips: _countOpenOutslips(outslips),
        MobileModule.deliveries: _countActiveDeliveries(deliveries),
        MobileModule.billing: _countUnpaidBilling(billings),
        MobileModule.soa: _countUnpaidBilling(billings),
        MobileModule.accomplishments: _countAccomplishments(accomplishments),
      };

      await OfflineCache.saveList(OfflineCache.quotations, quotations);
      await OfflineCache.saveList(OfflineCache.purchaseOrders, purchaseOrders);
      await OfflineCache.saveList(OfflineCache.receivings, receivings);
      await OfflineCache.saveList(OfflineCache.outslips, outslips);
      await OfflineCache.saveList(OfflineCache.deliveries, deliveries);
      await OfflineCache.saveList(OfflineCache.billings, billings);
      await OfflineCache.saveList(OfflineCache.accomplishments, accomplishments);
      await OfflineCache.saveMap(OfflineCache.homeStats, {
        for (final entry in counts.entries) entry.key.name: entry.value,
      });

      if (!mounted) return;
      setState(() {
        _counts
          ..clear()
          ..addAll(counts);
        _loading = false;
      });
    } catch (error) {
      final cached = await OfflineCache.loadMap(OfflineCache.homeStats);
      if (!mounted) return;
      if (cached.data != null) {
        setState(() {
          _counts
            ..clear()
            ..addEntries(
              MobileModule.values
                  .where((module) => module != MobileModule.home)
                  .map(
                    (module) => MapEntry(
                      module,
                      (cached.data![module.name] as num?)?.toInt() ?? 0,
                    ),
                  ),
            );
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
  Widget build(BuildContext context) {
    if (_loading && !_fromCache && _error == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final auth = context.watch<AuthState>();
    final name = auth.user?['name']?.toString().trim();
    final greeting = (name == null || name.isEmpty) ? 'Hi there' : 'Hi, $name';

    return RefreshIndicator(
      onRefresh: refreshCounts,
      color: AppTheme.maroon,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          if (_fromCache && _offlineLabel != null) FieldOfflineBanner(label: _offlineLabel!),
          if (_error != null && !_fromCache) FieldErrorBanner(message: _error!, onRetry: refreshCounts),
          if (_error != null && _fromCache)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(_error!, style: const TextStyle(color: AppTheme.errorText, fontSize: 12)),
            ),
          _HomeHero(greeting: greeting),
          const SizedBox(height: 16),
          if (_allQuiet && _error == null) const FieldQuietState(),
          const Padding(
            padding: EdgeInsets.only(bottom: 8, top: 4),
            child: Text(
              'TRANSACTIONS',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 13,
                color: AppTheme.textSecondary,
                letterSpacing: 0.6,
              ),
            ),
          ),
          ...mobileModules.map(
            (module) => _ModuleCard(
              module: module,
              count: _counts[module.id] ?? 0,
              onTap: () => widget.onOpenModule(module.id),
            ),
          ),
        ],
      ),
    );
  }
}

class _HomeHero extends StatelessWidget {
  const _HomeHero({required this.greeting});

  final String greeting;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [AppTheme.maroon, AppTheme.maroonDark],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppTheme.maroon.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -8,
            top: -8,
            child: Opacity(
              opacity: 0.12,
              child: Image.asset(AppTheme.logoAsset, width: 96, height: 96),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(18),
            child: Row(
              children: [
                const BrandLogo(size: 32),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        greeting,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Same transaction modules as the web ERP.',
                        style: TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  const _ModuleCard({
    required this.module,
    required this.count,
    required this.onTap,
  });

  final MobileModuleInfo module;
  final int count;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final hot = count > 0;

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: hot ? AppTheme.maroon.withValues(alpha: 0.35) : AppTheme.border),
            ),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: AppTheme.maroon.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(module.icon, color: AppTheme.maroon, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(module.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        Text(
                          module.subtitle,
                          style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '$count',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: hot ? AppTheme.maroon : AppTheme.textPrimary,
                    ),
                  ),
                  Icon(Icons.chevron_right_rounded, color: AppTheme.maroon.withValues(alpha: 0.7), size: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
