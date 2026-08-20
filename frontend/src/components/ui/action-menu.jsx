import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
function ActionMenu({ items, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return /* @__PURE__ */ jsxs("div", { ref, className: cn("relative", className), children: [
    /* @__PURE__ */ jsx(
      Button,
      {
        variant: "ghost",
        size: "sm",
        onClick: () => setOpen(!open),
        className: "px-2",
        children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" })
      }
    ),
    open && /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-md border border-border bg-surface py-1 shadow-lg", children: items.map((item) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => {
          item.onClick();
          setOpen(false);
        },
        className: cn(
          "block w-full px-3 py-2 text-left text-sm hover:bg-maroon-light",
          item.destructive ? "text-[#DC2626]" : "text-text-primary"
        ),
        children: item.label
      },
      item.label
    )) })
  ] });
}
function TableActions({
  onView,
  menuItems
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 no-print", children: [
    onView && /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: onView, children: "View" }),
    /* @__PURE__ */ jsx(ActionMenu, { items: menuItems })
  ] });
}
function LoadingButton({
  loading,
  children,
  onClick,
  variant = "primary"
}) {
  return /* @__PURE__ */ jsx(
    Button,
    {
      variant,
      onClick,
      disabled: loading,
      children: loading ? "Loading..." : children
    }
  );
}
export {
  ActionMenu,
  LoadingButton,
  TableActions
};
