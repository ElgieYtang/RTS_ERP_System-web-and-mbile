import { jsx, jsxs } from "react/jsx-runtime";
import { useAuth } from "@/context/AuthContext";
import { Bell, ChevronDown, LogOut, Menu, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.charAt(0).toUpperCase() ?? "A";
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };
  return /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-surface px-4 sm:px-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex min-w-0 items-center gap-2", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: onMenuClick,
        className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-maroon-light hover:text-maroon md:hidden",
        "aria-label": "Open menu",
        children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "rounded-md p-2 text-text-secondary transition-colors hover:bg-maroon-light hover:text-maroon",
          "aria-label": "Notifications",
          children: /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-text-primary transition-colors hover:bg-maroon-light",
          children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-maroon text-xs font-semibold text-white", children: initial }),
            /* @__PURE__ */ jsx("span", { className: "hidden sm:inline", children: user?.name ?? "Admin" }),
            /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-text-secondary" })
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: handleLogout,
          className: "rounded-md p-2 text-text-secondary transition-colors hover:bg-maroon-light hover:text-maroon",
          "aria-label": "Sign out",
          title: "Sign out",
          children: /* @__PURE__ */ jsx(LogOut, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: "/settings",
          className: "rounded-md p-2 text-text-secondary transition-colors hover:bg-maroon-light hover:text-maroon",
          "aria-label": "Settings",
          children: /* @__PURE__ */ jsx(Settings, { className: "h-5 w-5" })
        }
      )
    ] })
  ] });
}
export {
  Header
};
