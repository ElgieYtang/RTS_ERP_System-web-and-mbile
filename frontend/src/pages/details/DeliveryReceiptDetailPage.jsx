import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { MobileDetailField, MobileDetailShell, MobileStickyActions } from "@/components/layout/MobileDetailShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionWorkflow } from "@/components/workflow/TransactionWorkflow";
import { useDemo } from "@/context/DemoContext";
import { getStatusDisplay } from "@/lib/status";
import { Navigate, useNavigate, useParams } from "react-router-dom";
function DeliveryReceiptDetailPage() {
  const { id } = useParams();
  const { state, getCustomerName, markDeliveryOutForDelivery, markDeliveryDelivered } = useDemo();
  const navigate = useNavigate();
  const dr = state.deliveryReceipts.find((d) => d.id === id);
  if (!dr) return /* @__PURE__ */ jsx(Navigate, { to: "/delivery-receipt", replace: true });
  const st = getStatusDisplay(dr.status);
  const outslip = state.outslips.find((o) => o.id === dr.referenceOutslipId);
  const po = outslip ? state.purchaseOrders.find((p) => p.id === outslip.referencePoId) : void 0;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      MobileDetailShell,
      {
        title: dr.id,
        backTo: "/delivery-receipt",
        actions: /* @__PURE__ */ jsxs(MobileStickyActions, { children: [
          dr.status === "active" && /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: () => markDeliveryOutForDelivery(dr.id), children: "Mark Out for Delivery" }),
          dr.status === "out_for_delivery" && /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: () => markDeliveryDelivered(dr.id), children: "Mark Delivered" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "secondary",
              className: "w-full",
              onClick: () => navigate(`/delivery-receipt/${dr.id}/preview`),
              children: "Preview / Print"
            }
          )
        ] }),
        children: [
          /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
          /* @__PURE__ */ jsxs("div", { className: "mb-4 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Customer", value: getCustomerName(dr.customerId) }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Reference OS", value: dr.referenceOutslipId }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Delivery Date", value: dr.date }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Address", value: dr.deliveryAddress }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Driver", value: dr.driver }),
            /* @__PURE__ */ jsx(MobileDetailField, { label: "Vehicle", value: dr.vehicle })
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "mb-2 mt-4 text-sm font-semibold text-text-primary", children: "Workflow" }),
          /* @__PURE__ */ jsx(TransactionWorkflow, { quotationId: po?.referenceQuotationId })
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsx(Navigate, { to: "/delivery-receipt", replace: true }) })
  ] });
}
export {
  DeliveryReceiptDetailPage
};
