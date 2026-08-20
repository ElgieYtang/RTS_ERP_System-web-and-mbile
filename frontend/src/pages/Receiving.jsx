import { jsx, jsxs } from "react/jsx-runtime";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TABLE_ACTIONS_CELL_CLASS, TABLE_ACTIONS_HEAD_CLASS, TableActions } from "@/components/ui/action-menu";
import { Modal } from "@/components/ui/modal";
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
import { filterByDateRange } from "@/lib/dateFilter";
import { getStatusDisplay } from "@/lib/status";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
function ReceivingPage() {
  const { state, getSupplierName, confirmReceiving, showToast } = useDemo();
  const [searchParams] = useSearchParams();
  const poFromUrl = searchParams.get("po");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewId, setViewId] = useState(null);
  const filtered = useMemo(() => {
    let list = state.receivings;
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (r) => r.id.toLowerCase().includes(q) || r.purchaseOrderId.toLowerCase().includes(q) || getSupplierName(r.supplierId).toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
    list = filterByDateRange(list, dateFrom, dateTo, "date");
    return list;
  }, [state.receivings, search, statusFilter, dateFrom, dateTo, getSupplierName]);
  const viewRec = viewId ? state.receivings.find((r) => r.id === viewId) : null;
  const linkedPo = poFromUrl ? state.purchaseOrders.find((p) => p.id === poFromUrl) : null;
  const handleConfirm = (recId) => {
    const rec = state.receivings.find((r) => r.id === recId);
    if (!rec) return;
    if (rec.status === "completed") {
      showToast("info", "Receiving already completed.");
      return;
    }
    if (rec.status === "partial") {
      const remaining = rec.items.reduce((s, i) => s + i.remaining, 0);
      showToast("info", `${remaining} items remaining to be received.`);
    }
    confirmReceiving(recId);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Receiving",
        description: "Incoming goods from supplier POs. Posts to inventory (in).",
        breadcrumbs: ["Transaction", "Receiving"]
      }
    ),
    linkedPo && /* @__PURE__ */ jsxs("div", { className: "mb-4 rounded-lg border border-maroon/30 bg-maroon-light p-4 text-sm", children: [
      /* @__PURE__ */ jsx("strong", { children: "PO selected:" }),
      " ",
      linkedPo.id,
      " \u2014 ",
      linkedPo.items.map((i) => i.productName).join(", "),
      /* @__PURE__ */ jsx(Button, { size: "sm", className: "ml-4", onClick: () => showToast("info", "Use Confirm Receiving on the matching record below."), children: "New Receiving" })
    ] }),
    /* @__PURE__ */ jsx(
      TableFilters,
      {
        search,
        onSearchChange: setSearch,
        statusFilter,
        onStatusChange: setStatusFilter,
        statusOptions: [
          { value: "completed", label: "Completed" },
          { value: "partial", label: "Partially Received" }
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
        /* @__PURE__ */ jsx(TableHead, { children: "Receiving No." }),
        /* @__PURE__ */ jsx(TableHead, { children: "Purchase Order" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Supplier" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsx(TableHead, { className: TABLE_ACTIONS_HEAD_CLASS, children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { className: "hover:bg-transparent", children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, children: /* @__PURE__ */ jsx(EmptyState, {}) }) }) : filtered.map((r) => {
        const st = getStatusDisplay(r.status);
        return /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(TableLink, { onClick: () => setViewId(r.id), children: r.id }) }),
          /* @__PURE__ */ jsx(TableCell, { children: r.purchaseOrderId }),
          /* @__PURE__ */ jsx(TableCell, { children: getSupplierName(r.supplierId) }),
          /* @__PURE__ */ jsx(TableCell, { children: r.date }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
          /* @__PURE__ */ jsx(TableCell, { className: TABLE_ACTIONS_CELL_CLASS, children: /* @__PURE__ */ jsx(
            TableActions,
            {
              onPrint: () => window.print()
            }
          ) })
        ] }, r.id);
      }) })
    ] }),
    /* @__PURE__ */ jsx(Modal, { open: !!viewRec, onClose: () => setViewId(null), title: "Receiving Details", size: "lg", children: viewRec && /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Receiving No:" }),
          " ",
          /* @__PURE__ */ jsx("strong", { children: viewRec.id })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "PO:" }),
          " ",
          viewRec.purchaseOrderId
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Supplier:" }),
          " ",
          getSupplierName(viewRec.supplierId)
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Date:" }),
          " ",
          viewRec.date
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Item" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Ordered" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Received" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Remaining" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: viewRec.items.map((i) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: i.productName }),
          /* @__PURE__ */ jsx(TableCell, { children: i.ordered }),
          /* @__PURE__ */ jsx(TableCell, { children: i.received }),
          /* @__PURE__ */ jsx(TableCell, { children: i.remaining })
        ] }, i.productId)) })
      ] }),
      viewRec.status !== "completed" && /* @__PURE__ */ jsx(Button, { onClick: () => handleConfirm(viewRec.id), children: "Confirm Receiving" })
    ] }) })
  ] });
}
export {
  ReceivingPage
};
