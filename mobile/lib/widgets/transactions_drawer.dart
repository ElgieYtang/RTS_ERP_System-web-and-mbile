import 'package:flutter/material.dart';

import '../navigation/app_navigation.dart';
import '../navigation/mobile_modules.dart';
import '../navigation/module_navigation_scope.dart';
import '../services/api_client.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_logo.dart';

Widget? moduleTransactionDrawer(BuildContext context) {
  final scope = ModuleNavigationScope.maybeOf(context);
  if (scope == null) return null;
  return TransactionsDrawer(
    onOpenModule: (module) => scope.onOpenModule(context, module),
  );
}

class TransactionsDrawer extends StatelessWidget {
  const TransactionsDrawer({
    super.key,
    required this.onOpenModule,
  });

  final ValueChanged<MobileModule> onOpenModule;

  void _close(BuildContext context) {
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: SafeArea(
        child: Column(
          children: [
            DrawerHeader(
              margin: EdgeInsets.zero,
              padding: const EdgeInsets.fromLTRB(16, 8, 8, 16),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [AppTheme.maroon, AppTheme.maroonDark],
                ),
              ),
              child: Stack(
                children: [
                  Positioned(
                    top: 0,
                    right: 0,
                    child: IconButton(
                      onPressed: () => _close(context),
                      icon: const Icon(Icons.close_rounded, color: Colors.white),
                      tooltip: 'Close menu',
                    ),
                  ),
                  const Align(
                    alignment: Alignment.bottomLeft,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        BrandLogo(size: 28),
                        SizedBox(height: 12),
                        Text(
                          'Transactions',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  ListTile(
                    leading: const Icon(Icons.dashboard_rounded, color: AppTheme.maroon),
                    title: const Text('Dashboard'),
                    onTap: () {
                      Navigator.pop(context);
                      goHome(context);
                    },
                  ),
                  const Divider(height: 1),
                  ...mobileModules.map(
                    (module) => ListTile(
                      leading: Icon(module.icon, color: AppTheme.maroon),
                      title: Text(module.title),
                      onTap: () => onOpenModule(module.id),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ModuleShell extends StatelessWidget {
  const ModuleShell({
    super.key,
    required this.module,
    required this.api,
    required this.onOpenModule,
  });

  final MobileModule module;
  final ApiClient api;
  final void Function(BuildContext context, MobileModule module) onOpenModule;

  @override
  Widget build(BuildContext context) {
    final info = mobileModules.firstWhere((item) => item.id == module);

    return ModuleNavigationScope(
      onOpenModule: onOpenModule,
      child: Scaffold(
        appBar: transactionAppBar(context, title: info.title),
        drawer: TransactionsDrawer(
          onOpenModule: (next) => onOpenModule(context, next),
        ),
        body: buildMobileModulePage(module, api),
      ),
    );
  }
}
