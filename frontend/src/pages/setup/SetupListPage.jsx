import { jsx, jsxs } from "react/jsx-runtime";
import { ActionMenu } from "@/components/ui/action-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState, TableFilters } from "@/components/ui/table-filters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDemo } from "@/context/DemoContext";
import { getStatusDisplay } from "@/lib/status";
import { useMemo, useState } from "react";
function SetupListPage({
  title,
  description,
  breadcrumbs,
  actionLabel = "+ Add",
  columns,
  rows,
  statusKey = "status",
  searchPlaceholder = "Search..."
}) {
  const { showToast } = useDemo();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const statusOptions = useMemo(() => {
    const values = [...new Set(rows.map((row) => row[statusKey]).filter(Boolean))];
    return values.map((value) => ({ value, label: value }));
  }, [rows, statusKey]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== "all" && row[statusKey] !== statusFilter) return false;
      if (!q) return true;
      return columns.some((col) => (row[col.key] ?? "").toLowerCase().includes(q));
    });
  }, [rows, search, statusFilter, columns, statusKey]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title,
        description,
        breadcrumbs,
        action: /* @__PURE__ */ jsx(Button, { onClick: () => showToast("info", `${title} add form is not enabled in this demo.`), children: actionLabel })
      }
    ),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
      /* @__PURE__ */ jsx(
        TableFilters,
        {
          search,
          onSearchChange: setSearch,
          searchPlaceholder,
          statusFilter,
          onStatusChange: setStatusFilter,
          statusOptions
        }
      ),
      filtered.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { message: "No records found." }) : /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
          columns.map((col) => /* @__PURE__ */ jsx(TableHead, { children: col.label }, col.key)),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filtered.map((row, i) => /* @__PURE__ */ jsxs(TableRow, { children: [
          columns.map((col) => /* @__PURE__ */ jsx(TableCell, { children: col.key === statusKey && row[col.key] ? /* @__PURE__ */ jsx(Badge, { variant: getStatusDisplay(row[col.key]).variant, children: row[col.key] }) : row[col.key] }, col.key)),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
            ActionMenu,
            {
              items: [
                {
                  label: "View",
                  onClick: () => showToast("info", "View is not enabled in this demo.")
                },
                {
                  label: "Edit",
                  onClick: () => showToast("info", "Edit is not enabled in this demo.")
                },
                {
                  label: "Deactivate",
                  destructive: true,
                  onClick: () => showToast("info", "Deactivate is not enabled in this demo.")
                }
              ]
            }
          ) }) })
        ] }, i)) })
      ] }) })
    ] }) })
  ] });
}
export {
  SetupListPage
};
