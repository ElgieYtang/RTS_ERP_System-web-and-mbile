import { jsx, jsxs } from "react/jsx-runtime";
import {
  DocumentLayout,
  PrintActions
} from "@/components/documents/DocumentLayout";
import { useDemo } from "@/context/DemoContext";
import { useNavigate } from "react-router-dom";
function AccomplishmentPreviewPage() {
  const navigate = useNavigate();
  const { state } = useDemo();
  const report = state.accomplishmentReports[0];
  if (!report) return null;
  const rows = [
    ["Total Quotations", report.totalQuotations],
    ["Approved Quotations", report.approvedQuotations],
    ["Purchase Orders", report.purchaseOrders],
    ["Receiving Transactions", report.receivingTransactions],
    ["Outslips", report.outslips],
    ["Delivery Receipts", report.deliveryReceipts],
    ["Billing Statements", report.billingStatements],
    ["Completed Deliveries", report.completedDeliveries]
  ];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(DocumentLayout, { title: "ACCOMPLISHMENT REPORT", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Reporting Period:" }),
        " ",
        report.periodStart,
        " \u2013 ",
        report.periodEnd
      ] }),
      /* @__PURE__ */ jsx("table", { className: "mt-6 w-full text-sm", children: /* @__PURE__ */ jsx("tbody", { children: rows.map(([label, value]) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
        /* @__PURE__ */ jsx("td", { className: "py-2 text-text-secondary", children: label }),
        /* @__PURE__ */ jsx("td", { className: "py-2 text-right font-medium", children: value })
      ] }, label)) }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 text-sm", children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium text-maroon", children: "Remarks" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-text-secondary", children: report.remarks })
      ] })
    ] }),
    /* @__PURE__ */ jsx(PrintActions, { onBack: () => navigate("/reports/accomplishment") })
  ] });
}
export {
  AccomplishmentPreviewPage
};
