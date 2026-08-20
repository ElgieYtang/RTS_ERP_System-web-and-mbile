import { jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
const AUTH_STORAGE_KEY = "rc-erp-session";
const AuthContext = createContext(null);
const DEMO_USER = {
  name: "Admin",
  email: "admin@responsivcode.com"
};
const DEMO_PASSWORD = "admin123";
function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const login = useCallback((email, password) => {
    const normalized = email.trim().toLowerCase();
    const validEmail = normalized === DEMO_USER.email || normalized === "admin";
    const validPassword = password === DEMO_PASSWORD || password === "admin";
    if (!validEmail || !validPassword) return false;
    const sessionUser = { ...DEMO_USER, email: normalized === "admin" ? DEMO_USER.email : normalized };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return true;
  }, []);
  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);
  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout
    }),
    [user, login, logout]
  );
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value, children });
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
export {
  AuthProvider,
  useAuth
};
