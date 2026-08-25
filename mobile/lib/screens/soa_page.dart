import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../theme/app_theme.dart';
import '../widgets/field_ui.dart';
import '../widgets/print_document_button.dart';

class SoaPage extends StatefulWidget {
  const SoaPage({super.key, required this.api});

  final ApiClient api;

  @override
  State<SoaPage> createState() => _SoaPageState();
}

class _SoaPageState extends State<SoaPage> {
  bool _loadingCustomers = true;
  bool _loadingSoa = false;
  String? _error;
  List<Map<String, dynamic>> _customers = [];
  String? _customerId;
  Map<String, dynamic>? _account;

  Future<void> _loadCustomers() async {
    setState(() {
      _loadingCustomers = true;
      _error = null;
    });
    try {
      final data = await widget.api.getList('/setup/customers');
      final rows = data.cast<Map<String, dynamic>>();
      if (!mounted) return;
      setState(() {
        _customers = rows.where((c) => c['status'] != 'Inactive').toList();
        _customerId ??= _customers.isNotEmpty ? _customers.first['id']?.toString() : null;
        _loadingCustomers = false;
      });
      if (_customerId != null) {
        await _loadSoa();
      }
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = friendlyApiError(error);
        _loadingCustomers = false;
      });
    }
  }

  Future<void> _loadSoa() async {
    final customerId = _customerId;
    if (customerId == null || customerId.isEmpty) return;

    setState(() {
      _loadingSoa = true;
      _error = null;
    });
    try {
      final data = await widget.api.getData(
        '/reports/soa',
        query: {'customerId': customerId},
      );
      if (!mounted) return;
      setState(() {
        _account = data;
        _loadingSoa = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = friendlyApiError(error);
        _loadingSoa = false;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    _loadCustomers();
  }

  @override
  Widget build(BuildContext context) {
    if (_loadingCustomers) {
      return const Center(child: CircularProgressIndicator());
    }

    final totals = (_account?['totals'] as Map?)?.cast<String, dynamic>() ?? {};
    final rows = (_account?['rows'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();
    final customer = _customers.cast<Map<String, dynamic>?>().firstWhere(
          (c) => c?['id']?.toString() == _customerId,
          orElse: () => null,
        );

    return RefreshIndicator(
      onRefresh: _loadSoa,
      color: AppTheme.maroon,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(12),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Customer', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _customerId,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      isDense: true,
                    ),
                    items: _customers
                        .map(
                          (c) => DropdownMenuItem(
                            value: c['id']?.toString() ?? '',
                            child: Text(c['name']?.toString() ?? 'Customer'),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      setState(() => _customerId = value);
                      _loadSoa();
                    },
                  ),
                  const SizedBox(height: 12),
                  FilledButton(
                    onPressed: _loadingSoa ? null : _loadSoa,
                    child: Text(_loadingSoa ? 'Loading…' : 'Generate SOA'),
                  ),
                  if (_account != null && customer != null) ...[
                    const SizedBox(height: 8),
                    PrintDocumentButton(
                      onPrint: () => printSoa(customer: customer, account: _account!),
                      label: 'Print SOA PDF',
                    ),
                  ],
                ],
              ),
            ),
          ),
          if (_error != null) FieldErrorBanner(message: _error!, onRetry: _loadSoa),
          if (customer != null) ...[
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      customer['name']?.toString() ?? 'Customer',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 8),
                    Text('Charges: ${fieldFormatMoney(totals['totalDebit'])}'),
                    Text('Payments: ${fieldFormatMoney(totals['totalCredit'])}'),
                    Text(
                      'Balance due: ${fieldFormatMoney(totals['outstanding'])}',
                      style: const TextStyle(fontWeight: FontWeight.w700, color: AppTheme.maroon),
                    ),
                  ],
                ),
              ),
            ),
          ],
          if (rows.isEmpty && !_loadingSoa && _error == null)
            const FieldEmptyState(
              icon: Icons.account_balance_wallet_outlined,
              title: 'No SOA entries',
              subtitle: 'Select a customer and generate the statement.',
            ),
          ...rows.map((row) {
            final debit = (row['debit'] as num?)?.toDouble() ?? 0;
            final credit = (row['credit'] as num?)?.toDouble() ?? 0;
            return Card(
              child: ListTile(
                title: Text(row['description']?.toString() ?? row['reference']?.toString() ?? 'Entry'),
                subtitle: Text(row['displayDate']?.toString() ?? row['date']?.toString() ?? '—'),
                trailing: Text(
                  debit > 0 ? fieldFormatMoney(debit) : '- ${fieldFormatMoney(credit)}',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: debit > 0 ? AppTheme.maroon : AppTheme.successText,
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
