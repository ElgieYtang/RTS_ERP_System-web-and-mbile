import { jsx, jsxs } from "react/jsx-runtime";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useDemo } from "@/context/DemoContext";
import { formatCurrency } from "@/lib/format";
import { getStatusDisplay } from "@/lib/status";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
function InventoryOverviewPage() {
  const { state } = useDemo();
  const navigate = useNavigate();
  const totalStock = state.products.reduce((s, p) => s + p.stock, 0);
  const lowStock = state.products.filter((p) => p.status === "Low Stock").length;
  const outOfStock = state.products.filter((p) => p.status === "Out of Stock").length;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Inventory Overview", description: "View current stock levels and inventory status." }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Total Products" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-3xl font-semibold", children: state.products.length })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Total Stock" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-3xl font-semibold", children: totalStock })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Low Stock" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-3xl font-semibold text-[#B45309]", children: lowStock })
      ] }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-text-secondary", children: "Out of Stock" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-3xl font-semibold", children: outOfStock })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-transparent", children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Product" }),
        /* @__PURE__ */ jsx(TableHead, { children: "SKU" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Category" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Price" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Stock" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsx(TableHead, {})
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: state.products.map((p) => {
        const st = getStatusDisplay(p.status);
        return /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: p.name }),
          /* @__PURE__ */ jsx(TableCell, { children: p.sku }),
          /* @__PURE__ */ jsx(TableCell, { children: p.category }),
          /* @__PURE__ */ jsx(TableCell, { children: formatCurrency(p.price) }),
          /* @__PURE__ */ jsx(TableCell, { children: p.stock }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: st.variant, children: st.label }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => navigate("/products"), children: "View Movement" }) })
        ] }, p.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-3", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: () => navigate("/inventory/receiving"), children: [
        /* @__PURE__ */ jsx(Package, { className: "h-4 w-4" }),
        " Receiving"
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => navigate("/inventory/outslips"), children: "Outslips" })
    ] })
  ] });
}
export {
  InventoryOverviewPage
};
