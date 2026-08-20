import { jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/context/AuthContext";
import { DemoProvider } from "@/context/DemoContext";
import "./index.css";
import App from './App.jsx';
createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsx(StrictMode, { children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(DemoProvider, { children: /* @__PURE__ */ jsx(App, {}) }) }) })
);
