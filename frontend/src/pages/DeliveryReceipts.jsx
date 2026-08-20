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
function DeliveryReceiptsPage() {
  const {
    state,
    getCustomerName,
    markDeliveryOutForDelivery,
    markDeliveryDelivered
  } = useDemo();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [viewId, setViewId] = useState(null);
  const [deliverId, setDeliverId] = useState(null);
  const counts = useMemo(() => ({
    active: state.deliveryReceipts.filter((d) => d.status === "active").length,
    out_for_delivery: state.deliveryReceipts.filter((d) => d.status === "out_for_delivery").length,
    delivered: state.deliveryReceipts.filter((d) => d.status === "delivered").length,
    all: state.deliveryReceipts.length
  }), [state.deliveryReceipts]);
  const filtered = useMemo(() => {
    let list = [...state.deliveryReceipts];
    const q = search.toLowerCase();
    if (q) {
      list = list.filter(
        (d) => d.id.toLowerCase().includes(q) || getCustomerName(d.customerId).toLowerCase().includes(q)
      );
    }
    if (statusTab !== "all") {
      list = list.filter((d) => d.status === statusTab);
    }
    list = filterByDateRange(list, dateFrom, dateTo, "date");
    const order = ["active", "out_for_delivery", "delivered"];
    list.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
    return list;
  }, [state.deliveryReceipts, search, statusTab, dateFrom, dateTo, getCustomerName]);
  const viewDr = viewId ? state.deliveryReceipts.find((d) => d.id === viewId) : null;
  const openDetail = (id) => {
    if (isMobile) navigate(`/delivery-receipt/${id}`);
    else setViewId(id);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Delivery Receipt",
        description: "Track and confirm customer deliveries.",
        breadcrumbs: ["Transaction", "Delivery Receipt"]
      }
    ),
    /* @__PURE__ */ jsx(
      StatusTabs,
      {
        active: statusTab,
        onChange: setStatusTab,
        tabs: [
          { key: "all", label: "All", count: counts.all },
          { key: "active", label: "Active", count: counts.active },
          { key: "out_for_delivery", label: "Out for Delivery", count: counts.out_for_delivery },
          { key: "delivered", label: "Delivered", count: counts.delivered }
        ]
      }
    ),
    /* @__PURE__ */ jsx(TableFilters, { search, onSearchChange: setSearch, searchPlaceholder: "Search delivery receipts...", showDateRange: true, dateFrom, dateTo, onDateFromChange: setDateFrom, onDateToChange: setDateTo }),
    /* @__PURE__ */ jsx(
      ResponsiveTable,
      {
        emptyMessage: "No delivery receipts found.",
        mobileItems: filtered.map((d) => {
          const st = getStatusDisplay(d.status);
          return {
            id: d.id,
            title: d.id,
            subtitle: getCustomerName(d.customerId),
            badge: { label: st.label, variant: st.variant },
            fields: [
              { label: "Date", value: d.date },
              { label: "Driver", value: d.driver }
            ],
            onClick: () => openDetail(d.id)
          };
        }),
        desktop: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
            /* @__PURE__ */ jsx(TableHead, { children: "DR No." }),
            /* @__PURE__ */ jsx(TableHead, { children: "Reference Outslip" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Customer" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Delivery Date" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Driver" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Vehicle" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsx(TableHead, { className: TABLE_ACTIONS_HEAD_CLASS, children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: filtered.length === 0 ? /* @__PURE__ */ jsx(TableRow, { className: "hover:bg-transparent", children: /* @__PURE__ */ jsx(TableCell, { colSpan: 8, children: /* @__PURE__ */ jsx(EmptyState, {}) }) }) : filtered.map((d) => {
            const st = getStatusDisplay(d.status);
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(TableLink, { onClick: () => openDetail(d.id), children: d.id }) }),
              /* @__PURE__ */ jsx(TableCell, { children: d.referenceOutslipId }),
              /* @__PURE__ */ jsx(TableCell, { children: getCustomerName(d.customerId) }),
              /* @__PURE__ */ jsx(TableCell, { children: d.date }),
              /* @__PURE__ */ jsx(TableCell, { children: d.driver }),
              /* @__PURE__ */ jsx(TableCell, { children: d.vehicle }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
              /* @__PURE__ */ jsx(TableCell, { className: TABLE_ACTIONS_CELL_CLASS, children: /* @__PURE__ */ jsx(
                TableActions,
                {
                  onPrint: () => {
                    navigate(`/delivery-receipt/${d.id}/preview`);
                    setTimeout(() => window.print(), 300);
                  }
                }
              ) })
            ] }, d.id);
          }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(TransactionWorkflow, { quotationId: "QTN-00001" }) }),
    /* @__PURE__ */ jsx(Modal, { open: !!viewDr, onClose: () => setViewId(null), title: "Delivery Receipt Details", size: "md", children: viewDr && /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-sm", children: [
      /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("strong", { children: viewDr.id }) }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Customer: ",
        getCustomerName(viewDr.customerId)
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Reference Outslip: ",
        viewDr.referenceOutslipId
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Address: ",
        viewDr.deliveryAddress
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        "Driver: ",
        viewDr.driver,
        " | Vehicle: ",
        viewDr.vehicle
      ] }),
      viewDr.status === "out_for_delivery" && /* @__PURE__ */ jsx(Button, { onClick: () => setDeliverId(viewDr.id), children: "Mark as Delivered" })
    ] }) }),
    /* @__PURE__ */ jsx(
      ConfirmDialog,
      {
        open: !!deliverId,
        onClose: () => setDeliverId(null),
        title: "Mark as Delivered",
        message: "Mark this delivery as completed?",
        confirmLabel: "Confirm",
        onConfirm: () => {
          if (deliverId) markDeliveryDelivered(deliverId);
        }
      }
    )
  ] });
}
export {
  DeliveryReceiptsPage
};
