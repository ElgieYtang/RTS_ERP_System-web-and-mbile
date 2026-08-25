import 'dart:typed_data';

import 'package:flutter/services.dart' show rootBundle;
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

/// Printable accomplishment report — mirrors the office web layout.
class AccomplishmentPdf {
  AccomplishmentPdf._();

  static const imagesPerPage = 4;

  static const _companyName = 'RESPONSIVCODE TECHNOLOGY SOLUTIONS';
  static const _companyAddress =
      'RM301E-3 MEDALLE BLDG. FUENTE OSMEÑA CAPITOL SITE CEBU CITY';
  static const _companyPhone = '345-2283/09175734911';
  static const _signatoryName = 'LARKE G. GELBOLINGO';

  static const _pageMargin = pw.EdgeInsets.fromLTRB(34, 28, 34, 28);

  static final _maroon = PdfColor.fromInt(0xFF8B1E3F);
  static const _border = PdfColors.black;

  static final _labelStyle = pw.TextStyle(
    fontSize: 9,
    fontWeight: pw.FontWeight.bold,
  );
  static const _valueStyle = pw.TextStyle(fontSize: 9);
  static const _titleStyle = pw.TextStyle(
    fontSize: 18,
    fontWeight: pw.FontWeight.bold,
  );

  static Future<Uint8List> build({
    required Map<String, dynamic> report,
    required Map<String, Uint8List> photoBytes,
  }) async {
    final logoData = await rootBundle.load('assets/logo.png');
    final logoImage = pw.MemoryImage(logoData.buffer.asUint8List());

    final orderedPhotos = <Uint8List>[];
    final images =
        (report['images'] as List<dynamic>? ?? const []).cast<Map<String, dynamic>>();
    for (final image in images) {
      final id = image['id']?.toString();
      if (id != null && photoBytes.containsKey(id)) {
        orderedPhotos.add(photoBytes[id]!);
      }
    }

    final pageCount = orderedPhotos.isEmpty
        ? 1
        : (orderedPhotos.length / imagesPerPage).ceil();
    final doc = pw.Document();

    for (var pageIndex = 0; pageIndex < pageCount; pageIndex++) {
      final isFirstPage = pageIndex == 0;
      final isLastPage = pageIndex == pageCount - 1;
      final start = pageIndex * imagesPerPage;
      final slice = orderedPhotos.skip(start).take(imagesPerPage).toList();
      while (slice.length < imagesPerPage) {
        slice.add(Uint8List(0));
      }

      doc.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4,
          margin: _pageMargin,
          build: (context) {
            return pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.stretch,
              children: [
                if (isFirstPage)
                  _letterhead(logoImage)
                else
                  _continuedHeader(pageIndex + 1, pageCount),
                if (isFirstPage) ...[
                  pw.SizedBox(height: 10),
                  _infoTable(report),
                ],
                pw.Expanded(child: _picturesSection(slice)),
                if (isLastPage) ...[
                  pw.SizedBox(height: 14),
                  _signatureSection(report),
                ],
              ],
            );
          },
        ),
      );
    }

    return doc.save();
  }

  static pw.Widget _letterhead(pw.MemoryImage logo) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.stretch,
      children: [
        pw.Row(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            pw.Image(logo, width: 52, height: 52),
            pw.SizedBox(width: 10),
            pw.Expanded(
              child: pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.start,
                children: [
                  pw.Text(
                    _companyName,
                    style: _labelStyle.copyWith(
                      fontSize: 11,
                      color: _maroon,
                    ),
                  ),
                  pw.Text(
                    _companyAddress,
                    style: const pw.TextStyle(fontSize: 8),
                  ),
                  pw.Text(
                    _companyPhone,
                    style: const pw.TextStyle(fontSize: 8),
                  ),
                ],
              ),
            ),
          ],
        ),
        pw.SizedBox(height: 12),
        pw.Container(height: 1, color: _border),
        pw.SizedBox(height: 2),
        pw.Container(height: 1, color: _border),
        pw.SizedBox(height: 10),
        pw.Center(
          child: pw.Text(
            'ACCOMPLISHMENT REPORT',
            style: _titleStyle.copyWith(color: _maroon),
          ),
        ),
        pw.SizedBox(height: 8),
        pw.Container(height: 1, color: _border),
        pw.SizedBox(height: 2),
        pw.Container(height: 1, color: _border),
      ],
    );
  }

  static pw.Widget _continuedHeader(int page, int total) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.stretch,
      children: [
        pw.Center(
          child: pw.Text(
            'ACCOMPLISHMENT REPORT',
            style: _titleStyle.copyWith(color: _maroon),
          ),
        ),
        pw.SizedBox(height: 4),
        pw.Align(
          alignment: pw.Alignment.centerRight,
          child: pw.Text(
            'Page $page of $total',
            style: const pw.TextStyle(fontSize: 9, color: PdfColors.grey700),
          ),
        ),
        pw.SizedBox(height: 8),
      ],
    );
  }

  static pw.Widget _infoTable(Map<String, dynamic> report) {
    String cell(String? value) => (value == null || value.isEmpty) ? ' ' : value;

    return pw.Container(
      decoration: pw.BoxDecoration(
        border: pw.Border.all(color: _border, width: 0.75),
      ),
      child: pw.Column(
        children: [
          _infoRow(
            cells: [
              _InfoCell('Project Name:', cell(report['projectName']?.toString()), 22, 78),
            ],
            bottom: true,
          ),
          _infoRow(
            cells: [
              _InfoCell('Location', cell(report['location']?.toString()), 22, 28),
              _InfoCell('Remarks', cell(report['remarks']?.toString()), 18, 32),
            ],
            bottom: true,
          ),
          _infoRow(
            cells: [
              _InfoCell(
                'Installation Report No:',
                cell(report['installationReportNo']?.toString() ?? report['id']?.toString()),
                30,
                20,
              ),
              _InfoCell(
                'Date:',
                cell(report['displayDate']?.toString() ?? report['date']?.toString()),
                14,
                16,
              ),
            ],
            bottom: false,
          ),
        ],
      ),
    );
  }

  static pw.Widget _infoRow({
    required List<_InfoCell> cells,
    required bool bottom,
  }) {
    return pw.Container(
      decoration: pw.BoxDecoration(
        border: bottom
            ? const pw.Border(bottom: pw.BorderSide(color: _border, width: 0.75))
            : null,
      ),
      child: pw.Row(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          for (var i = 0; i < cells.length; i++) ...[
            pw.Expanded(
              flex: cells[i].labelFlex,
              child: pw.Container(
                decoration: pw.BoxDecoration(
                  border: pw.Border(
                    right: const pw.BorderSide(color: _border, width: 0.75),
                  ),
                ),
                padding: const pw.EdgeInsets.symmetric(horizontal: 6, vertical: 5),
                child: pw.Text(cells[i].label, style: _labelStyle),
              ),
            ),
            pw.Expanded(
              flex: cells[i].valueFlex,
              child: pw.Container(
                decoration: i < cells.length - 1
                    ? pw.BoxDecoration(
                        border: pw.Border(
                          right: const pw.BorderSide(color: _border, width: 0.75),
                        ),
                      )
                    : null,
                padding: const pw.EdgeInsets.symmetric(horizontal: 6, vertical: 5),
                child: pw.Text(cells[i].value, style: _valueStyle),
              ),
            ),
          ],
        ],
      ),
    );
  }

  static pw.Widget _picturesSection(List<Uint8List> slots) {
    return pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.stretch,
      children: [
        pw.Container(
          width: double.infinity,
          padding: const pw.EdgeInsets.symmetric(horizontal: 8, vertical: 5),
          decoration: const pw.BoxDecoration(
            border: pw.Border(
              left: pw.BorderSide(color: _border, width: 0.75),
              right: pw.BorderSide(color: _border, width: 0.75),
              bottom: pw.BorderSide(color: _border, width: 0.75),
            ),
          ),
          child: pw.Text('Pictures', style: _labelStyle),
        ),
        pw.Expanded(
          child: pw.Column(
            children: [
              pw.Expanded(
                child: pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.stretch,
                  children: [
                    pw.Expanded(child: _photoCell(slots[0])),
                    pw.Expanded(child: _photoCell(slots[1])),
                  ],
                ),
              ),
              pw.Expanded(
                child: pw.Row(
                  crossAxisAlignment: pw.CrossAxisAlignment.stretch,
                  children: [
                    pw.Expanded(child: _photoCell(slots[2], bottom: true)),
                    pw.Expanded(child: _photoCell(slots[3], bottom: true)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  static pw.Widget _photoCell(Uint8List bytes, {bool bottom = false}) {
    return pw.Container(
      decoration: pw.BoxDecoration(
        border: pw.Border(
          left: const pw.BorderSide(color: _border, width: 0.75),
          right: const pw.BorderSide(color: _border, width: 0.75),
          bottom: bottom
              ? const pw.BorderSide(color: _border, width: 0.75)
              : pw.BorderSide.none,
        ),
      ),
      padding: const pw.EdgeInsets.all(4),
      child: bytes.isEmpty
          ? pw.SizedBox.expand()
          : pw.Center(
              child: pw.Image(
                pw.MemoryImage(bytes),
                fit: pw.BoxFit.contain,
              ),
            ),
    );
  }

  static pw.Widget _signatureSection(Map<String, dynamic> report) {
    final preparedByPosition =
        report['preparedByPosition']?.toString() ?? 'PERSONNEL';
    final confirmedByLabel = report['confirmedByLabel']?.toString() ??
        'Signature of Printed Name / Position';

    return pw.Table(
      border: pw.TableBorder.all(color: _border, width: 0.75),
      columnWidths: {
        0: const pw.FlexColumnWidth(),
        1: const pw.FlexColumnWidth(),
      },
      defaultVerticalAlignment: pw.TableCellVerticalAlignment.top,
      children: [
        pw.TableRow(
          children: [
            _sigHeader('Prepared By:'),
            _sigHeader('Confirmed By:'),
          ],
        ),
        pw.TableRow(
          children: [
            _sigBody(_signatoryName, preparedByPosition),
            _sigBodyLabel(confirmedByLabel),
          ],
        ),
      ],
    );
  }

  static pw.Widget _sigHeader(String text) {
    return pw.Padding(
      padding: const pw.EdgeInsets.fromLTRB(8, 6, 8, 4),
      child: pw.Text(text, style: _labelStyle),
    );
  }

  static pw.Widget _sigBody(String name, String role) {
    return pw.Padding(
      padding: const pw.EdgeInsets.fromLTRB(8, 0, 8, 8),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.SizedBox(height: 40),
          pw.Text(
            name,
            style: pw.TextStyle(
              fontSize: 10,
              fontWeight: pw.FontWeight.bold,
              decoration: pw.TextDecoration.underline,
            ),
          ),
          pw.SizedBox(height: 4),
          pw.Text(
            role.toUpperCase(),
            style: const pw.TextStyle(fontSize: 8),
          ),
        ],
      ),
    );
  }

  static pw.Widget _sigBodyLabel(String label) {
    return pw.Padding(
      padding: const pw.EdgeInsets.fromLTRB(8, 0, 8, 8),
      child: pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.center,
        children: [
          pw.SizedBox(height: 40),
          pw.Text(
            label.toUpperCase(),
            style: _labelStyle.copyWith(fontSize: 8),
            textAlign: pw.TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _InfoCell {
  const _InfoCell(this.label, this.value, this.labelFlex, this.valueFlex);

  final String label;
  final String value;
  final int labelFlex;
  final int valueFlex;
}
