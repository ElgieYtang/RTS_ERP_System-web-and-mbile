import 'package:flutter/material.dart';

import '../services/document_print.dart';
import '../theme/app_theme.dart';

class PrintDocumentButton extends StatelessWidget {
  const PrintDocumentButton({
    super.key,
    required this.onPrint,
    this.label = 'Print / PDF',
  });

  final Future<void> Function() onPrint;
  final String label;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: () async {
        try {
          await onPrint();
        } catch (error) {
          if (!context.mounted) return;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Could not create PDF: $error')),
          );
        }
      },
      icon: const Icon(Icons.print_outlined, color: AppTheme.maroon),
      label: Text(label),
    );
  }
}

Future<void> printQuotation(BuildContext context, dynamic api, Map<String, dynamic> row) =>
    DocumentPrint.shareQuotation(api, row);

Future<void> printPurchaseOrder(BuildContext context, dynamic api, Map<String, dynamic> row) =>
    DocumentPrint.sharePurchaseOrder(api, row);

Future<void> printDeliveryReceipt(BuildContext context, dynamic api, Map<String, dynamic> row) =>
    DocumentPrint.shareDeliveryReceipt(api, row);

Future<void> printSoa({
  required Map<String, dynamic> customer,
  required Map<String, dynamic> account,
}) =>
    DocumentPrint.shareSoa(customer: customer, account: account);
