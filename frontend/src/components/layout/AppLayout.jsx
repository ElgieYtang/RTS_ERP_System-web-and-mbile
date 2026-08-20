import { jsx, jsxs } from "react/jsx-runtime";
import { ToastContainer } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const isDetailRoute = /\/(quotations|purchase-order|outslip|delivery-receipt)\/[^/]+$/.test(location.pathname) && !location.pathname.endsWith("/preview");
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-page", children: [
    /* @__PURE__ */ jsx(Sidebar, { mobileOpen: mobileNavOpen, onMobileClose: () => setMobileNavOpen(false) }),
    /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col md:ml-[250px]", children: [
      !isDetailRoute && /* @__PURE__ */ jsx(Header, { onMenuClick: () => setMobileNavOpen(true) }),
      /* @__PURE__ */ jsx("main", { className: cnMain(isDetailRoute), children: /* @__PURE__ */ jsx(Outlet, {}) })
    ] }),
    /* @__PURE__ */ jsx(ToastContainer, {})
  ] });
}
function cnMain(isDetailRoute) {
  if (isDetailRoute) {
    return "flex-1 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6";
  }
  return "flex-1 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-6 md:pb-6";
}
export {
  AppLayout
};
