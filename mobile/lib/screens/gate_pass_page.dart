import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../services/api_errors.dart';
import '../services/document_print.dart';
import '../theme/app_theme.dart';
import '../widgets/field_ui.dart';

class GatePassPage extends StatefulWidget {
  const GatePassPage({
    super.key,
    required this.api,
    required this.outslip,
  });

  final ApiClient api;
  final Map<String, dynamic> outslip;

  @override
  State<GatePassPage> createState() => _GatePassPageState();
}

class _GatePassPageState extends State<GatePassPage> {
  bool _loading = true;
  bool _busy = false;
  Map<String, dynamic>? _document;

  final _destinationController = TextEditingController();
  final _driverController = TextEditingController();
  final _plateController = TextEditingController();
  final _vehicleController = TextEditingController();
  final _remarksController = TextEditingController();

  static const _fieldDecoration = InputDecoration(
    isDense: true,
    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    border: OutlineInputBorder(),
  );

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _destinationController.dispose();
    _driverController.dispose();
    _plateController.dispose();
    _vehicleController.dispose();
    _remarksController.dispose();
    super.dispose();
  }

  String get _outslipRef =>
      widget.outslip['dbId']?.toString() ?? widget.outslip['id']?.toString() ?? '';

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final response = await widget.api.request('GET', '/outslips/$_outslipRef/gate-pass');
      final data = (response as Map)['data'];
      if (data is! Map) throw ApiException('Gate pass not found.');
      _applyDocument(Map<String, dynamic>.from(data));
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(friendlyApiError(error))),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _applyDocument(Map<String, dynamic> document) {
    _document = document;
    _destinationController.text = document['destination']?.toString() ?? '';
    _driverController.text = document['driverName']?.toString() ?? '';
    _plateController.text = document['plateNo']?.toString() ?? '';
    _vehicleController.text = document['vehicleNo']?.toString() ?? '';
    _remarksController.text = document['remarks']?.toString() ?? '';
  }

  Map<String, dynamic> _formPayload() => {
        'destination': _destinationController.text.trim(),
        'driverName': _driverController.text.trim(),
        'plateNo': _plateController.text.trim(),
        'vehicleNo': _vehicleController.text.trim(),
        'remarks': _remarksController.text.trim(),
      };

  Map<String, dynamic> _mergedDocument() {
    if (_document == null) return {};
    return {
      ..._document!,
      ..._formPayload(),
    };
  }

  Future<void> _save() async {
    setState(() => _busy = true);
    try {
      final response = await widget.api.put('/outslips/$_outslipRef/gate-pass', _formPayload());
      final data = (response as Map)['data'];
      if (data is Map) {
        setState(() => _applyDocument(Map<String, dynamic>.from(data)));
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gate pass saved.')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(friendlyApiError(error))),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _markExited() async {
    setState(() => _busy = true);
    try {
      await widget.api.put('/outslips/$_outslipRef/gate-pass', _formPayload());
      final response = await widget.api.post('/outslips/$_outslipRef/gate-pass/exit');
      final data = (response as Map)['data'];
      if (data is Map) {
        setState(() => _applyDocument(Map<String, dynamic>.from(data)));
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gate pass marked as exited.')),
        );
      }
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(friendlyApiError(error))),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _print() async {
    setState(() => _busy = true);
    try {
      await DocumentPrint.shareGatePass(
        widget.api,
        widget.outslip,
        documentOverride: _mergedDocument(),
      );
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not print gate pass: $error')),
        );
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Widget _summaryTile(String label, String value) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.only(right: 8, bottom: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, color: Colors.black54)),
            const SizedBox(height: 2),
            Text(
              value,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ],
        ),
      ),
    );
  }

  Widget _compactField(String label, TextEditingController controller, {int maxLines = 1}) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      decoration: _fieldDecoration.copyWith(labelText: label),
    );
  }

  Widget _buildDetailsTab(Map<String, dynamic> document) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            margin: EdgeInsets.zero,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          document['customerName']?.toString() ?? 'Customer',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 17),
                        ),
                      ),
                      FieldStatusChip(
                        document['outslipStatus']?.toString() ?? widget.outslip['status']?.toString(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _summaryTile('Gate Pass', document['gatePassNo']?.toString() ?? '—'),
                      _summaryTile('Outslip', document['outslipNo']?.toString() ?? '—'),
                    ],
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _summaryTile('PO No.', document['purchaseOrderNo']?.toString() ?? '—'),
                      _summaryTile('Date', document['displayDate']?.toString() ?? '—'),
                    ],
                  ),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _summaryTile('Time Out', document['displayTimeOut']?.toString() ?? '—'),
                      _summaryTile(
                        'Items',
                        '${(document['items'] as List?)?.length ?? 0}',
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          _compactField('Destination', _destinationController),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _compactField('Driver', _driverController)),
              const SizedBox(width: 10),
              Expanded(child: _compactField('Plate No.', _plateController)),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _compactField('Vehicle', _vehicleController)),
              const SizedBox(width: 10),
              Expanded(child: _compactField('Remarks', _remarksController)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildItemsTab(List<Map<String, dynamic>> items) {
    if (items.isEmpty) {
      return const Center(child: Text('No items on this gate pass.'));
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final item = items[index];
        final code = item['productCode']?.toString() ?? '';
        return Card(
          margin: EdgeInsets.zero,
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: AppTheme.maroon.withValues(alpha: 0.12),
                  child: Text(
                    '${index + 1}',
                    style: const TextStyle(
                      color: AppTheme.maroon,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item['productName']?.toString() ?? 'Item',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      if (code.isNotEmpty)
                        Text(code, style: const TextStyle(color: Colors.black54, fontSize: 12)),
                      const SizedBox(height: 4),
                      Text(
                        'Qty ${item['quantity'] ?? '—'} ${item['unit'] ?? 'UNIT'}'
                        '${(item['brand']?.toString() ?? '').isNotEmpty ? ' · ${item['brand']}' : ''}',
                        style: const TextStyle(fontSize: 12, color: Colors.black87),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget? _buildBottomBar(Map<String, dynamic> document) {
    return SafeArea(
      child: Container(
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          border: Border(top: BorderSide(color: Colors.black.withValues(alpha: 0.08))),
        ),
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: _busy ? null : _print,
                icon: const Icon(Icons.print_outlined),
                label: Text(_busy ? 'Working…' : 'Print gate pass'),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _busy ? null : _save,
                    child: const Text('Save'),
                  ),
                ),
                if (document['status']?.toString() != 'exited') ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _busy ? null : _markExited,
                      child: const Text('Mark exited'),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadedScaffold(Map<String, dynamic> document, List<Map<String, dynamic>> items) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text(document['gatePassNo']?.toString() ?? 'Gate pass'),
          actions: [
            IconButton(
              tooltip: 'Print gate pass',
              onPressed: _busy ? null : _print,
              icon: const Icon(Icons.print_outlined),
            ),
          ],
          bottom: TabBar(
            indicatorColor: Colors.white,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            tabs: [
              const Tab(text: 'Details'),
              Tab(text: 'Items (${items.length})'),
            ],
          ),
        ),
        bottomNavigationBar: _buildBottomBar(document),
        body: TabBarView(
          children: [
            _buildDetailsTab(document),
            _buildItemsTab(items),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final document = _document;
    final items = (document?['items'] as List<dynamic>? ?? const [])
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();

    if (_loading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Gate pass')),
        body: const Center(child: CircularProgressIndicator(color: AppTheme.maroon)),
      );
    }

    if (document == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Gate pass')),
        body: const Center(child: Text('Gate pass unavailable.')),
      );
    }

    return _buildLoadedScaffold(document, items);
  }
}
