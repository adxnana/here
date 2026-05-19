import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  saveAccounts,
  addTxn,
  formatCurrency,
  type Account,
} from "@/lib/bank-store";
import { useAccounts } from "@/hooks/use-bank";
import { ArrowRight, CheckCircle2, Building2, Repeat } from "lucide-react";

export const Route = createFileRoute("/_app/transfers")({
  component: TransfersPage,
});

type Mode = "internal" | "wire";

const ROUTING_RE = /^\d{9}$/;
const ACCOUNT_RE = /^\d{6,17}$/;

function TransfersPage() {
  const { accounts } = useAccounts();
  const [mode, setMode] = useState<Mode>("internal");

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Transfer money</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Move funds between your accounts or send a wire transfer.
        </p>
      </header>

      <div role="tablist" aria-label="Transfer type" className="inline-flex rounded-xl border border-border bg-card p-1">
        <TabButton active={mode === "internal"} onClick={() => setMode("internal")} icon={<Repeat className="h-4 w-4" />} label="Between accounts" />
        <TabButton active={mode === "wire"} onClick={() => setMode("wire")} icon={<Building2 className="h-4 w-4" />} label="Wire transfer" />
      </div>

      {mode === "internal" ? (
        <InternalTransfer accounts={accounts} />
      ) : (
        <WireTransfer accounts={accounts} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-semibold transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

type Acc = Account;

function InternalTransfer({ accounts }: { accounts: Acc[] }) {
  const [from, setFrom] = useState(accounts[0]?.id ?? "");
  const [to, setTo] = useState(accounts[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | {
    fromLabel: string;
    toLabel: string;
    amount: number;
  }>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!from || !to) return setError("Select both accounts.");
    if (from === to) return setError("Choose two different accounts.");
    if (!Number.isFinite(amt) || amt <= 0) return setError("Enter a valid amount.");
    if (amt > 1_000_000) return setError("Amount exceeds the per-transfer limit.");
    const fromAcc = accounts.find((a) => a.id === from)!;
    const toAcc = accounts.find((a) => a.id === to)!;
    if (amt > fromAcc.balance) return setError("Insufficient funds.");

    const updated = accounts.map((a) => {
      if (a.id === from) return { ...a, balance: a.balance - amt };
      if (a.id === to) return { ...a, balance: a.balance + amt };
      return a;
    });
    saveAccounts(updated);
    addTxn({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      merchant: `Transfer to ${toAcc.type}`,
      amount: -amt,
      category: "Transfer",
    });
    addTxn({
      id: `tx-${Date.now()}-in`,
      date: new Date().toISOString().slice(0, 10),
      merchant: `Transfer from ${fromAcc.type}`,
      amount: amt,
      category: "Transfer",
    });
    setAmount("");
    toast.success("Transfer complete", {
      description: `${formatCurrency(amt)} moved to ${toAcc.type}.`,
    });
    setConfirm({
      fromLabel: `${fromAcc.type} ${fromAcc.number}`,
      toLabel: `${toAcc.type} ${toAcc.number}`,
      amount: amt,
    });
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-5"
      >
        <FieldSelect label="From" value={from} onChange={setFrom} accounts={accounts} />
        <div className="flex justify-center text-muted-foreground" aria-hidden>
          <ArrowRight className="h-5 w-5" />
        </div>
        <FieldSelect label="To" value={to} onChange={setTo} accounts={accounts} />
        <AmountField value={amount} onChange={setAmount} />

        {error && <ErrorBanner message={error} />}

        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-brand hover:bg-primary-dark transition-colors"
        >
          Continue
        </button>
      </form>

      {confirm && (
        <SuccessDialog
          title="Transfer complete"
          message={
            <>
              {formatCurrency(confirm.amount)} moved from{" "}
              <strong>{confirm.fromLabel}</strong> to <strong>{confirm.toLabel}</strong>.
            </>
          }
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

function WireTransfer({ accounts }: { accounts: Acc[] }) {
  const [from, setFrom] = useState(accounts[0]?.id ?? "");
  const [recipient, setRecipient] = useState("");
  const [bank, setBank] = useState("");
  const [routing, setRouting] = useState("");
  const [account, setAccount] = useState("");
  const [memo, setMemo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | {
    amount: number;
    recipient: string;
    bank: string;
  }>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    const fromAcc = accounts.find((a) => a.id === from);
    if (!fromAcc) return setError("Select a source account.");
    const name = recipient.trim();
    const bk = bank.trim();
    if (name.length < 2 || name.length > 80) return setError("Enter recipient's full name.");
    if (bk.length < 2 || bk.length > 80) return setError("Enter the recipient bank name.");
    if (!ROUTING_RE.test(routing.trim())) return setError("Routing number must be 9 digits.");
    if (!ACCOUNT_RE.test(account.trim())) return setError("Account number must be 6–17 digits.");
    if (memo.length > 140) return setError("Memo is too long.");
    if (!Number.isFinite(amt) || amt <= 0) return setError("Enter a valid amount.");
    if (amt > 250_000) return setError("Wire amount exceeds the $250,000 daily limit.");
    if (amt > fromAcc.balance) return setError("Insufficient funds.");

    const fee = 25;
    const total = amt + fee;
    if (total > fromAcc.balance) return setError(`Insufficient funds for amount plus $${fee} wire fee.`);

    const updated = accounts.map((a) =>
      a.id === fromAcc.id ? { ...a, balance: a.balance - total } : a,
    );
    saveAccounts(updated);
    const today = new Date().toISOString().slice(0, 10);
    addTxn({
      id: `wire-${Date.now()}`,
      date: today,
      merchant: `Wire to ${name}`,
      amount: -amt,
      category: "Wire transfer",
    });
    addTxn({
      id: `wire-fee-${Date.now()}`,
      date: today,
      merchant: "Wire transfer fee",
      amount: -fee,
      category: "Fee",
    });
    setAmount("");
    setRecipient("");
    setBank("");
    setRouting("");
    setAccount("");
    setMemo("");
    toast.success("Wire transfer sent", {
      description: `${formatCurrency(amt)} to ${name} · $${fee} fee applied.`,
    });
    setConfirm({ amount: amt, recipient: name, bank: bk });
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-card space-y-5"
      >
        <FieldSelect label="From" value={from} onChange={setFrom} accounts={accounts} />

        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Recipient name" id="wire-name" value={recipient} onChange={setRecipient} maxLength={80} />
          <TextField label="Recipient bank" id="wire-bank" value={bank} onChange={setBank} maxLength={80} />
          <TextField label="Routing number" id="wire-routing" value={routing} onChange={(v) => setRouting(v.replace(/\D/g, ""))} inputMode="numeric" maxLength={9} />
          <TextField label="Account number" id="wire-account" value={account} onChange={(v) => setAccount(v.replace(/\D/g, ""))} inputMode="numeric" maxLength={17} />
        </div>

        <AmountField value={amount} onChange={setAmount} />

        <TextField label="Memo (optional)" id="wire-memo" value={memo} onChange={setMemo} maxLength={140} />

        <p className="text-xs text-muted-foreground">
          A $25 wire transfer fee will be deducted from the source account.
        </p>

        {error && <ErrorBanner message={error} />}

        <button
          type="submit"
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-brand hover:bg-primary-dark transition-colors"
        >
          Send wire transfer
        </button>
      </form>

      {confirm && (
        <SuccessDialog
          title="Wire transfer sent"
          message={
            <>
              {formatCurrency(confirm.amount)} sent to <strong>{confirm.recipient}</strong> at{" "}
              <strong>{confirm.bank}</strong>. A $25 wire fee was applied.
            </>
          }
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

function FieldSelect({
  label,
  value,
  onChange,
  accounts,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accounts: Acc[];
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground mb-1.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary"
      >
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.type} {a.number} — {formatCurrency(a.balance)}
          </option>
        ))}
      </select>
    </label>
  );
}

function AmountField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-foreground mb-1.5">Amount</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          className="w-full h-12 pl-7 pr-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary text-lg font-medium"
        />
      </div>
    </label>
  );
}

function TextField({
  label,
  id,
  value,
  onChange,
  maxLength,
  inputMode,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="block text-sm font-medium text-foreground mb-1.5">{label}</span>
      <input
        id={id}
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className="w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:border-primary"
      />
    </label>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm">
      {message}
    </div>
  );
}

function SuccessDialog({
  title,
  message,
  onClose,
}: {
  title: string;
  message: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 grid place-items-center bg-foreground/40 p-4"
    >
      <div className="bg-card rounded-2xl shadow-elevated max-w-sm w-full p-6 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-success/10 text-success grid place-items-center">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-3 text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <button
          onClick={onClose}
          className="mt-5 w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary-dark"
        >
          Done
        </button>
      </div>
    </div>
  );
}
