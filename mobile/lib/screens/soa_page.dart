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
  DateTime? _dateFrom;
  DateTime? _dateTo;
  Map<String, dynamic>? _account;

  String? _formatApiDate(DateTime? date) {
    if (date == null) return null;
    return '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
  }

  String _formatDisplayDate(DateTime? date) {
    if (date == null) return 'Any';
    return _formatApiDate(date)!;
  }

  Future<void> _pickDate({required bool isFrom}) async {
    final initial = isFrom ? _dateFrom : _dateTo;
    final picked = await showDatePicker(
      context: context,
      initialDate: initial ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked == null || !mounted) return;
    setState(() {
      if (isFrom) {
        _dateFrom = picked;
        if (_dateTo != null && _dateTo!.isBefore(picked)) {
          _dateTo = picked;
        }
      } else {
        _dateTo = picked;
        if (_dateFrom != null && _dateFrom!.isAfter(picked)) {
          _dateFrom = picked;
        }
      }
    });
  }

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
      final query = <String, String>{'customerId': customerId};
      final from = _formatApiDate(_dateFrom);
      final to = _formatApiDate(_dateTo);
      if (from != null) query['from'] = from;
      if (to != null) query['to'] = to;

      final data = await widget.api.getData(
        '/reports/soa',
        query: query,
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
                    key: ValueKey(_customerId),
                    initialValue: _customerId,
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
                  const Text('Date range (optional)', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickDate(isFrom: true),
                          icon: const Icon(Icons.calendar_today_outlined, size: 18),
                          label: Text('From: ${_formatDisplayDate(_dateFrom)}'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _pickDate(isFrom: false),
                          icon: const Icon(Icons.event_outlined, size: 18),
                          label: Text('To: ${_formatDisplayDate(_dateTo)}'),
                        ),
                      ),
                    ],
                  ),
                  if (_dateFrom != null || _dateTo != null) ...[
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: TextButton(
                        onPressed: () {
                          setState(() {
                            _dateFrom = null;
                            _dateTo = null;
                          });
                          _loadSoa();
                        },
                        child: const Text('Clear dates'),
                      ),
                    ),
                  ],
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
                    if ((_account?['periodLabel']?.toString() ?? '').isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        _account!['periodLabel'].toString(),
                        style: const TextStyle(color: AppTheme.textSecondary),
                      ),
                    ],
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
