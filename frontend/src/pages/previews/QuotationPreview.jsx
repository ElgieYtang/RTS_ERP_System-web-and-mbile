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
function QuotationPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useDemo();
  const qtn = state.quotations.find((q) => q.id === id);
  if (!qtn) {
    return /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: "Quotation not found." });
  }
  const customer = state.customers.find((c) => c.id === qtn.customerId);
  const items = qtn.items.map((i) => ({
    name: i.productName,
    qty: i.quantity,
    price: i.unitPrice,
    amount: i.quantity * i.unitPrice
  }));
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(
      DocumentLayout,
      {
        title: "QUOTATION",
        footer: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-8 text-sm", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: "Prepared By" }),
            /* @__PURE__ */ jsx("p", { className: "mt-4 border-t border-border pt-2", children: qtn.preparedBy ?? "Admin User" })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: "Approved By" }),
            /* @__PURE__ */ jsx("p", { className: "mt-4 border-t border-border pt-2", children: qtn.approvedBy ?? "\u2014" })
          ] })
        ] }),
        children: [
          /* @__PURE__ */ jsx(DocumentRow, { label: "Quotation No.", value: qtn.id, highlight: true }),
          /* @__PURE__ */ jsx(DocumentRow, { label: "Date", value: qtn.date }),
          /* @__PURE__ */ jsx(DocumentRow, { label: "Valid Until", value: qtn.validUntil ?? "\u2014" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded border border-border p-3 text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: customer?.name }),
            /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: customer?.contactPerson }),
            /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: customer?.address }),
            /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: customer?.phone })
          ] }),
          /* @__PURE__ */ jsx(DocumentItemsTable, { items }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-end text-sm", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-right", children: [
            /* @__PURE__ */ jsxs("p", { children: [
              "Subtotal: ",
              formatCurrency(qtn.total)
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-lg font-bold", children: [
              "Grand Total: ",
              formatCurrency(qtn.total)
            ] })
          ] }) }),
          qtn.terms && /* @__PURE__ */ jsxs("div", { className: "mt-6 text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-maroon", children: "Terms and Conditions" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-text-secondary", children: qtn.terms })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx(PrintActions, { onBack: () => navigate("/quotations") })
  ] });
}
export {
  QuotationPreviewPage
};
