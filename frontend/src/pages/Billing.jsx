import { jsx, jsxs } from "react/jsx-runtime";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { TABLE_ACTIONS_CELL_CLASS, TABLE_ACTIONS_HEAD_CLASS, TableActions } from "@/components/ui/action-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableLink,
  TableRow
} from "@/components/ui/table";
import { EmptyState, TableFilters } from "@/components/ui/table-filters";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { filterByDateRange } from "@/lib/dateFilter";
import { getStatusDisplay } from "@/lib/status";
import { useMemo, useState } from "react";
function BillingPage() {
  const { state, getCustomerName, recordPayment } = useDemo();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentId, setPaymentId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: "August 19, 2026",
    reference: "",
    remarks: ""
  });
  const filtered = useMemo(() => {
    let list = state.billingStatements;
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (b) => b.id.toLowerCase().includes(q) || getCustomerName(b.customerId).toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((b) => b.paymentStatus === statusFilter);
    }
    list = filterByDateRange(list, dateFrom, dateTo, "billingDate");
    return list;
  }, [state.billingStatements, search, statusFilter, dateFrom, dateTo, getCustomerName]);
  const paymentBill = paymentId ? state.billingStatements.find((b) => b.id === paymentId) : null;
  const savePayment = () => {
    if (!paymentId || !paymentForm.amount) return;
    recordPayment(
      paymentId,
      Number(paymentForm.amount),
      paymentForm.date,
      paymentForm.reference || `PAY-${Date.now()}`
    );
    setPaymentId(null);
    setPaymentForm({ amount: "", date: "August 19, 2026", reference: "", remarks: "" });
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Billing", description: "Generate and manage billing records." }),
    /* @__PURE__ */ jsx(
      TableFilters,
      {
        search,
        onSearchChange: setSearch,
        statusFilter,
        onStatusChange: setStatusFilter,
        statusOptions: [
          { value: "unpaid", label: "Unpaid" },
          { value: "partially_paid", label: "Partially Paid" },
          { value: "paid", label: "Paid" }
        ],
        showDateRange: true,
        dateFrom,
        dateTo,
        onDateFromChange: setDateFrom,
        onDateToChange: setDateTo
      }
    ),
    /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
        /* @__PURE__ */ jsx(TableHead, { children: "BS No." }),
        /* @__PURE__ */ jsx(TableHead, { children: "Customer" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Reference" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Billing Date" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Amount" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Payment Status" }),
        /* @__PURE__ */ jsx(TableHead, { className: TABLE_ACTIONS_HEAD_CLASS, children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { className: "hover:bg-transparent", children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, children: /* @__PURE__ */ jsx(EmptyState, {}) }) }) : filtered.map((b) => {
        const st = getStatusDisplay(b.paymentStatus);
        const balance = b.amount - (b.paidAmount ?? 0);
        return /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(TableLink, { children: b.id }) }),
          /* @__PURE__ */ jsx(TableCell, { children: getCustomerName(b.customerId) }),
          /* @__PURE__ */ jsx(TableCell, { children: b.referenceDrId ?? "\u2014" }),
          /* @__PURE__ */ jsx(TableCell, { children: b.billingDate }),
          /* @__PURE__ */ jsxs(TableCell, { children: [
            formatCurrency(b.amount),
            b.paymentStatus === "partially_paid" && /* @__PURE__ */ jsxs("span", { className: "text-xs text-text-secondary", children: [
              " (Bal: ",
              formatCurrency(balance),
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
          /* @__PURE__ */ jsx(TableCell, { className: TABLE_ACTIONS_CELL_CLASS, children: /* @__PURE__ */ jsx(
            TableActions,
            {
              onPrint: () => window.print()
            }
          ) })
        ] }, b.id);
      }) })
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: !!paymentBill, onClose: () => setPaymentId(null), title: "Record Payment", size: "md", children: paymentBill && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-text-secondary", children: [
        paymentBill.id,
        " \u2014 Balance: ",
        formatCurrency(paymentBill.amount - (paymentBill.paidAmount ?? 0))
      ] }),
      /* @__PURE__ */ jsx(FormField, { label: "Amount", children: /* @__PURE__ */ jsx(
        Input,
        {
          type: "number",
          value: paymentForm.amount,
          onChange: (e) => setPaymentForm({ ...paymentForm, amount: e.target.value })
        }
      ) }),
      /* @__PURE__ */ jsx(FormField, { label: "Payment Date", children: /* @__PURE__ */ jsx(
        Input,
        {
          value: paymentForm.date,
          onChange: (e) => setPaymentForm({ ...paymentForm, date: e.target.value })
        }
      ) }),
      /* @__PURE__ */ jsx(FormField, { label: "Reference", children: /* @__PURE__ */ jsx(
        Input,
        {
          value: paymentForm.reference,
          onChange: (e) => setPaymentForm({ ...paymentForm, reference: e.target.value })
        }
      ) }),
      /* @__PURE__ */ jsx(FormField, { label: "Remarks", children: /* @__PURE__ */ jsx(
        Input,
        {
          value: paymentForm.remarks,
          onChange: (e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })
        }
      ) }),
      /* @__PURE__ */ jsx(Button, { onClick: savePayment, children: "Save Payment" })
    ] }) })
  ] });
}
export {
  BillingPage
};
