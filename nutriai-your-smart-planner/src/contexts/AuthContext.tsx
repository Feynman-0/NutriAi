import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, userApi, type User } from "@/utils/api";

interface AuthCtx {
  user: User | null;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<User>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("nutriai_token");
    const u = localStorage.getItem("nutriai_user");
    if (t && u) {
      setToken(t);
      try {
        setUser(JSON.parse(u));
      } catch {
        /* ignore */
      }
    }
    setIsReady(true);
  }, []);

  const persist = (t: string, u: User) => {
    localStorage.setItem("nutriai_token", t);
    localStorage.setItem("nutriai_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    persist(res.token, res.user);
    return res.user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    persist(res.token, res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("nutriai_token");
    localStorage.removeItem("nutriai_user");
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!user) throw new Error("not authenticated");
      const updated = await userApi.update(user.id, data);
      localStorage.setItem("nutriai_user", JSON.stringify(updated));
      setUser(updated);
      return updated;
    },
    [user],
  );

  return (
    <Ctx.Provider value={{ user, token, isReady, login, register, logout, updateProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
