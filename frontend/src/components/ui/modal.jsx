import { jsx, jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl"
};
function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  className
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 no-print", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/40", onClick: onClose }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "relative w-full rounded-lg border border-border bg-surface shadow-xl",
          sizeClasses[size],
          className
        ),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b border-border px-6 py-4", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-text-primary", children: title }),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: onClose,
                className: "rounded-md p-1 text-text-secondary hover:bg-maroon-light hover:text-maroon",
                children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "px-6 py-4", children })
        ]
      }
    )
  ] });
}
export {
  Modal
};
