import { jsx, jsxs } from "react/jsx-runtime";
import {
  DocumentItemsTable,
  DocumentLayout,
  DocumentRow,
  PrintActions
} from "@/components/documents/DocumentLayout";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { useNavigate, useParams } from "react-router-dom";
function PurchaseOrderPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, getSupplierName } = useDemo();
  const po = state.purchaseOrders.find((p) => p.id === id);
  if (!po) return /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: "Purchase order not found." });
  const items = po.items.map((i) => ({
    name: i.productName,
    qty: i.quantity,
    price: i.unitPrice,
    amount: i.quantity * i.unitPrice
  }));
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(DocumentLayout, { title: "PURCHASE ORDER", children: [
      /* @__PURE__ */ jsx(DocumentRow, { label: "PO No.", value: po.id, highlight: true }),
      /* @__PURE__ */ jsx(DocumentRow, { label: "Reference Quotation", value: po.referenceQuotationId ?? "\u2014" }),
      /* @__PURE__ */ jsx(DocumentRow, { label: "Supplier", value: getSupplierName(po.supplierId) }),
      /* @__PURE__ */ jsx(DocumentRow, { label: "Date", value: po.date }),
      /* @__PURE__ */ jsx(DocumentItemsTable, { items }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 text-right text-lg font-bold", children: [
        "Total: ",
        formatCurrency(po.total)
      ] })
    ] }),
    /* @__PURE__ */ jsx(PrintActions, { onBack: () => navigate("/purchase-order") })
  ] });
}
export {
  PurchaseOrderPreviewPage
};
