import { jsx, jsxs } from "react/jsx-runtime";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/action-menu";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
function SOAPage() {
  const { state, getCustomerName, generateSOA } = useDemo();
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState("cust-abc");
  const [loading, setLoading] = useState(false);
  const customer = state.customers.find((c) => c.id === customerId);
  const bills = state.billingStatements.filter((b) => b.customerId === customerId);
  const payments = state.soaPayments.filter((p) => p.customerId === customerId);
  const totalCharges = bills.reduce((s, b) => s + b.amount, 0);
  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = totalCharges - totalPayments;
  const transactions = useMemo(() => {
    const rows = [];
    let balance = 0;
    bills.forEach((b) => {
      balance += b.amount;
      rows.push({
        date: b.billingDate,
        ref: b.id,
        desc: `${b.referenceDrId ? "Delivery billing" : "Billing"} \u2014 ${getCustomerName(b.customerId)}`,
        debit: b.amount,
        credit: 0,
        balance
      });
    });
    payments.forEach((p) => {
      balance -= p.amount;
      rows.push({
        date: p.date,
        ref: p.reference,
        desc: p.description,
        debit: 0,
        credit: p.amount,
        balance
      });
    });
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, [bills, payments, getCustomerName]);
  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      generateSOA();
      setLoading(false);
    }, 400);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Statement of Account",
        description: "Generate and manage customer SOA documents.",
        action: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(LoadingButton, { loading, onClick: handleGenerate, children: "Generate SOA" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => navigate("/soa/preview"), children: "Preview" }),
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => {
            navigate("/soa/preview");
            setTimeout(() => window.print(), 300);
          }, children: "Print" })
        ] })
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("label", { className: "text-sm font-medium", children: "Customer:" }),
      /* @__PURE__ */ jsx(
        "select",
        {
          value: customerId,
          onChange: (e) => setCustomerId(e.target.value),
          className: "h-9 rounded-md border border-border-input bg-surface px-3 text-sm",
          children: state.customers.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Card, { className: "mb-6", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Period: August 1\u201319, 2026" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 font-semibold", children: customer?.name })
    ] }) }),
    /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Reference" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Description" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Debit" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Credit" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Balance" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: transactions.map((t, i) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { children: t.date }),
        /* @__PURE__ */ jsx(TableCell, { children: t.ref }),
        /* @__PURE__ */ jsx(TableCell, { children: t.desc }),
        /* @__PURE__ */ jsx(TableCell, { children: t.debit ? formatCurrency(t.debit) : "\u2014" }),
        /* @__PURE__ */ jsx(TableCell, { children: t.credit ? formatCurrency(t.credit) : "\u2014" }),
        /* @__PURE__ */ jsx(TableCell, { children: formatCurrency(t.balance) })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Total Charges" }),
        /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: formatCurrency(totalCharges) })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Total Payments" }),
        /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold", children: formatCurrency(totalPayments) })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Outstanding Balance" }),
        /* @__PURE__ */ jsx("p", { className: "text-xl font-semibold text-maroon", children: formatCurrency(outstanding) })
      ] }) })
    ] })
  ] });
}
export {
  SOAPage
};
