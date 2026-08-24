import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../services/offline_cache.dart';
import '../state/auth_state.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/field_ui.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.onOpenTab});

  final ValueChanged<int> onOpenTab;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  bool _loading = true;
  bool _fromCache = false;
  String? _error;
  String? _offlineLabel;
  int _pendingReceiving = 0;
  int _openOutslips = 0;
  int _activeDeliveries = 0;
  int _accomplishments = 0;

  bool get _allQuiet =>
      _pendingReceiving == 0 &&
      _openOutslips == 0 &&
      _activeDeliveries == 0 &&
      _accomplishments == 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

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
        api.getList('/receivings'),
        api.getList('/outslips'),
        api.getList('/delivery-receipts'),
        api.getList('/accomplishments'),
      ]);

      final receivings = results[0];
      final outslips = results[1];
      final deliveries = results[2];
      final accomplishments = results[3];

      final pending = receivings.where((r) => r['status'] != 'completed').length;
      final openOutslips = outslips
          .where((o) => o['status'] == 'pending' || o['status'] == 'approved')
          .length;
      final active = deliveries
          .where((d) => d['status'] == 'active' || d['status'] == 'out_for_delivery')
          .length;
      final reports = accomplishments.where((a) => a['status'] != 'inactive').length;

      await OfflineCache.saveList(OfflineCache.receivings, receivings);
      await OfflineCache.saveList(OfflineCache.outslips, outslips);
      await OfflineCache.saveList(OfflineCache.deliveries, deliveries);
      await OfflineCache.saveList(OfflineCache.accomplishments, accomplishments);
      await OfflineCache.saveMap(OfflineCache.homeStats, {
        'pendingReceiving': pending,
        'openOutslips': openOutslips,
        'activeDeliveries': active,
        'accomplishments': reports,
      });

      if (!mounted) return;
      setState(() {
        _pendingReceiving = pending;
        _openOutslips = openOutslips;
        _activeDeliveries = active;
        _accomplishments = reports;
        _loading = false;
      });
    } catch (error) {
      final cached = await OfflineCache.loadMap(OfflineCache.homeStats);
      if (!mounted) return;
      if (cached.data != null) {
        setState(() {
          _pendingReceiving = (cached.data!['pendingReceiving'] as num?)?.toInt() ?? 0;
          _openOutslips = (cached.data!['openOutslips'] as num?)?.toInt() ?? 0;
          _activeDeliveries = (cached.data!['activeDeliveries'] as num?)?.toInt() ?? 0;
          _accomplishments = (cached.data!['accomplishments'] as num?)?.toInt() ?? 0;
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
      onRefresh: _load,
      color: AppTheme.maroon,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
        children: [
          if (_fromCache && _offlineLabel != null) FieldOfflineBanner(label: _offlineLabel!),
          if (_error != null && !_fromCache) FieldErrorBanner(message: _error!, onRetry: _load),
          if (_error != null && _fromCache)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(_error!, style: const TextStyle(color: AppTheme.errorText, fontSize: 12)),
            ),
          _HomeHero(greeting: greeting),
          const SizedBox(height: 16),
          if (_allQuiet && _error == null) const FieldQuietState(),
          _StatCard(
            label: 'Receiving',
            value: _pendingReceiving,
            icon: Icons.inventory_2_outlined,
            accent: AppTheme.maroon,
            onTap: () => widget.onOpenTab(1),
          ),
          _StatCard(
            label: 'Outslips',
            value: _openOutslips,
            icon: Icons.outbox_outlined,
            accent: AppTheme.maroonDark,
            onTap: () => widget.onOpenTab(2),
          ),
          _StatCard(
            label: 'Deliveries',
            value: _activeDeliveries,
            icon: Icons.local_shipping_outlined,
            accent: const Color(0xFF9B2335),
            onTap: () => widget.onOpenTab(3),
          ),
          _StatCard(
            label: 'Reports',
            value: _accomplishments,
            icon: Icons.photo_camera_outlined,
            accent: AppTheme.brandOrange,
            onTap: () => widget.onOpenTab(4),
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
                  child: Text(
                    greeting,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                    ),
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

class _StatCard extends StatelessWidget {
  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.accent,
    required this.onTap,
  });

  final String label;
  final int value;
  final IconData icon;
  final Color accent;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final hot = value > 0;

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
              border: Border.all(color: hot ? accent.withValues(alpha: 0.35) : AppTheme.border),
            ),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      color: accent.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(icon, color: accent, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  ),
                  Text(
                    '$value',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: hot ? accent : AppTheme.textPrimary,
                    ),
                  ),
                  Icon(Icons.chevron_right_rounded, color: accent.withValues(alpha: 0.7), size: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
