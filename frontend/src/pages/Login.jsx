import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, FileText, Package, ShoppingCart, Truck } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
const quickModules = [
  { label: "Quotations", icon: FileText, accent: "bg-maroon" },
  { label: "Purchase Orders", icon: ShoppingCart, accent: "bg-brand-orange" },
  { label: "Receiving", icon: Package, accent: "bg-maroon-dark" },
  { label: "Delivery Receipts", icon: Truck, accent: "bg-[#9B2335]" }
];
function LoginForm({
  email,
  password,
  showPassword,
  error,
  variant,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onForgotPassword,
  onSubmit
}) {
  const isMobile = variant === "mobile";
  const labelClass = isMobile ? "mb-1.5 block text-sm font-medium text-white/90" : "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-text-secondary";
  const inputClass = isMobile ? "login-field h-12 rounded-xl border border-white/10 bg-white px-4 text-text-primary placeholder:text-text-secondary/70" : "login-field h-11 rounded-xl border-transparent bg-white px-4 lg:bg-maroon-light/40";
  return /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: `email-${variant}`, className: labelClass, children: "Email" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          id: `email-${variant}`,
          type: "email",
          autoComplete: "username",
          value: email,
          onChange: (e) => onEmailChange(e.target.value),
          className: inputClass,
          placeholder: "you@company.com",
          required: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: `password-${variant}`, className: labelClass, children: "Password" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            id: `password-${variant}`,
            type: showPassword ? "text" : "password",
            autoComplete: "current-password",
            value: password,
            onChange: (e) => onPasswordChange(e.target.value),
            className: cn(inputClass, "pr-11"),
            placeholder: "Enter your password",
            required: true
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: onTogglePassword,
            className: "absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-maroon",
            "aria-label": showPassword ? "Hide password" : "Show password",
            children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
          }
        )
      ] }),
      !isMobile && /* @__PURE__ */ jsx("div", { className: "mt-2 text-right", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "text-xs font-medium italic text-maroon hover:underline",
          onClick: onForgotPassword,
          children: "Forgot password?"
        }
      ) })
    ] }),
    error && /* @__PURE__ */ jsx(
      "p",
      {
        className: cn(
          "rounded-lg px-3 py-2 text-sm",
          isMobile ? "bg-error-bg/90 text-error-text" : "bg-error-bg text-error-text"
        ),
        children: error
      }
    ),
    /* @__PURE__ */ jsx(
      Button,
      {
        type: "submit",
        size: "lg",
        className: cn(
          "h-12 w-full rounded-xl text-sm font-semibold shadow-md",
          isMobile ? "mt-2" : "uppercase tracking-wide"
        ),
        children: "Sign in"
      }
    )
  ] });
}
function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/";
  const [email, setEmail] = useState("admin@responsivcode.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  if (isAuthenticated) {
    return /* @__PURE__ */ jsx(Navigate, { to: from, replace: true });
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (login(email, password)) {
      navigate(from, { replace: true });
    } else {
      setError("Invalid email or password.");
    }
  };
  const handleForgotPassword = () => {
    setError("Password reset is not enabled in this demo.");
  };
  const formProps = {
    email,
    password,
    showPassword,
    error,
    onEmailChange: setEmail,
    onPasswordChange: setPassword,
    onTogglePassword: () => setShowPassword((v) => !v),
    onForgotPassword: handleForgotPassword,
    onSubmit: handleSubmit
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-[#141018] px-4 py-8 lg:hidden", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#1f1619] p-6 shadow-2xl sm:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "", className: "h-9 w-9 object-contain mix-blend-lighten" }),
        /* @__PURE__ */ jsx("span", { className: "text-lg font-bold text-maroon-light", children: "ResponsivCode" })
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-white", children: "Sign in" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-white/55", children: "Secure ERP access" }),
      /* @__PURE__ */ jsxs("div", { className: "my-6 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-white/10" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-white/45", children: "Sign in with your account" }),
        /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-white/10" })
      ] }),
      /* @__PURE__ */ jsx(LoginForm, { ...formProps, variant: "mobile" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-center gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleForgotPassword,
            className: "font-medium text-maroon-light hover:underline",
            children: "Forgot password?"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-white/30", children: "\xB7" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => setError("Please contact your system administrator for access."),
            className: "font-medium text-maroon-light hover:underline",
            children: "Contact support"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-8 text-center text-[10px] font-semibold uppercase tracking-widest text-white/35", children: "Authorized personnel only" })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "hidden min-h-screen lg:flex", children: [
      /* @__PURE__ */ jsxs("aside", { className: "relative flex w-[58%] flex-col justify-between bg-[#1a1214] px-14 py-12 text-white", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "", className: "h-11 w-11 object-contain mix-blend-lighten" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "text-lg font-bold tracking-wide", children: "RESPONSIVCODE" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs font-medium uppercase tracking-widest text-maroon-light/80", children: "ERP System" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("h1", { className: "mt-16 max-w-lg text-4xl font-bold leading-tight xl:text-5xl", children: [
            "Streamlined operations for",
            " ",
            /* @__PURE__ */ jsx("span", { className: "bg-gradient-to-r from-maroon-light via-brand-orange to-maroon-light bg-clip-text text-transparent", children: "your business." })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 max-w-md text-base leading-relaxed text-white/60", children: "Manage quotations, purchase orders, inventory movement, and delivery workflows from one secure workspace." }),
          /* @__PURE__ */ jsx("div", { className: "mt-14 grid grid-cols-2 gap-3", children: quickModules.map((item) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 backdrop-blur-sm",
              children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white",
                      item.accent
                    ),
                    children: /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wide text-white/90", children: item.label })
              ]
            },
            item.label
          )) })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-white/40", children: [
          "\xA9 ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " ResponsivCode. Internal use only."
        ] })
      ] }),
      /* @__PURE__ */ jsx("main", { className: "flex flex-1 flex-col items-center justify-center bg-surface px-12", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-10", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold tracking-tight text-[#1a1214]", children: "Sign in" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-text-secondary", children: "Secure ERP access" })
        ] }),
        /* @__PURE__ */ jsx(LoginForm, { ...formProps, variant: "desktop" }),
        /* @__PURE__ */ jsx("p", { className: "mt-10 text-center text-[10px] font-semibold uppercase tracking-widest text-text-secondary/70", children: "Authorized personnel only" })
      ] }) })
    ] })
  ] });
}
export {
  LoginPage
};
