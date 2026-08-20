import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { MobileDetailField, MobileDetailShell, MobileStickyActions } from "@/components/layout/MobileDetailShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionWorkflow } from "@/components/workflow/TransactionWorkflow";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { getStatusDisplay } from "@/lib/status";
import { Navigate, useNavigate, useParams } from "react-router-dom";
function OutslipDetailPage() {
  const { id } = useParams();
  const {
    state,
    getCustomerName,
    approveOutslip,
    forDispatchOutslip,
    createDeliveryFromOutslip
  } = useDemo();
  const navigate = useNavigate();
  const outslip = state.outslips.find((o) => o.id === id);
  if (!outslip) return /* @__PURE__ */ jsx(Navigate, { to: "/outslip", replace: true });
  const po = state.purchaseOrders.find((p) => p.id === outslip.referencePoId);
  const st = getStatusDisplay(outslip.status === "released" ? "for_dispatch" : outslip.status);
  const handleCreateDR = () => {
    const drId = createDeliveryFromOutslip(outslip.id);
    if (drId) navigate(`/delivery-receipt/${drId}`);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      MobileDetailShell,
      {
        title: outslip.id,
        backTo: "/outslip",
        actions: /* @__PURE__ */ jsxs(MobileStickyActions, { children: [
          outslip.status === "pending" && /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: () => approveOutslip(outslip.id), children: "Approve" }),
          outslip.status === "approved" && /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: () => forDispatchOutslip(outslip.id), children: "Mark For Dispatch" }),
          (outslip.status === "for_dispatch" || outslip.status === "released") && /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: handleCreateDR, children: "Create Delivery Receipt" })
        ] }),
        children: [
          /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Customer", value: getCustomerName(outslip.customerId) }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Reference PO", value: outslip.referencePoId ?? "\u2014" }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Date", value: outslip.date }),
            /* @__PURE__ */ jsx(
              MobileDetailField,
              {
                label: "Items",
                value: `${outslip.items.reduce((s, i) => s + i.quantity, 0)} units`
              }
            )
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "mb-2 text-sm font-semibold text-text-primary", children: "Line Items" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: outslip.items.map((item) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-surface p-3 text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium", children: item.productName }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-text-secondary", children: [
              item.quantity,
              " \xD7 ",
              formatCurrency(item.unitPrice)
            ] })
          ] }, item.productId)) }),
          /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-6 text-sm font-semibold text-text-primary", children: "Workflow" }),
          /* @__PURE__ */ jsx(TransactionWorkflow, { quotationId: po?.referenceQuotationId })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsx(Navigate, { to: "/outslip", replace: true }) })
  ] });
}
export {
  OutslipDetailPage
};
