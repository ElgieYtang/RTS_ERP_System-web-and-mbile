import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/api_client.dart';
import '../state/auth_state.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_logo.dart';
import 'accomplishments_page.dart';
import 'deliveries_page.dart';
import 'home_page.dart';
import 'outslips_page.dart';
import 'receivings_page.dart';

class ShellPage extends StatefulWidget {
  const ShellPage({super.key});

  @override
  State<ShellPage> createState() => _ShellPageState();
}

class _ShellPageState extends State<ShellPage> {
  int _index = 0;
  ApiClient? _api;
  List<Widget> _pages = const [];

  static const _titles = [
    'Home',
    'Receiving',
    'Outslips',
    'Deliveries',
    'Accomplishments',
  ];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final api = context.read<ApiClient>();
    if (!identical(_api, api)) {
      _api = api;
      _pages = [
        HomePage(onOpenTab: (index) => setState(() => _index = index)),
        ReceivingsPage(api: api),
        OutslipsPage(api: api),
        DeliveriesPage(api: api),
        AccomplishmentsPage(api: api),
      ];
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthState>();

    return Scaffold(
      appBar: AppBar(
        title: BrandAppBarTitle(title: _titles[_index]),
        actions: [
          PopupMenuButton<String>(
            icon: CircleAvatar(
              radius: 16,
              backgroundColor: Colors.white.withValues(alpha: 0.15),
              child: Text(
                _initials(auth.user?['name']?.toString()),
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
            onSelected: (value) async {
              if (value == 'logout') {
                await auth.logout();
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      auth.user?['name']?.toString() ?? 'User',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      auth.user?['login']?.toString() ?? '',
                      style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
                    ),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(value: 'logout', child: Text('Sign out')),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: IndexedStack(
        index: _index,
        children: _pages,
      ),
      bottomNavigationBar: DecoratedBox(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 12,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: (value) => setState(() => _index = value),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home_rounded),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.inventory_2_outlined),
              selectedIcon: Icon(Icons.inventory_2_rounded),
              label: 'Receiving',
            ),
            NavigationDestination(
              icon: Icon(Icons.outbox_outlined),
              selectedIcon: Icon(Icons.outbox_rounded),
              label: 'Outslips',
            ),
            NavigationDestination(
              icon: Icon(Icons.local_shipping_outlined),
              selectedIcon: Icon(Icons.local_shipping_rounded),
              label: 'Deliveries',
            ),
            NavigationDestination(
              icon: Icon(Icons.photo_camera_outlined),
              selectedIcon: Icon(Icons.photo_camera_rounded),
              label: 'Reports',
            ),
          ],
        ),
      ),
    );
  }

  String _initials(String? name) {
    final parts = (name ?? 'U').trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts[1][0]}'.toUpperCase();
    }
    return (parts.first.isNotEmpty ? parts.first[0] : 'U').toUpperCase();
  }
}
