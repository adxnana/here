import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatCurrency, type Transaction } from "@/lib/bank-store";
import { useTxns } from "@/hooks/use-bank";
import { ArrowUpRight, ArrowDownRight, Search, X } from "lucide-react";
import { TransactionDetailsDrawer } from "@/components/TransactionDetailsDrawer";

export const Route = createFileRoute("/_app/transactions")({
  component: TransactionsPage,
});

type FilterType = "all" | "income" | "expense";

function TransactionsPage() {
  const { txns } = useTxns();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [selected, setSelected] = useState<Transaction | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return txns.filter((t) => {
      if (filter === "income" && t.amount < 0) return false;
      if (filter === "expense" && t.amount >= 0) return false;
      if (!query) return true;
      const amountStr = Math.abs(t.amount).toFixed(2);
      return (
        t.merchant.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.date.includes(query) ||
        amountStr.includes(query)
      );
    });
  }, [txns, q, filter]);

  const tabs: { id: FilterType; label: string }[] = [
    { id: "all", label: "All" },
    { id: "income", label: "Income" },
    { id: "expense", label: "Expenses" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your recent account activity.
        </p>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <label htmlFor="txn-search" className="sr-only">Search transactions</label>
          <input
            id="txn-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search merchant, category, amount or date…"
            className="w-full h-11 pl-10 pr-10 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded-full text-muted-foreground hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div role="tablist" aria-label="Filter transactions" className="inline-flex rounded-xl border border-border bg-card p-1">
          {tabs.map((t) => {
            const active = filter === t.id;
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(t.id)}
                className={`px-3 h-8 rounded-lg text-sm font-semibold transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="rounded-2xl bg-card border border-border divide-y divide-border shadow-card overflow-hidden">
        {filtered.length === 0 && (
          <li className="p-6 text-center text-muted-foreground text-sm">
            No transactions match your search.
          </li>
        )}
        {filtered.map((t) => {
          const positive = t.amount >= 0;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setSelected(t)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/60 focus:bg-secondary/60 transition-colors"
                aria-label={`View details for ${t.merchant}, ${formatCurrency(t.amount)}`}
              >
                <div
                  className={`h-10 w-10 grid place-items-center rounded-full ${
                    positive ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                  }`}
                >
                  {positive ? (
                    <ArrowDownRight className="h-5 w-5" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{t.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.date} · {t.category}
                  </p>
                </div>
                <p
                  className={`font-bold ${
                    positive ? "text-success" : "text-foreground"
                  }`}
                >
                  {positive ? "+" : ""}
                  {formatCurrency(t.amount)}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <TransactionDetailsDrawer txn={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
