import { jsx } from "react/jsx-runtime";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/login", replace: true, state: { from: location.pathname } });
  }
  return /* @__PURE__ */ jsx(Outlet, {});
}
export {
  ProtectedRoute
};
