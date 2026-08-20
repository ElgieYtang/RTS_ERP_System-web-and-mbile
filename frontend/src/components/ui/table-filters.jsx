import { jsx, jsxs } from "react/jsx-runtime";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
function TableFilters({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  statusFilter,
  onStatusChange,
  statusOptions,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("mb-4 flex flex-wrap items-center gap-3 no-print", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "relative min-w-[200px] flex-1 max-w-sm", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          value: search,
          onChange: (e) => onSearchChange(e.target.value),
          placeholder: searchPlaceholder,
          className: "pl-9"
        }
      )
    ] }),
    statusOptions && onStatusChange && /* @__PURE__ */ jsxs(
      "select",
      {
        value: statusFilter ?? "all",
        onChange: (e) => onStatusChange(e.target.value),
        className: "h-9 rounded-md border border-border-input bg-surface px-3 text-sm text-text-primary focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon-light",
        children: [
          /* @__PURE__ */ jsx("option", { value: "all", children: "All Status" }),
          statusOptions.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.value))
        ]
      }
    )
  ] });
}
function EmptyState({ message }) {
  return /* @__PURE__ */ jsxs("div", { className: "py-12 text-center", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-text-primary", children: message ?? "No transactions found." }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-text-secondary", children: "Try adjusting your search or filters." })
  ] });
}
export {
  EmptyState,
  TableFilters
};
