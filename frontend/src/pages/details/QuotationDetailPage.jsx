import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { MobileDetailField, MobileDetailShell, MobileStickyActions } from "@/components/layout/MobileDetailShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuotationWorkflow } from "@/components/workflow/quotationWorkflow";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { getStatusDisplay } from "@/lib/status";
import { Navigate, useNavigate, useParams } from "react-router-dom";
function QuotationDetailPage() {
  const { id } = useParams();
  const { state, getCustomerName, convertQuotationToPO, showToast } = useDemo();
  const navigate = useNavigate();
  const quotation = state.quotations.find((q) => q.id === id);
  if (!quotation) return /* @__PURE__ */ jsx(Navigate, { to: "/quotations", replace: true });
  const st = getStatusDisplay(quotation.status);
  const handleConvertPO = () => {
    const poId = convertQuotationToPO(quotation.id);
    if (poId) {
      showToast("info", `Created ${poId}`);
      navigate(`/purchase-order/${poId}`);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      MobileDetailShell,
      {
        title: quotation.id,
        backTo: "/quotations",
        actions: /* @__PURE__ */ jsxs(MobileStickyActions, { children: [
          quotation.status === "approved" && /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: handleConvertPO, children: "Create Purchase Order" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              className: "w-full",
              onClick: () => navigate(`/quotations/${quotation.id}/preview`),
              children: "Preview / Print"
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ jsx("div", { className: "mb-4 flex items-center gap-2", children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Customer", value: getCustomerName(quotation.customerId) }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Date", value: quotation.date }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Valid Until", value: quotation.validUntil ?? "\u2014" }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Total", value: formatCurrency(quotation.total) })
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "mb-2 text-sm font-semibold text-text-primary", children: "Line Items" }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: quotation.items.map((item) => /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-surface p-3 text-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "font-medium text-text-primary", children: item.productName }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-text-secondary", children: [
              item.quantity,
              " \xD7 ",
              formatCurrency(item.unitPrice),
              " =",
              " ",
              formatCurrency(item.quantity * item.unitPrice)
            ] })
          ] }, item.productId)) }),
          quotation.terms && /* @__PURE__ */ jsxs("p", { className: "mt-4 text-sm text-text-secondary", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium text-text-primary", children: "Terms: " }),
            quotation.terms
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-6 text-sm font-semibold text-text-primary", children: "Workflow" }),
          /* @__PURE__ */ jsx(QuotationWorkflow, { quotation })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsx(Navigate, { to: "/quotations", replace: true }) })
  ] });
}
export {
  QuotationDetailPage
};
