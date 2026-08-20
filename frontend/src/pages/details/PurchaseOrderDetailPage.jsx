import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { MobileDetailField, MobileDetailShell, MobileStickyActions } from "@/components/layout/MobileDetailShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionWorkflow } from "@/components/workflow/TransactionWorkflow";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { getStatusDisplay } from "@/lib/status";
import { Navigate, useNavigate, useParams } from "react-router-dom";
function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const { state, getSupplierName, showToast } = useDemo();
  const navigate = useNavigate();
  const po = state.purchaseOrders.find((p) => p.id === id);
  if (!po) return /* @__PURE__ */ jsx(Navigate, { to: "/purchase-order", replace: true });
  const st = getStatusDisplay(po.status);
  const receiveItems = () => {
    if (po.status === "fully_received") {
      showToast("info", "All items have been received.");
      return;
    }
    navigate(`/inventory/receiving?po=${po.id}`);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      MobileDetailShell,
      {
        title: po.id,
        backTo: "/purchase-order",
        actions: /* @__PURE__ */ jsxs(MobileStickyActions, { children: [
          /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: receiveItems, children: "Receive Items" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              className: "w-full",
              onClick: () => navigate(`/purchase-order/${po.id}/preview`),
              children: "Preview / Print"
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Supplier", value: getSupplierName(po.supplierId) }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Reference QTN", value: po.referenceQuotationId ?? "\u2014" }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Date", value: po.date }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Total", value: formatCurrency(po.total) })
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "mb-2 text-sm font-semibold text-text-primary", children: "Line Items" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: po.items.map((item) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-surface p-3 text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: item.productName }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-text-secondary", children: [
              item.quantity,
              " \xD7 ",
              formatCurrency(item.unitPrice)
            ] })
          ] }, item.productId)) }),
          /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-6 text-sm font-semibold text-text-primary", children: "Workflow" }),
          /* @__PURE__ */ jsx(TransactionWorkflow, { quotationId: po.referenceQuotationId })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsx(Navigate, { to: "/purchase-order", replace: true }) })
  ] });
}
export {
  PurchaseOrderDetailPage
};
