import { jsx, jsxs } from "react/jsx-runtime";
import {
  DocumentLayout,
  PrintActions
} from "@/components/documents/DocumentLayout";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { useNavigate } from "react-router-dom";
function SOAPreviewPage() {
  const navigate = useNavigate();
  const { state } = useDemo();
  const customerId = "cust-abc";
  const customer = state.customers.find((c) => c.id === customerId);
  const bills = state.billingStatements.filter((b) => b.customerId === customerId);
  const payments = state.soaPayments.filter((p) => p.customerId === customerId);
  const totalCharges = bills.reduce((s, b) => s + b.amount, 0);
  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = totalCharges - totalPayments;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(DocumentLayout, { title: "STATEMENT OF ACCOUNT", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-sm", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Customer:" }),
          " ",
          customer?.name
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Period:" }),
          " August 1\u201319, 2026"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("table", { className: "mt-6 w-full text-sm", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-border text-left text-xs uppercase text-text-secondary", children: [
          /* @__PURE__ */ jsx("th", { className: "pb-2", children: "Date" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2", children: "Reference" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2", children: "Description" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2 text-right", children: "Debit" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2 text-right", children: "Credit" }),
          /* @__PURE__ */ jsx("th", { className: "pb-2 text-right", children: "Balance" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          bills.map((b) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2", children: b.billingDate }),
            /* @__PURE__ */ jsx("td", { children: b.id }),
            /* @__PURE__ */ jsx("td", { children: "Laptop Computer Purchase" }),
            /* @__PURE__ */ jsx("td", { className: "text-right", children: formatCurrency(b.amount) }),
            /* @__PURE__ */ jsx("td", { className: "text-right", children: "\u2014" }),
            /* @__PURE__ */ jsx("td", { className: "text-right", children: formatCurrency(b.amount) })
          ] }, b.id)),
          payments.map((p) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border", children: [
            /* @__PURE__ */ jsx("td", { className: "py-2", children: p.date }),
            /* @__PURE__ */ jsx("td", { children: p.reference }),
            /* @__PURE__ */ jsx("td", { children: p.description }),
            /* @__PURE__ */ jsx("td", { className: "text-right", children: "\u2014" }),
            /* @__PURE__ */ jsx("td", { className: "text-right", children: formatCurrency(p.amount) }),
            /* @__PURE__ */ jsx("td", { className: "text-right", children: formatCurrency(totalCharges - p.amount) })
          ] }, p.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Total Charges:" }),
          /* @__PURE__ */ jsx("span", { children: formatCurrency(totalCharges) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
          /* @__PURE__ */ jsx("span", { children: "Total Payments:" }),
          /* @__PURE__ */ jsx("span", { children: formatCurrency(totalPayments) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between font-bold text-maroon", children: [
          /* @__PURE__ */ jsx("span", { children: "Outstanding Balance:" }),
          /* @__PURE__ */ jsx("span", { children: formatCurrency(outstanding) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 grid grid-cols-2 gap-8 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: "Prepared By" }),
          /* @__PURE__ */ jsx("p", { className: "mt-8 border-t border-border pt-2", children: "Admin User" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-text-secondary", children: "Authorized Signature" }),
          /* @__PURE__ */ jsx("p", { className: "mt-8 border-t border-border pt-2", children: "\xA0" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(PrintActions, { onBack: () => navigate("/soa") })
  ] });
}
export {
  SOAPreviewPage
};
