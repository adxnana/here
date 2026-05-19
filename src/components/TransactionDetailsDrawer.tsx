import { useEffect } from "react";
import { X, ArrowUpRight, ArrowDownRight, Copy, Receipt, Tag, Calendar, Hash } from "lucide-react";
import { formatCurrency, type Transaction } from "@/lib/bank-store";

type Props = {
  txn: Transaction | null;
  onClose: () => void;
};

export function TransactionDetailsDrawer({ txn, onClose }: Props) {
  useEffect(() => {
    if (!txn) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // lock body scroll while open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [txn, onClose]);

  if (!txn) return null;
  const positive = txn.amount >= 0;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="txn-drawer-title"
    >
      <button
        aria-label="Close details"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div className="absolute inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[420px] bg-card text-card-foreground rounded-t-2xl sm:rounded-none shadow-elevated border-t sm:border-l border-border flex flex-col max-h-[92vh] sm:max-h-none sm:h-full">
        <header className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="txn-drawer-title" className="text-lg font-bold text-foreground">
            Transaction details
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-10 w-10 grid place-items-center rounded-full hover:bg-secondary text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="p-5 overflow-y-auto">
          <div className="flex flex-col items-center text-center pb-5 border-b border-border">
            <div
              className={`h-14 w-14 grid place-items-center rounded-full ${
                positive ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
              }`}
            >
              {positive ? (
                <ArrowDownRight className="h-7 w-7" />
              ) : (
                <ArrowUpRight className="h-7 w-7" />
              )}
            </div>
            <p className="mt-3 text-sm font-semibold text-muted-foreground">
              {positive ? "Money in" : "Money out"}
            </p>
            <p
              className={`mt-1 text-3xl font-extrabold tracking-tight ${
                positive ? "text-success" : "text-foreground"
              }`}
            >
              {positive ? "+" : ""}
              {formatCurrency(txn.amount)}
            </p>
            <p className="mt-1 text-base font-semibold text-foreground">{txn.merchant}</p>
          </div>

          <dl className="mt-5 space-y-3">
            <Row icon={<Calendar className="h-4 w-4" />} label="Date" value={txn.date} />
            <Row icon={<Tag className="h-4 w-4" />} label="Category" value={txn.category} />
            <Row
              icon={<Hash className="h-4 w-4" />}
              label="Reference"
              value={`TXN-${txn.id.toUpperCase()}-${txn.date.replace(/-/g, "")}`}
              copyable
            />
            <Row
              icon={<Receipt className="h-4 w-4" />}
              label="Status"
              value="Posted"
            />
          </dl>

          <div className="mt-6 rounded-xl bg-secondary p-4 text-sm text-foreground">
            <p className="font-semibold mb-1">About this transaction</p>
            <p className="text-muted-foreground">
              If you don't recognize this transaction, you can report an issue and we'll review it.
            </p>
          </div>
        </div>

        <footer className="mt-auto p-4 border-t border-border grid grid-cols-2 gap-2">
          <button
            type="button"
            className="h-11 rounded-xl border border-border font-semibold text-foreground hover:bg-secondary"
          >
            Report issue
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-dark"
          >
            Done
          </button>
        </footer>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  copyable,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </dt>
      <dd className="text-sm font-semibold text-foreground inline-flex items-center gap-2 max-w-[60%] truncate">
        <span className="truncate">{value}</span>
        {copyable && (
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(value)}
            aria-label={`Copy ${label}`}
            className="text-muted-foreground hover:text-primary"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </dd>
    </div>
  );
}
