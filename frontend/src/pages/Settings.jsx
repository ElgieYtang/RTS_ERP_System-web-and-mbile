import { jsx, jsxs } from "react/jsx-runtime";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  fetchSettings,
  savePassword,
  saveSettings
} from "@/lib/api";
import { useEffect, useState } from "react";
const LOCAL_KEY = "erp-settings";
const defaultSettings = {
  company_name: "RESPONSIVCODE TECHNOLOGY SOLUTIONS",
  company_address: "Room 301E-3, Medalle Building, Fuente Osme\xF1a, Cebu City 6000",
  company_phone: "(032) 345-2283 / +63 917 573 4911",
  company_email: "lark.gel@gmail.com",
  user_name: "Admin",
  user_email: "admin@responsivcode.com",
  date_format: "F j, Y",
  paper_size: "A4"
};
function loadLocalSettings() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}
function FieldSelect({
  value,
  onChange,
  children
}) {
  return /* @__PURE__ */ jsx(
    "select",
    {
      value,
      onChange: (event) => onChange(event.target.value),
      className: cn(
        "flex h-9 w-full rounded-md border border-border-input bg-surface px-3 py-1 text-sm text-text-primary",
        "focus-visible:outline-none focus-visible:border-maroon focus-visible:ring-2 focus-visible:ring-maroon-light"
      ),
      children
    }
  );
}
function SettingsPage() {
  const [form, setForm] = useState(loadLocalSettings);
  const [password, setPassword] = useState({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    fetchSettings().then((data) => {
      setForm({ ...defaultSettings, ...data });
    }).catch(() => {
    });
  }, []);
  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function handleSaveSettings(event) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setStatus(null);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(form));
    try {
      await saveSettings(form);
    } catch {
    }
    setStatus("Settings saved.");
    setSaving(false);
  }
  async function handleSavePassword(event) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    if (password.password !== password.password_confirmation) {
      setError("New password and confirmation do not match.");
      return;
    }
    try {
      await savePassword(password);
      setPassword({
        current_password: "",
        password: "",
        password_confirmation: ""
      });
      setStatus("Password updated in Laravel.");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Password can only be changed when the Laravel API is running."
      );
    }
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: "Settings",
        description: "Company, user, and document settings. Saved through the Laravel API when it is available."
      }
    ),
    status && /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-success-text", children: status }),
    error && /* @__PURE__ */ jsx("p", { className: "mb-4 text-sm text-error-text", children: error }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSaveSettings, className: "space-y-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Company" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(FormField, { label: "Company name", className: "sm:col-span-2", children: /* @__PURE__ */ jsx(
            Input,
            {
              value: form.company_name,
              onChange: (event) => update("company_name", event.target.value),
              required: true
            }
          ) }),
          /* @__PURE__ */ jsx(FormField, { label: "Address", className: "sm:col-span-2", children: /* @__PURE__ */ jsx(
            Input,
            {
              value: form.company_address,
              onChange: (event) => update("company_address", event.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx(FormField, { label: "Phone", children: /* @__PURE__ */ jsx(
            Input,
            {
              value: form.company_phone,
              onChange: (event) => update("company_phone", event.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx(FormField, { label: "Email", children: /* @__PURE__ */ jsx(
            Input,
            {
              type: "email",
              value: form.company_email,
              onChange: (event) => update("company_email", event.target.value)
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "User account" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(FormField, { label: "Display name", children: /* @__PURE__ */ jsx(
            Input,
            {
              value: form.user_name,
              onChange: (event) => update("user_name", event.target.value)
            }
          ) }),
          /* @__PURE__ */ jsx(FormField, { label: "Email", children: /* @__PURE__ */ jsx(
            Input,
            {
              type: "email",
              value: form.user_email,
              onChange: (event) => update("user_email", event.target.value)
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Documents" }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(FormField, { label: "Date format", children: /* @__PURE__ */ jsxs(
            FieldSelect,
            {
              value: form.date_format,
              onChange: (value) => update("date_format", value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "F j, Y", children: "August 19, 2026" }),
                /* @__PURE__ */ jsx("option", { value: "Y-m-d", children: "2026-08-19" }),
                /* @__PURE__ */ jsx("option", { value: "m/d/Y", children: "08/19/2026" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(FormField, { label: "Paper size", children: /* @__PURE__ */ jsxs(
            FieldSelect,
            {
              value: form.paper_size,
              onChange: (value) => update("paper_size", value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "A4", children: "A4" }),
                /* @__PURE__ */ jsx("option", { value: "Letter", children: "Letter" })
              ]
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { type: "submit", disabled: saving, children: saving ? "Saving\u2026" : "Save settings" })
    ] }),
    /* @__PURE__ */ jsx("form", { onSubmit: handleSavePassword, className: "mt-6", children: /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Change password" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-1 gap-4 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsx(FormField, { label: "Current password", children: /* @__PURE__ */ jsx(
          Input,
          {
            type: "password",
            value: password.current_password,
            onChange: (event) => setPassword((current) => ({
              ...current,
              current_password: event.target.value
            })),
            autoComplete: "current-password"
          }
        ) }),
        /* @__PURE__ */ jsx(FormField, { label: "New password", children: /* @__PURE__ */ jsx(
          Input,
          {
            type: "password",
            value: password.password,
            onChange: (event) => setPassword((current) => ({
              ...current,
              password: event.target.value
            })),
            autoComplete: "new-password"
          }
        ) }),
        /* @__PURE__ */ jsx(FormField, { label: "Confirm password", children: /* @__PURE__ */ jsx(
          Input,
          {
            type: "password",
            value: password.password_confirmation,
            onChange: (event) => setPassword((current) => ({
              ...current,
              password_confirmation: event.target.value
            })),
            autoComplete: "new-password"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "sm:col-span-3", children: /* @__PURE__ */ jsx(Button, { type: "submit", variant: "secondary", children: "Update password" }) })
      ] })
    ] }) })
  ] });
}
export {
  SettingsPage
};
