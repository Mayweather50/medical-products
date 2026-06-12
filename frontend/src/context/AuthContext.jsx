import { createContext, useContext, useMemo, useState } from "react";
import { api, getStoredAuth, storeAuth } from "../api";

/* Авторизация: JWT + username/role в localStorage.
   Токен подхватывается клиентом API автоматически (api.js). */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredAuth);

  const value = useMemo(
    () => ({
      user,
      isAdmin: user?.role === "ROLE_ADMIN",
      async login(username, password) {
        const auth = await api.login({ username, password });
        storeAuth(auth);
        setUser(auth);
        return auth;
      },
      async register(username, password) {
        const auth = await api.register({ username, password });
        storeAuth(auth);
        setUser(auth);
        return auth;
      },
      logout() {
        storeAuth(null);
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Возвращает { user, isAdmin, login, register, logout }. */
export const useAuth = () => useContext(AuthContext);
