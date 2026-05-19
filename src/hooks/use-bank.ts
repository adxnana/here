import { useEffect, useState, useCallback } from "react";
import { getAccounts, getTxns, subscribe, type Account, type Transaction } from "@/lib/bank-store";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(() => getAccounts());
  const refresh = useCallback(() => setAccounts(getAccounts()), []);
  useEffect(() => {
    refresh();
    const unsub = subscribe(refresh);
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);
  return { accounts, refresh };
}

export function useTxns() {
  const [txns, setTxns] = useState<Transaction[]>(() => getTxns());
  const refresh = useCallback(() => setTxns(getTxns()), []);
  useEffect(() => {
    refresh();
    const unsub = subscribe(refresh);
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => {
      unsub();
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);
  return { txns, refresh };
}
