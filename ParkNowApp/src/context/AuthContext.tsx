// src/context/AuthContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "../api/api"; // ensures axios header is cleared

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  // login can accept token and optional user object
  login: (token: string, user?: any) => void;
  logout: () => void;
  user: any;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // on mount, restore token from storage and set axios header
  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem("token");
        const u = await AsyncStorage.getItem("user");
        if (t) {
          setToken(t);
          setAuthToken(t);
        } else {
          setAuthToken(null);
        }
        if (u) {
          setUser(JSON.parse(u));
        }
      } catch (err) {
        console.warn("Failed to restore token", err);
      }
      // finished attempting to restore
      setIsLoading(false);
    })();
  }, []);

  const login = async (t: string, u?: any) => {
    setToken(t);
    await AsyncStorage.setItem("token", t);
    setAuthToken(t);
    if (u) {
      try {
        await AsyncStorage.setItem("user", JSON.stringify(u));
      } catch (err) {
        console.warn("Failed to persist user", err);
      }
      setUser(u);
    }
  };

  const logout = async () => {
    try {
      // remove persisted auth
      await AsyncStorage.multiRemove(["token", "user"]);
    } catch (err) {
      console.warn("Auth signOut: failed clearing storage", err);
    }

    // clear axios default header (helper in api.ts)
    try {
      setAuthToken(null);
    } catch (e) {
      // ignore if helper not available
    }

    // clear context state
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoading,
        login,
        logout,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
