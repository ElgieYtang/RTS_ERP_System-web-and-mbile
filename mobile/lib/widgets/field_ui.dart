import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

String fieldStatusLabel(String? status) {
  final raw = (status ?? '').trim();
  if (raw.isEmpty) return '—';
  return raw
      .split('_')
      .map((part) => part.isEmpty ? part : '${part[0].toUpperCase()}${part.substring(1)}')
      .join(' ');
}

Color fieldStatusColor(String? status) {
  switch ((status ?? '').toLowerCase()) {
    case 'completed':
    case 'delivered':
    case 'approved':
      return AppTheme.successText;
    case 'out_for_delivery':
    case 'for_dispatch':
      return AppTheme.warningText;
    case 'pending':
    case 'active':
    case 'draft':
      return AppTheme.maroon;
    case 'cancelled':
    case 'inactive':
      return AppTheme.textSecondary;
    default:
      return AppTheme.textSecondary;
  }
}

class FieldStatusChip extends StatelessWidget {
  const FieldStatusChip(this.status, {super.key});

  final String? status;

  @override
  Widget build(BuildContext context) {
    final color = fieldStatusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        fieldStatusLabel(status),
        style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 11),
      ),
    );
  }
}

class FieldErrorBanner extends StatelessWidget {
  const FieldErrorBanner({
    super.key,
    required this.message,
    required this.onRetry,
  });

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppTheme.errorBg,
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: const Icon(Icons.error_outline_rounded, color: AppTheme.errorText),
        title: Text(message, style: const TextStyle(color: AppTheme.errorText, fontSize: 13)),
        trailing: IconButton(
          onPressed: onRetry,
          icon: const Icon(Icons.refresh_rounded, color: AppTheme.errorText),
          tooltip: 'Retry',
        ),
      ),
    );
  }
}

class FieldOfflineBanner extends StatelessWidget {
  const FieldOfflineBanner({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Card(
      color: const Color(0xFFFEF3C7),
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        dense: true,
        leading: const Icon(Icons.cloud_off_outlined, color: AppTheme.warningText),
        title: Text(
          label,
          style: const TextStyle(color: AppTheme.warningText, fontSize: 13),
        ),
      ),
    );
  }
}

class FieldFilterBar extends StatelessWidget {
  const FieldFilterBar({
    super.key,
    required this.value,
    required this.options,
    required this.onChanged,
  });

  final String value;
  final List<({String id, String label})> options;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: options.map((option) {
          final selected = option.id == value;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(option.label),
              selected: selected,
              showCheckmark: false,
              onSelected: (_) => onChanged(option.id),
              selectedColor: AppTheme.maroonLight,
              backgroundColor: Colors.white,
              side: BorderSide(color: selected ? AppTheme.maroon : AppTheme.border),
              labelStyle: TextStyle(
                color: selected ? AppTheme.maroon : AppTheme.textPrimary,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                fontSize: 13,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}

class FieldEmptyState extends StatelessWidget {
  const FieldEmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
  });

  final IconData icon;
  final String title;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: const BoxDecoration(
              color: AppTheme.maroonLight,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 28, color: AppTheme.maroon),
          ),
          const SizedBox(height: 14),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppTheme.textPrimary),
          ),
          if (subtitle != null) ...[
            const SizedBox(height: 6),
            Text(
              subtitle!,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13, height: 1.4),
            ),
          ],
        ],
      ),
    );
  }
}

class FieldQuietState extends StatelessWidget {
  const FieldQuietState({super.key});

  @override
  Widget build(BuildContext context) {
    return const Card(
      color: AppTheme.maroonLight,
      margin: EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(Icons.check_circle_outline_rounded, color: AppTheme.maroon),
        title: Text('No open jobs', style: TextStyle(fontWeight: FontWeight.w600)),
      ),
    );
  }
}

class FieldSectionTitle extends StatelessWidget {
  const FieldSectionTitle(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, top: 4),
      child: Text(
        text,
        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppTheme.textSecondary),
      ),
    );
  }
}

class FieldLineItems extends StatelessWidget {
  const FieldLineItems({super.key, required this.items});

  final List<Map<String, dynamic>> items;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const Text('No line items.', style: TextStyle(color: AppTheme.textSecondary));
    }

    return Column(
      children: items.map((item) {
        final name = item['productName']?.toString() ?? 'Item';
        final qty = item['quantity'] ?? item['received'] ?? '—';
        return Container(
          margin: const EdgeInsets.only(bottom: 6),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: AppTheme.page,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.border),
          ),
          child: Row(
            children: [
              Expanded(child: Text(name, style: const TextStyle(fontWeight: FontWeight.w500))),
              Text('Qty $qty', style: const TextStyle(fontWeight: FontWeight.w700, color: AppTheme.maroon)),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class FieldDetailScaffold extends StatelessWidget {
  const FieldDetailScaffold({
    super.key,
    required this.title,
    required this.subtitle,
    required this.status,
    required this.children,
    this.actions,
  });

  final String title;
  final String subtitle;
  final String? status;
  final List<Widget> children;
  final List<Widget>? actions;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          subtitle,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                        ),
                      ),
                      if (status != null) FieldStatusChip(status),
                    ],
                  ),
                  ...children,
                ],
              ),
            ),
          ),
          if (actions != null && actions!.isNotEmpty) ...[
            const SizedBox(height: 8),
            ...actions!,
          ],
        ],
      ),
    );
  }
}
