import { jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
function MobileDetailShell({ title, backTo, children, actions }) {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs("div", { className: "md:hidden", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => navigate(backTo),
          className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-maroon-light text-maroon",
          "aria-label": "Go back",
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsx("h1", { className: "truncate text-lg font-semibold text-text-primary", children: title })
    ] }),
    /* @__PURE__ */ jsx("div", { className: actions ? "pb-24" : void 0, children }),
    actions && /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: actions }) })
  ] });
}
function MobileDetailField({ label, value }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-border bg-surface px-4 py-3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-medium uppercase tracking-wide text-text-secondary", children: label }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm font-medium text-text-primary", children: value })
  ] });
}
function MobileStickyActions({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 sm:flex-row", children });
}
function MobileViewButton({ onClick, label = "View" }) {
  return /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-8 px-0 text-maroon", onClick, children: label });
}
export {
  MobileDetailField,
  MobileDetailShell,
  MobileStickyActions,
  MobileViewButton
};
