import 'package:flutter/material.dart';

void goHome(BuildContext context) {
  Navigator.of(context).popUntil((route) => route.isFirst);
}

Widget homeAppBarButton(BuildContext context) {
  return IconButton(
    icon: const Icon(Icons.home_rounded),
    tooltip: 'Home',
    onPressed: () => goHome(context),
  );
}

Widget menuAppBarButton(BuildContext context) {
  return Builder(
    builder: (context) => IconButton(
      icon: const Icon(Icons.menu_rounded),
      tooltip: 'Menu',
      onPressed: () => Scaffold.of(context).openDrawer(),
    ),
  );
}

/// Standard transaction app bar: menu left, title center, home right.
PreferredSizeWidget transactionAppBar(
  BuildContext context, {
  required String title,
  List<Widget>? extraActions,
}) {
  return AppBar(
    automaticallyImplyLeading: false,
    leading: menuAppBarButton(context),
    title: Text(title),
    actions: [
      if (extraActions != null) ...extraActions,
      homeAppBarButton(context),
      const SizedBox(width: 4),
    ],
  );
}
