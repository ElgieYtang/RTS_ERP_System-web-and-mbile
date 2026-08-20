import { jsx, jsxs } from "react/jsx-runtime";
import { StatusTabs } from "@/components/layout/Breadcrumbs";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionWorkflow } from "@/components/workflow/TransactionWorkflow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { useDemo } from "@/context/DemoContext";
import { filterByDateRange } from "@/lib/dateFilter";
import { getStatusDisplay } from "@/lib/status";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
const STATUS_ORDER = ["pending", "approved", "for_dispatch", "released"];
function OutslipsPage() {
  const {
    state,
    getCustomerName,
    approveOutslip,
    forDispatchOutslip,
    createDeliveryFromOutslip
  } = useDemo();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [viewId, setViewId] = useState(null);
  const [dispatchId, setDispatchId] = useState(null);
  const counts = useMemo(() => ({
    pending: state.outslips.filter((o) => o.status === "pending").length,
    approved: state.outslips.filter((o) => o.status === "approved").length,
    for_dispatch: state.outslips.filter((o) => o.status === "for_dispatch" || o.status === "released").length,
    all: state.outslips.length
  }), [state.outslips]);
  const filtered = useMemo(() => {
    let list = [...state.outslips];
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (o) => o.id.toLowerCase().includes(q) || getCustomerName(o.customerId).toLowerCase().includes(q)
      );
    }
    if (statusTab !== "all") {
      if (statusTab === "for_dispatch") {
        list = list.filter((o) => o.status === "for_dispatch" || o.status === "released");
      } else {
        list = list.filter((o) => o.status === statusTab);
      }
    }
    list = filterByDateRange(list, dateFrom, dateTo, "date");
    list.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
    return list;
  }, [state.outslips, search, statusTab, dateFrom, dateTo, getCustomerName]);
  const viewOs = viewId ? state.outslips.find((o) => o.id === viewId) : null;
  const openDetail = (id) => {
    if (isMobile) navigate(`/outslip/${id}`);
    else setViewId(id);
  };
  const handleCreateDR = (osId) => {
    const drId = createDeliveryFromOutslip(osId);
    if (drId) navigate("/delivery-receipt");
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Outslip",
        description: "Manage outgoing items linked to purchase orders.",
        breadcrumbs: ["Transaction", "Outslip"]
      }
    ),
    /* @__PURE__ */ jsx(
      StatusTabs,
      {
        active: statusTab,
        onChange: setStatusTab,
        tabs: [
          { key: "all", label: "All", count: counts.all },
          { key: "pending", label: "Pending", count: counts.pending },
          { key: "approved", label: "Approved", count: counts.approved },
          { key: "for_dispatch", label: "For Dispatch", count: counts.for_dispatch }
        ]
      }
    ),
    /* @__PURE__ */ jsx(TableFilters, { search, onSearchChange: setSearch, searchPlaceholder: "Search outslips...", showDateRange: true, dateFrom, dateTo, onDateFromChange: setDateFrom, onDateToChange: setDateTo }),
    /* @__PURE__ */ jsx(
      ResponsiveTable,
      {
        emptyMessage: "No outslips found.",
        mobileItems: filtered.map((o) => {
          const st = getStatusDisplay(o.status === "released" ? "for_dispatch" : o.status);
          const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
          return {
            id: o.id,
            title: o.id,
            subtitle: getCustomerName(o.customerId),
            badge: { label: st.label, variant: st.variant },
            fields: [
              { label: "Date", value: o.date },
              { label: "Items", value: `${itemCount} units` }
            ],
            onClick: () => openDetail(o.id)
          };
        }),
        desktop: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Outslip No." }),
            /* @__PURE__ */ jsx(TableHead, { children: "Reference" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Customer" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Items" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsx(TableHead, { className: TABLE_ACTIONS_HEAD_CLASS, children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { className: "hover:bg-transparent", children: /* @__PURE__ */ jsx(TableCell, { colSpan: 7, children: /* @__PURE__ */ jsx(EmptyState, {}) }) }) : filtered.map((o) => {
            const st = getStatusDisplay(o.status === "released" ? "for_dispatch" : o.status);
            const itemCount = o.items.reduce((s, i) => s + i.quantity, 0);
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(TableLink, { onClick: () => openDetail(o.id), children: o.id }) }),
              /* @__PURE__ */ jsx(TableCell, { children: o.referencePoId ?? "\u2014" }),
              /* @__PURE__ */ jsx(TableCell, { children: getCustomerName(o.customerId) }),
              /* @__PURE__ */ jsx(TableCell, { children: o.date }),
              /* @__PURE__ */ jsxs(TableCell, { children: [
                itemCount,
                " items"
              ] }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
              /* @__PURE__ */ jsx(TableCell, { className: TABLE_ACTIONS_CELL_CLASS, children: /* @__PURE__ */ jsx(
                TableActions,
                {
                  onPrint: () => window.print()
                }
              ) })
            ] }, o.id);
          }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(TransactionWorkflow, { quotationId: "QTN-00001" }) }),
    /* @__PURE__ */ jsx(Modal, { open: !!viewOs, onClose: () => setViewId(null), title: "Outslip Details", size: "md", children: viewOs && /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: viewOs.id }),
        " \u2014 ",
        getCustomerName(viewOs.customerId)
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Reference: ",
        viewOs.referencePoId ?? "\u2014"
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "list-disc pl-5", children: viewOs.items.map((i) => /* @__PURE__ */ jsxs("li", { children: [
        i.productName,
        " \xD7 ",
        i.quantity
      ] }, i.productId)) }),
      viewOs.status === "approved" && /* @__PURE__ */ jsx(Button, { onClick: () => setDispatchId(viewOs.id), children: "For Dispatch" }),
      (viewOs.status === "for_dispatch" || viewOs.status === "released") && /* @__PURE__ */ jsx(Button, { onClick: () => handleCreateDR(viewOs.id), children: "Create Delivery Receipt" })
    ] }) }),
    /* @__PURE__ */ jsx(
      ConfirmDialog,
      {
        open: !!dispatchId,
        onClose: () => setDispatchId(null),
        title: "For Dispatch",
        message: "Mark this outslip ready for dispatch? Inventory will be updated.",
        confirmLabel: "Confirm",
        onConfirm: () => {
          if (dispatchId) forDispatchOutslip(dispatchId);
        }
      }
    )
  ] });
}
export {
  OutslipsPage
};
