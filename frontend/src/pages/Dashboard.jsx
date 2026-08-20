import { jsx, jsxs } from "react/jsx-runtime";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableLink,
  TableRow
} from "@/components/ui/table";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { getStatusDisplay } from "@/lib/status";
import { AlertCircle, ClipboardList, FileText, ShoppingCart, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
function DashboardPage() {
  const { state } = useDemo();
  const navigate = useNavigate();
  const pendingQuotations = state.quotations.filter((q) => q.status === "pending").length;
  const pendingReceiving = state.receivings.filter((r) => r.status !== "completed").length;
  const openPurchaseOrders = state.purchaseOrders.filter(
    (p) => p.status !== "cancelled" && p.status !== "fully_received"
  ).length;
  const activeDeliveries = state.deliveryReceipts.filter(
    (d) => d.status === "out_for_delivery" || d.status === "active"
  ).length;
  const stats = [
    {
      label: "Pending Quotations",
      value: String(pendingQuotations),
      change: "Needs attention",
      icon: FileText,
      path: "/quotations"
    },
    {
      label: "Open Purchase Orders",
      value: String(openPurchaseOrders),
      change: "Supplier POs",
      icon: ShoppingCart,
      path: "/purchase-order"
    },
    {
      label: "Open Receiving",
      value: String(pendingReceiving),
      change: "Stock in from suppliers",
      icon: ClipboardList,
      path: "/inventory/receiving"
    },
    {
      label: "Active Deliveries",
      value: String(activeDeliveries),
      change: "See delivery receipts",
      icon: Truck,
      path: "/delivery-receipt"
    }
  ];
  const recentRows = [
    {
      id: "QTN-00001",
      type: "Quotation",
      party: "ABC Corporation",
      amount: formatCurrency(4e5),
      status: "approved",
      path: "/quotations/QTN-00001"
    },
    {
      id: "PO-00001",
      type: "Purchase Order",
      party: "TechSource Philippines",
      amount: formatCurrency(4e5),
      status: "fully_received",
      path: "/purchase-order/PO-00001"
    },
    {
      id: "REC-00001",
      type: "Receiving",
      party: "RTS-MAIN",
      amount: "\u2014",
      status: "completed",
      path: "/inventory/receiving"
    },
    {
      id: "DR-00001",
      type: "Delivery Receipt",
      party: "ABC Corporation",
      amount: "\u2014",
      status: "active",
      path: "/delivery-receipt/DR-00001"
    }
  ];
  const needsAttention = [
    pendingQuotations > 0 ? `${pendingQuotations} quotation(s) pending approval` : null,
    pendingReceiving > 0 ? `${pendingReceiving} receiving record(s) still open` : null,
    "Create a delivery receipt after stock is available"
  ].filter(Boolean);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Dashboard",
        description: "Overview of current transactions and workflow status."
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", children: stats.map((stat) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => navigate(stat.path),
        className: "text-left",
        children: /* @__PURE__ */ jsx(Card, { className: "h-full transition-colors hover:border-maroon/30", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: stat.label }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-3xl font-semibold text-text-primary", children: stat.value }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-text-secondary", children: stat.change })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-lg bg-maroon-light", children: /* @__PURE__ */ jsx(stat.icon, { className: "h-5 w-5 text-maroon" }) })
        ] }) }) })
      },
      stat.label
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 text-base font-semibold text-text-primary", children: "Recent Transactions" }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "overflow-x-auto pt-2", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Document No." }),
            /* @__PURE__ */ jsx(TableHead, { children: "Type" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Party" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Amount" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: recentRows.map((tx) => {
            const st = getStatusDisplay(tx.status);
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(TableLink, { onClick: () => navigate(tx.path), children: tx.id }) }),
              /* @__PURE__ */ jsx(TableCell, { children: tx.type }),
              /* @__PURE__ */ jsx(TableCell, { children: tx.party }),
              /* @__PURE__ */ jsx(TableCell, { children: tx.amount }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) })
            ] }, tx.id);
          }) })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 text-base font-semibold text-text-primary", children: "Needs Attention" }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: needsAttention.map((item) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-text-primary", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "mt-0.5 h-4 w-4 shrink-0 text-maroon" }),
          item
        ] }, item)) }) }) })
      ] })
    ] })
  ] });
}
export {
  DashboardPage
};
