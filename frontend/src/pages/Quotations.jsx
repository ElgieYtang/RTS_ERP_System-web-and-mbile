import { jsx, jsxs } from "react/jsx-runtime";
import { AddQuotationModal } from "@/components/quotations/AddQuotationModal";
import { StatusTabs } from "@/components/layout/Breadcrumbs";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { QuotationWorkflow } from "@/components/workflow/quotationWorkflow";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { filterByDateRange } from "@/lib/dateFilter";
import { getStatusDisplay } from "@/lib/status";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
function QuotationsPage() {
  const { state, getCustomerName, updateQuotation, cancelQuotation, convertQuotationToPO, showToast } = useDemo();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const filtered = useMemo(() => {
    let list = state.quotations;
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (qt) => qt.id.toLowerCase().includes(q) || getCustomerName(qt.customerId).toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((qt) => qt.status === statusFilter);
    }
    list = filterByDateRange(list, dateFrom, dateTo, "date");
    const order = ["pending", "approved", "rejected", "draft", "cancelled"];
    list.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
    return list;
  }, [state.quotations, search, statusFilter, dateFrom, dateTo, getCustomerName]);
  const viewQtn = viewId ? state.quotations.find((q) => q.id === viewId) : null;
  const editQtn = editId ? state.quotations.find((q) => q.id === editId) : null;
  const openDetail = (id) => {
    if (isMobile) navigate(`/quotations/${id}`);
    else setViewId(id);
  };
  const openEdit = (q) => {
    setEditId(q.id);
    setEditForm({ ...q });
  };
  const saveEdit = () => {
    if (!editId) return;
    updateQuotation(editId, editForm);
    showToast("success", "Quotation updated successfully.");
    setEditId(null);
  };
  const handleConvertPO = (qtnId) => {
    const poId = convertQuotationToPO(qtnId);
    if (poId) {
      navigate("/purchase-order");
      showToast("info", `Showing ${poId}`);
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Quotations",
        description: "Manage and track customer quotations.",
        breadcrumbs: ["Transaction", "Quotations"],
        action: /* @__PURE__ */ jsxs(Button, { onClick: () => setAddOpen(true), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
          "New Quotation"
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      StatusTabs,
      {
        active: statusFilter,
        onChange: setStatusFilter,
        tabs: [
          { key: "all", label: "All", count: state.quotations.length },
          { key: "pending", label: "Pending", count: state.quotations.filter((q) => q.status === "pending").length },
          { key: "approved", label: "Approved", count: state.quotations.filter((q) => q.status === "approved").length },
          { key: "rejected", label: "Rejected", count: state.quotations.filter((q) => q.status === "rejected").length }
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      TableFilters,
      {
        search,
        onSearchChange: setSearch,
        searchPlaceholder: "Search quotations...",
        showDateRange: true,
        dateFrom,
        dateTo,
        onDateFromChange: setDateFrom,
        onDateToChange: setDateTo
      }
    ),
    /* @__PURE__ */ jsx(
      ResponsiveTable,
      {
        emptyMessage: "No quotations found.",
        mobileItems: filtered.map((q) => {
          const st = getStatusDisplay(q.status);
          return {
            id: q.id,
            title: q.id,
            subtitle: getCustomerName(q.customerId),
            badge: { label: st.label, variant: st.variant },
            fields: [
              { label: "Date", value: q.date },
              { label: "Amount", value: formatCurrency(q.total) }
            ],
            onClick: () => openDetail(q.id)
          };
        }),
        desktop: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Quotation No." }),
            /* @__PURE__ */ jsx(TableHead, { children: "Customer" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Amount" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsx(TableHead, { className: TABLE_ACTIONS_HEAD_CLASS, children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { className: "hover:bg-transparent", children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, children: /* @__PURE__ */ jsx(EmptyState, {}) }) }) : filtered.map((q) => {
            const st = getStatusDisplay(q.status);
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(TableLink, { onClick: () => openDetail(q.id), children: q.id }) }),
              /* @__PURE__ */ jsx(TableCell, { children: getCustomerName(q.customerId) }),
              /* @__PURE__ */ jsx(TableCell, { children: q.date }),
              /* @__PURE__ */ jsx(TableCell, { children: formatCurrency(q.total) }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
              /* @__PURE__ */ jsx(TableCell, { className: TABLE_ACTIONS_CELL_CLASS, children: /* @__PURE__ */ jsx(
                TableActions,
                {
                  onEdit: () => openEdit(q),
                  onDelete: q.status !== "cancelled" ? () => setCancelId(q.id) : void 0,
                  onPrint: () => {
                    navigate(`/quotations/${q.id}/preview`);
                    setTimeout(() => window.print(), 300);
                  }
                }
              ) })
            ] }, q.id);
          }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(Modal, { open: !!viewQtn, onClose: () => setViewId(null), title: "Quotation Details", size: "lg", children: viewQtn && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Quotation No:" }),
          " ",
          /* @__PURE__ */ jsx("strong", { children: viewQtn.id })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Date:" }),
          " ",
          viewQtn.date
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Customer:" }),
          " ",
          getCustomerName(viewQtn.customerId)
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Valid Until:" }),
          " ",
          viewQtn.validUntil ?? "\u2014"
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Status:" }),
          " ",
          getStatusDisplay(viewQtn.status).label
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Total:" }),
          " ",
          /* @__PURE__ */ jsx("strong", { children: formatCurrency(viewQtn.total) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Item" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Qty" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Unit Price" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Amount" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: viewQtn.items.map((i) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: i.productName }),
          /* @__PURE__ */ jsx(TableCell, { children: i.quantity }),
          /* @__PURE__ */ jsx(TableCell, { children: formatCurrency(i.unitPrice) }),
          /* @__PURE__ */ jsx(TableCell, { children: formatCurrency(i.quantity * i.unitPrice) })
        ] }, i.productId)) })
      ] }),
      viewQtn.terms && /* @__PURE__ */ jsxs("p", { className: "text-sm text-text-secondary", children: [
        /* @__PURE__ */ jsx("strong", { children: "Terms:" }),
        " ",
        viewQtn.terms
      ] }),
      /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Workflow Progress" }),
      /* @__PURE__ */ jsx(QuotationWorkflow, { quotation: viewQtn }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-2", children: [
        viewQtn.status === "approved" && /* @__PURE__ */ jsx(Button, { onClick: () => handleConvertPO(viewQtn.id), children: "Convert to PO" }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => navigate(`/quotations/${viewQtn.id}/preview`), children: "Preview" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Modal, { open: !!editQtn, onClose: () => setEditId(null), title: "Edit Quotation", size: "lg", children: editQtn && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(FormField, { label: "Quotation No.", children: /* @__PURE__ */ jsx(Input, { value: editForm.id ?? editQtn.id, readOnly: true }) }),
        /* @__PURE__ */ jsx(FormField, { label: "Date", children: /* @__PURE__ */ jsx(
          Input,
          {
            value: editForm.date ?? editQtn.date,
            onChange: (e) => setEditForm({ ...editForm, date: e.target.value })
          }
        ) }),
        /* @__PURE__ */ jsx(FormField, { label: "Valid Until", className: "col-span-2", children: /* @__PURE__ */ jsx(
          Input,
          {
            value: editForm.validUntil ?? editQtn.validUntil ?? "",
            onChange: (e) => setEditForm({ ...editForm, validUntil: e.target.value })
          }
        ) }),
        /* @__PURE__ */ jsx(FormField, { label: "Terms", className: "col-span-2", children: /* @__PURE__ */ jsx(
          Input,
          {
            value: editForm.terms ?? editQtn.terms ?? "",
            onChange: (e) => setEditForm({ ...editForm, terms: e.target.value })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx(Button, { onClick: saveEdit, children: "Save" }),
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => setEditId(null), children: "Cancel" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(AddQuotationModal, { open: addOpen, onClose: () => setAddOpen(false) }),
    /* @__PURE__ */ jsx(
      ConfirmDialog,
      {
        open: !!cancelId,
        onClose: () => setCancelId(null),
        title: "Cancel Quotation",
        message: `Are you sure you want to cancel ${cancelId}?`,
        confirmLabel: "Confirm",
        onConfirm: () => {
          if (cancelId) {
            cancelQuotation(cancelId);
            showToast("success", "Quotation cancelled.");
          }
        }
      }
    )
  ] });
}
export {
  QuotationsPage
};
