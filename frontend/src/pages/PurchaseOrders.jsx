import { jsx, jsxs } from "react/jsx-runtime";
import { StatusTabs } from "@/components/layout/Breadcrumbs";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionWorkflow } from "@/components/workflow/TransactionWorkflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableActions } from "@/components/ui/action-menu";
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
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { getStatusDisplay } from "@/lib/status";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
function PurchaseOrdersPage() {
  const { state, getSupplierName, showToast } = useDemo();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [viewId, setViewId] = useState(null);
  const filtered = useMemo(() => {
    let list = state.purchaseOrders;
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (po) => po.id.toLowerCase().includes(q) || getSupplierName(po.supplierId).toLowerCase().includes(q) || (po.referenceQuotationId?.toLowerCase().includes(q) ?? false)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((po) => po.status === statusFilter);
    }
    return list;
  }, [state.purchaseOrders, search, statusFilter, getSupplierName]);
  const viewPo = viewId ? state.purchaseOrders.find((p) => p.id === viewId) : null;
  const openDetail = (id) => {
    if (isMobile) navigate(`/purchase-order/${id}`);
    else setViewId(id);
  };
  const receiveItems = (poId) => {
    const po = state.purchaseOrders.find((p) => p.id === poId);
    if (po?.status === "fully_received") {
      showToast("info", "All items have been received.");
      return;
    }
    navigate(`/inventory/receiving?po=${poId}`);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Purchase Orders",
        description: "Supplier purchase orders. Optional reference to an approved quotation.",
        breadcrumbs: ["Transaction", "Purchase Orders"]
      }
    ),
    /* @__PURE__ */ jsx(
      StatusTabs,
      {
        active: statusFilter,
        onChange: setStatusFilter,
        tabs: [
          { key: "pending", label: "Pending", count: state.purchaseOrders.filter((p) => p.status === "pending").length },
          { key: "approved", label: "Approved", count: state.purchaseOrders.filter((p) => p.status === "approved").length },
          { key: "fully_received", label: "Completed", count: state.purchaseOrders.filter((p) => p.status === "fully_received").length },
          { key: "all", label: "All", count: state.purchaseOrders.length }
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      TableFilters,
      {
        search,
        onSearchChange: setSearch
      }
    ),
    /* @__PURE__ */ jsx(
      ResponsiveTable,
      {
        emptyMessage: "No purchase orders found.",
        mobileItems: filtered.map((po) => {
          const st = getStatusDisplay(po.status);
          return {
            id: po.id,
            title: po.id,
            subtitle: getSupplierName(po.supplierId),
            badge: { label: st.label, variant: st.variant },
            fields: [
              { label: "Date", value: po.date },
              { label: "Amount", value: formatCurrency(po.total) }
            ],
            onClick: () => openDetail(po.id)
          };
        }),
        desktop: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
            /* @__PURE__ */ jsx(TableHead, { children: "PO No." }),
            /* @__PURE__ */ jsx(TableHead, { children: "Reference" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Supplier" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Amount" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { className: "hover:bg-transparent", children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, children: /* @__PURE__ */ jsx(EmptyState, {}) }) }) : filtered.map((po) => {
            const st = getStatusDisplay(po.status);
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(TableLink, { onClick: () => openDetail(po.id), children: po.id }) }),
              /* @__PURE__ */ jsx(TableCell, { children: po.referenceQuotationId ?? "\u2014" }),
              /* @__PURE__ */ jsx(TableCell, { children: getSupplierName(po.supplierId) }),
              /* @__PURE__ */ jsx(TableCell, { children: po.date }),
              /* @__PURE__ */ jsx(TableCell, { children: formatCurrency(po.total) }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
                TableActions,
                {
                  onView: () => openDetail(po.id),
                  menuItems: [
                    { label: "Preview", onClick: () => navigate(`/purchase-order/${po.id}/preview`) },
                    { label: "Print", onClick: () => {
                      navigate(`/purchase-order/${po.id}/preview`);
                      setTimeout(() => window.print(), 300);
                    } },
                    { label: "Receive Items", onClick: () => receiveItems(po.id) }
                  ]
                }
              ) })
            ] }, po.id);
          }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(Modal, { open: !!viewPo, onClose: () => setViewId(null), title: "Purchase Order Details", size: "lg", children: viewPo && /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "PO No:" }),
          " ",
          /* @__PURE__ */ jsx("strong", { children: viewPo.id })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Reference:" }),
          " ",
          viewPo.referenceQuotationId ?? "\u2014"
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Supplier:" }),
          " ",
          getSupplierName(viewPo.supplierId)
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Date:" }),
          " ",
          viewPo.date
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Total:" }),
          " ",
          /* @__PURE__ */ jsx("strong", { children: formatCurrency(viewPo.total) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "text-text-secondary", children: "Status:" }),
          " ",
          getStatusDisplay(viewPo.status).label
        ] })
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "list-disc pl-5", children: viewPo.items.map((i) => /* @__PURE__ */ jsxs("li", { children: [
        i.productName,
        " \xD7 ",
        i.quantity,
        " \u2014 ",
        formatCurrency(i.unitPrice),
        " each"
      ] }, i.productId)) }),
      /* @__PURE__ */ jsx(Button, { onClick: () => receiveItems(viewPo.id), children: "Receive Items" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(TransactionWorkflow, { quotationId: "QTN-00001" }) })
  ] });
}
export {
  PurchaseOrdersPage
};
