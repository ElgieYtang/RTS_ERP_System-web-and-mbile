import 'api_client.dart';

class TransactionLists {
  const TransactionLists({
    this.purchaseOrders = const [],
    this.receivings = const [],
    this.outslips = const [],
    this.deliveryReceipts = const [],
    this.billings = const [],
  });

  final List<Map<String, dynamic>> purchaseOrders;
  final List<Map<String, dynamic>> receivings;
  final List<Map<String, dynamic>> outslips;
  final List<Map<String, dynamic>> deliveryReceipts;
  final List<Map<String, dynamic>> billings;

  static Future<TransactionLists> load(ApiClient api) async {
    final results = await Future.wait([
      api.getList('/purchase-orders'),
      api.getList('/receivings'),
      api.getList('/outslips'),
      api.getList('/delivery-receipts'),
      api.getList('/billings'),
    ]);

    return TransactionLists(
      purchaseOrders: results[0].cast<Map<String, dynamic>>(),
      receivings: results[1].cast<Map<String, dynamic>>(),
      outslips: results[2].cast<Map<String, dynamic>>(),
      deliveryReceipts: results[3].cast<Map<String, dynamic>>(),
      billings: results[4].cast<Map<String, dynamic>>(),
    );
  }
}
