import { jsx } from "react/jsx-runtime";
import { WorkflowTracker } from "@/components/workflow/WorkflowTracker";
import { useDemo } from "@/context/DemoContext";
function getQuotationWorkflow(quotationId, state) {
  const po = state.purchaseOrders.find((p) => p.referenceQuotationId === quotationId);
  const hasPO = !!po;
  const hasReceiving = po ? state.receivings.some((r) => r.purchaseOrderId === po.id) : false;
  const qtn = state.quotations.find((q) => q.id === quotationId);
  const dr = qtn ? state.deliveryReceipts.find((d) => d.customerId === qtn.customerId) : void 0;
  const hasDR = !!dr;
  const hasBilling = dr ? state.billingStatements.some((b) => b.referenceDrId === dr.id) : false;
  return [
    { label: "Quotation", status: "completed" },
    { label: "Purchase Order", status: hasPO ? "completed" : "current" },
    {
      label: "Receiving",
      status: hasReceiving ? "completed" : hasPO ? "current" : "future"
    },
    {
      label: "Delivery Receipt",
      status: hasDR ? dr?.status === "delivered" ? "completed" : "current" : hasReceiving ? "current" : "future"
    },
    { label: "Billing", status: hasBilling ? "current" : hasDR ? "current" : "future" }
  ];
}
function QuotationWorkflow({ quotation }) {
  const { state } = useDemo();
  return /* @__PURE__ */ jsx(WorkflowTracker, { stages: getQuotationWorkflow(quotation.id, state) });
}
export {
  QuotationWorkflow,
  getQuotationWorkflow
};
