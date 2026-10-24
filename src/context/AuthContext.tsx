import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../lib/types";

interface AuthValue {
  user: User | null;
  /** True until the first session check finishes. */
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthValue>({ user: null, loading: true, signOut: async () => undefined });

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api.getUser().then((u) => {
      if (alive) {
        setUser(u);
        setLoading(false);
      }
    });
    const off = api.onAuthChange((u) => alive && setUser(u));
    return () => {
      alive = false;
      off();
    };
  }, []);

  const signOut = useCallback(() => api.signOut(), []);
  const value = useMemo(() => ({ user, loading, signOut }), [user, loading, signOut]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthValue => useContext(Ctx);
