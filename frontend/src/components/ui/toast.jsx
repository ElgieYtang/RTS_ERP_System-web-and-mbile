import { jsx, jsxs } from "react/jsx-runtime";
import { useDemo } from "@/context/DemoContext";
import { cn } from "@/lib/utils";
import { CheckCircle, Info, X, XCircle } from "lucide-react";
function ToastContainer() {
  const { toasts, removeToast } = useDemo();
  if (toasts.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "fixed right-4 top-4 z-[100] flex flex-col gap-2 no-print", children: toasts.map((toast) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg min-w-[280px] max-w-sm animate-in fade-in slide-in-from-top-2",
        toast.type === "success" && "border-[#15803D]/30 bg-[#DCFCE7] text-[#15803D]",
        toast.type === "error" && "border-[#DC2626]/30 bg-[#FEE2E2] text-[#DC2626]",
        toast.type === "info" && "border-maroon/30 bg-maroon-light text-maroon"
      ),
      children: [
        toast.type === "success" && /* @__PURE__ */ jsx(CheckCircle, { className: "h-5 w-5 shrink-0" }),
        toast.type === "error" && /* @__PURE__ */ jsx(XCircle, { className: "h-5 w-5 shrink-0" }),
        toast.type === "info" && /* @__PURE__ */ jsx(Info, { className: "h-5 w-5 shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "flex-1 text-sm font-medium", children: toast.message }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => removeToast(toast.id),
            className: "shrink-0 opacity-70 hover:opacity-100",
            children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
          }
        )
      ]
    },
    toast.id
  )) });
}
export {
  ToastContainer
};
