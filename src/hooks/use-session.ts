import { useEffect, useState, useCallback } from "react";
import { getCurrentUser, signOut as storeSignOut, type User } from "@/lib/bank-store";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  const logout = useCallback(() => {
    storeSignOut();
    setUser(null);
  }, []);

  return { user, ready, refresh, logout };
}
