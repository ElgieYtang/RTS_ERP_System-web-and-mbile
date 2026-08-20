import { jsx, jsxs } from "react/jsx-runtime";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableLink,
  TableRow
} from "@/components/ui/table";
import { WorkflowTracker } from "@/components/workflow/WorkflowTracker";
import { workflowStages } from "@/config/workflow";
import { getStockLevels, useErp } from "@/data/erpStore";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
function InventoryReportsPage() {
  const { movements, outslips, createDeliveryReceiptFromOutslip } = useErp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState(null);
  const stock = getStockLevels(movements);
  const totalQuantity = stock.reduce((sum, row) => sum + row.quantity, 0);
  const records = useMemo(() => {
    const text = query.trim().toLowerCase();
    return movements.filter((row) => {
      if (!text) return true;
      return [
        row.item,
        row.itemCode,
        row.project,
        row.customer,
        row.poId,
        row.outslipId,
        row.warehouse
      ].join(" ").toLowerCase().includes(text);
    });
  }, [movements, query]);
  function handleCreateDeliveryReceipt(outslipId) {
    if (outslipId === "\u2014") return;
    const result = createDeliveryReceiptFromOutslip(outslipId);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    navigate(`/delivery-receipts?id=${result.receipt?.id}`);
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Inventory & Reports",
        description: "Current stock and inventory records from released outslips, on one page."
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Items" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-3xl font-semibold text-text-primary", children: stock.length })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Total quantity on hand" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-3xl font-semibold text-text-primary", children: totalQuantity })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Inventory records" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-3xl font-semibold text-text-primary", children: movements.length })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "lg:col-span-2", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 text-base font-semibold text-text-primary", children: "Current stock" }),
        /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Item Code" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Item" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Quantity" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Unit" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: stock.map((row) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: row.itemCode }),
            /* @__PURE__ */ jsx(TableCell, { children: row.item }),
            /* @__PURE__ */ jsx(TableCell, { children: row.quantity }),
            /* @__PURE__ */ jsx(TableCell, { children: row.unit })
          ] }, row.itemCode)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-3 text-base font-semibold text-text-primary", children: "Workflow" }),
        /* @__PURE__ */ jsx(WorkflowTracker, { stages: workflowStages("Inventory & Reports") })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-3 flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-text-primary", children: "Inventory records" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          value: query,
          onChange: (event) => setQuery(event.target.value),
          placeholder: "Search item, PO, outslip, project\u2026",
          className: "max-w-sm"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Item" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Qty" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Warehouse" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Project" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Customer" }),
        /* @__PURE__ */ jsx(TableHead, { children: "PO" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Outslip" }),
        /* @__PURE__ */ jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: records.map((row) => {
        const outslip = outslips.find((item) => item.id === row.outslipId);
        return /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: row.date }),
          /* @__PURE__ */ jsxs(TableCell, { children: [
            row.item,
            /* @__PURE__ */ jsx("div", { className: "text-xs text-text-secondary", children: row.itemCode })
          ] }),
          /* @__PURE__ */ jsxs(TableCell, { children: [
            row.quantity,
            " ",
            row.unit
          ] }),
          /* @__PURE__ */ jsx(TableCell, { children: row.warehouse }),
          /* @__PURE__ */ jsx(TableCell, { children: row.project }),
          /* @__PURE__ */ jsx(TableCell, { children: row.customer }),
          /* @__PURE__ */ jsx(TableCell, { children: row.poId !== "\u2014" ? /* @__PURE__ */ jsx(TableLink, { onClick: () => navigate("/purchase-orders"), children: row.poId }) : "\u2014" }),
          /* @__PURE__ */ jsx(TableCell, { children: row.outslipId !== "\u2014" ? /* @__PURE__ */ jsx(TableLink, { onClick: () => navigate(`/outslips?id=${row.outslipId}`), children: row.outslipId }) : "\u2014" }),
          /* @__PURE__ */ jsx(TableCell, { children: outslip?.status === "released" && /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "secondary",
              onClick: () => handleCreateDeliveryReceipt(outslip.id),
              children: "Create DR"
            }
          ) })
        ] }, row.id);
      }) })
    ] }),
    message && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-text-secondary", children: message })
  ] });
}
export {
  InventoryReportsPage
};
