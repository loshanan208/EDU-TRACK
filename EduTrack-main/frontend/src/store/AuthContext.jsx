import { createContext, useContext, useMemo, useState } from "react";

import apiClient from "../services/apiClient";

const AuthContext = createContext(null);

function getInitialAuth() {
  const token = localStorage.getItem("edutrack_token");
  const rawUser = localStorage.getItem("edutrack_user");

  if (!token || !rawUser) {
    return { token: null, user: null };
  }

  try {
    return {
      token,
      user: JSON.parse(rawUser),
    };
  } catch {
    localStorage.removeItem("edutrack_token");
    localStorage.removeItem("edutrack_user");
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [{ token, user }, setAuthState] = useState(getInitialAuth);

  const login = async (email, password) => {
    const { data } = await apiClient.post("/auth/login", { email, password });

    localStorage.setItem("edutrack_token", data.token);
    localStorage.setItem("edutrack_user", JSON.stringify(data.user));

    setAuthState({ token: data.token, user: data.user });

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("edutrack_token");
    localStorage.removeItem("edutrack_user");
    setAuthState({ token: null, user: null });
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
