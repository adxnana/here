import { useEffect, useState } from "react";
import { X, Wallet } from "lucide-react";
import { updateAccountBalance, formatCurrency, type Account } from "@/lib/bank-store";

type Props = {
  account: Account | null;
  onClose: () => void;
};

export function EditBalanceDialog({ account, onClose }: Props) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (account) setValue(String(account.balance));
  }, [account]);

  useEffect(() => {
    if (!account) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [account, onClose]);

  if (!account) return null;

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!account) return;
    updateAccountBalance(account.id, Number(value));
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-balance-title"
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <form
        onSubmit={save}
        className="relative w-full max-w-sm bg-card text-card-foreground rounded-2xl shadow-elevated border border-border p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 id="edit-balance-title" className="text-lg font-bold text-foreground">
                Edit balance
              </h2>
              <p className="text-xs text-muted-foreground">
                {account.type} {account.number}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 grid place-items-center rounded-full hover:bg-secondary text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="block mt-5">
          <span className="block text-sm font-medium text-foreground mb-1.5">New balance</span>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              className="w-full h-12 pl-7 pr-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary text-lg font-semibold"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Current: {formatCurrency(account.balance)}
          </p>
        </label>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-border font-semibold text-foreground hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-dark"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}
