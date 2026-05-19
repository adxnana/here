import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { useAccounts, useTxns } from "@/hooks/use-bank";
import { formatCurrency, greeting, type Transaction, type Account } from "@/lib/bank-store";
import { ArrowUpRight, ArrowDownRight, Plus, Send, Receipt, Pencil } from "lucide-react";
import { useState } from "react";
import { TransactionDetailsDrawer } from "@/components/TransactionDetailsDrawer";
import { EditBalanceDialog } from "@/components/EditBalanceDialog";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useSession();
  const { accounts } = useAccounts();
  const { txns: allTxns } = useTxns();
  const txns = allTxns.slice(0, 4);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [editing, setEditing] = useState<Account | null>(null);

  const total = accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">
          {greeting()}, {user?.firstName}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {user?.fullName}
        </h1>
      </section>

      <section className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-primary-foreground p-5 sm:p-6 shadow-brand">
        <p className="text-sm/none opacity-80">Total available balance</p>
        <p className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
          {formatCurrency(total)}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <QuickAction to="/transfers" icon={<Send className="h-4 w-4" />} label="Transfer" />
          <QuickAction to="/transactions" icon={<Receipt className="h-4 w-4" />} label="Activity" />
          <QuickAction to="/services" icon={<Plus className="h-4 w-4" />} label="Services" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Your accounts</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {accounts.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl bg-card border border-border p-5 shadow-card hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {a.type} Account
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Account {a.number}
                  </p>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent text-accent-foreground">
                  Active
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-foreground">
                {formatCurrency(a.balance)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Available balance</p>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(a)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit balance
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Recent activity</h2>
          <Link to="/transactions" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <ul className="rounded-2xl bg-card border border-border divide-y divide-border shadow-card overflow-hidden">
          {txns.map((t) => {
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
                    <p className="text-xs text-muted-foreground">{t.date}</p>
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
      </section>

      <TransactionDetailsDrawer txn={selected} onClose={() => setSelected(null)} />
      <EditBalanceDialog account={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function QuickAction({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors rounded-full px-4 py-2 text-sm font-medium"
    >
      {icon}
      {label}
    </Link>
  );
}
