import 'package:flutter/material.dart';

import '../navigation/app_navigation.dart';
import '../widgets/transactions_drawer.dart';
import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../theme/app_theme.dart';
import '../widgets/field_ui.dart';

class _QuotationLineItem {
  _QuotationLineItem();

  String? productId;
  final quantityController = TextEditingController(text: '1');
  final unitPriceController = TextEditingController(text: '0');
}

class AddQuotationPage extends StatefulWidget {
  const AddQuotationPage({super.key, required this.api});

  final ApiClient api;

  @override
  State<AddQuotationPage> createState() => _AddQuotationPageState();
}

class _AddQuotationPageState extends State<AddQuotationPage> {
  bool _loading = true;
  bool _submitting = false;
  String? _error;
  List<Map<String, dynamic>> _customers = [];
  List<Map<String, dynamic>> _products = [];
  String? _customerId;
  DateTime _date = DateTime.now();
  final List<_QuotationLineItem> _lines = [_QuotationLineItem()];

  @override
  void initState() {
    super.initState();
    _loadSetup();
  }

  @override
  void dispose() {
    for (final line in _lines) {
      line.quantityController.dispose();
      line.unitPriceController.dispose();
    }
    super.dispose();
  }

  Future<void> _loadSetup() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final results = await Future.wait([
        widget.api.getList('/setup/customers'),
        widget.api.getList('/setup/items'),
      ]);
      final customers = results[0]
          .cast<Map<String, dynamic>>()
          .where((row) => row['status'] != 'Inactive')
          .toList();
      final products = results[1]
          .cast<Map<String, dynamic>>()
          .where((row) => row['status'] != 'Inactive')
          .toList();
      if (!mounted) return;
      setState(() {
        _customers = customers;
        _products = products;
        _customerId = customers.isNotEmpty ? customers.first['id']?.toString() : null;
        _loading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _error = friendlyApiError(error);
        _loading = false;
      });
    }
  }

  Map<String, dynamic>? get _selectedCustomer {
    if (_customerId == null) return null;
    return _customers.cast<Map<String, dynamic>?>().firstWhere(
          (row) => row?['id']?.toString() == _customerId,
          orElse: () => null,
        );
  }

  double get _total {
    var sum = 0.0;
    for (final line in _lines) {
      final qty = double.tryParse(line.quantityController.text.trim()) ?? 0;
      final price = double.tryParse(line.unitPriceController.text.trim()) ?? 0;
      sum += qty * price;
    }
    return sum;
  }

  void _addLine() {
    setState(() => _lines.add(_QuotationLineItem()));
  }

  void _removeLine(int index) {
    if (_lines.length == 1) return;
    setState(() {
      final line = _lines.removeAt(index);
      line.quantityController.dispose();
      line.unitPriceController.dispose();
    });
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() => _date = picked);
    }
  }

  Future<void> _submit() async {
    if (_submitting) return;

    final customerId = int.tryParse(_customerId ?? '');
    if (customerId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a customer.')),
      );
      return;
    }

    final payloadItems = <Map<String, dynamic>>[];
    for (final line in _lines) {
      final productId = int.tryParse(line.productId ?? '');
      final quantity = double.tryParse(line.quantityController.text.trim());
      final unitPrice = double.tryParse(line.unitPriceController.text.trim());
      if (productId == null) continue;
      if (quantity == null || quantity <= 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Item quantity must be greater than zero.')),
        );
        return;
      }
      if (unitPrice == null || unitPrice < 0) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Enter a valid unit price.')),
        );
        return;
      }
      payloadItems.add({
        'productId': productId,
        'quantity': quantity,
        'unitPrice': unitPrice,
      });
    }

    if (payloadItems.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Add at least one item.')),
      );
      return;
    }

    setState(() => _submitting = true);
    try {
      await widget.api.post('/quotations', {
        'customerId': customerId,
        'date': _date.toIso8601String().split('T').first,
        'items': payloadItems,
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Quotation created successfully.')),
      );
      Navigator.pop(context, true);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(friendlyApiError(error))));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        appBar: transactionAppBar(context, title: 'New Quotation'),
        drawer: moduleTransactionDrawer(context),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final customer = _selectedCustomer;

    return Scaffold(
      appBar: transactionAppBar(context, title: 'New Quotation'),
      drawer: moduleTransactionDrawer(context),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_error != null) FieldErrorBanner(message: _error!, onRetry: _loadSetup),
          const FieldSectionTitle('Customer'),
          if (_customers.isEmpty)
            const Text(
              'No active customers found. Add customers on the web Setup screen first.',
              style: TextStyle(color: AppTheme.textSecondary),
            )
          else
            DropdownButtonFormField<String>(
              initialValue: _customerId,
              decoration: const InputDecoration(
                labelText: 'Select customer',
                border: OutlineInputBorder(),
              ),
              items: _customers
                  .map(
                    (row) => DropdownMenuItem(
                      value: row['id']?.toString() ?? '',
                      child: Text(
                        '${row['code'] != null && '${row['code']}'.isNotEmpty ? '${row['code']} — ' : ''}'
                        '${row['name'] ?? 'Customer'}',
                      ),
                    ),
                  )
                  .toList(),
              onChanged: (value) => setState(() => _customerId = value),
            ),
          if (customer != null) ...[
            const SizedBox(height: 12),
            Card(
              color: AppTheme.maroonLight,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(customer['name']?.toString() ?? 'Customer',
                        style: const TextStyle(fontWeight: FontWeight.w700)),
                    if ((customer['address']?.toString() ?? '').isNotEmpty)
                      Text(customer['address'].toString()),
                    if ((customer['tin']?.toString() ?? '').isNotEmpty)
                      Text('TIN: ${customer['tin']}'),
                    if ((customer['terms']?.toString() ?? '').isNotEmpty)
                      Text('Terms: ${customer['terms']}'),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 16),
          const FieldSectionTitle('Date'),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(_date.toIso8601String().split('T').first),
            trailing: const Icon(Icons.calendar_today_outlined),
            onTap: _pickDate,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Expanded(child: FieldSectionTitle('Items')),
              TextButton.icon(
                onPressed: _products.isEmpty ? null : _addLine,
                icon: const Icon(Icons.add),
                label: const Text('Add item'),
              ),
            ],
          ),
          if (_products.isEmpty)
            const Text(
              'No active items found. Add items on the web Setup screen first.',
              style: TextStyle(color: AppTheme.textSecondary),
            ),
          ..._lines.asMap().entries.map((entry) {
            final index = entry.key;
            final line = entry.value;
            final qty = double.tryParse(line.quantityController.text.trim()) ?? 0;
            final price = double.tryParse(line.unitPriceController.text.trim()) ?? 0;
            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text('Item ${index + 1}',
                              style: const TextStyle(fontWeight: FontWeight.w700)),
                        ),
                        if (_lines.length > 1)
                          IconButton(
                            onPressed: () => _removeLine(index),
                            icon: const Icon(Icons.delete_outline_rounded),
                            tooltip: 'Remove item',
                          ),
                      ],
                    ),
                    DropdownButtonFormField<String>(
                      initialValue: line.productId,
                      decoration: const InputDecoration(
                        labelText: 'Product',
                        border: OutlineInputBorder(),
                      ),
                      items: _products
                          .map(
                            (product) => DropdownMenuItem(
                              value: product['id']?.toString() ?? '',
                              child: Text(
                                '${product['code'] != null && '${product['code']}'.isNotEmpty ? '${product['code']} — ' : ''}'
                                '${product['name'] ?? 'Item'}',
                              ),
                            ),
                          )
                          .toList(),
                      onChanged: (value) => setState(() => line.productId = value),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: line.quantityController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(
                              labelText: 'Qty',
                              border: OutlineInputBorder(),
                            ),
                            onChanged: (_) => setState(() {}),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: line.unitPriceController,
                            keyboardType: const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(
                              labelText: 'Unit price',
                              border: OutlineInputBorder(),
                            ),
                            onChanged: (_) => setState(() {}),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('Amount: ${fieldFormatMoney(qty * price)}'),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              'Total: ${fieldFormatMoney(_total)}',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _submitting || _customers.isEmpty || _products.isEmpty ? null : _submit,
            child: Text(_submitting ? 'Saving…' : 'Create quotation'),
          ),
        ],
      ),
    );
  }
}
