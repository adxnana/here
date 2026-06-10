// Local store for Wells Fargo: Online Access.
// Persists the user, accounts, and activity in the browser's localStorage.

export type User = {
  username: string;
  password: string;
  firstName: string;
  fullName: string;
};

export type Account = {
  id: string;
  type: "Checking" | "Savings";
  number: string;
  balance: number;
};

export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  amount: number; // positive = deposit, negative = withdrawal
  category: string;
};

const USERS_KEY = "wf_users_v1";
const SESSION_KEY = "wf_session_v1";
const ACCOUNTS_KEY = "wf_accounts_v1";
const TXNS_KEY = "wf_txns_v1";

// ════════════════════════════════════════════════════════════════════
// 👤 EDIT THE SIGN-IN CREDENTIALS HERE
// Change `username`, `password`, `firstName`, and `fullName` below to set
// who can sign in. These values are seeded automatically on first run.
// ════════════════════════════════════════════════════════════════════
const ACCOUNT_HOLDER: User = {
  username: "Sandra1230",
  password: "mollyisagoodkitten.1",
  firstName: "Sandra",
  fullName: "Sandra Olsen Gore",
};

// ════════════════════════════════════════════════════════════════════
// 💰 EDIT THE STARTING ACCOUNT BALANCES HERE
// Change the `balance` (and `number`/`type`) values below to set the
// opening balances. They are written to localStorage on first run.
// To apply new values to a browser that already ran the app, clear the
// site data (or remove the "wf_accounts_v1" localStorage key).
// ════════════════════════════════════════════════════════════════════
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: "chk-1", type: "Checking", number: "****4218", balance: 15000 },
  { id: "sav-1", type: "Savings", number: "****9043", balance: 5000 },
];

// ---------- Reactive change channel ----------
type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}

// ---------- Users ----------
function readUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function seedAccountHolder() {
  const users = readUsers();
  if (!users.some((u) => u.username === ACCOUNT_HOLDER.username)) {
    users.push({ ...ACCOUNT_HOLDER });
    writeUsers(users);
  }
}

export function signIn(
  username: string,
  password: string,
): { ok: true } | { ok: false; error: string } {
  seedAccountHolder();
  const users = readUsers();
  const u = users.find((x) => x.username === username.trim());
  if (!u || u.password !== password) {
    return { ok: false, error: "Invalid username or password." };
  }
  setSession(u.username);
  return { ok: true };
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

function setSession(username: string) {
  localStorage.setItem(SESSION_KEY, username);
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  seedAccountHolder();
  const username = localStorage.getItem(SESSION_KEY);
  if (!username) return null;
  return readUsers().find((u) => u.username === username) ?? null;
}

// ---------- Accounts ----------
function cloneDefaults(): Account[] {
  return DEFAULT_ACCOUNTS.map((a) => ({ ...a }));
}

export function getAccounts(): Account[] {
  if (typeof window === "undefined") return cloneDefaults();
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      const seeded = cloneDefaults();
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return cloneDefaults();
  }
}

// Persists account balances. Used by the transfer flow to move money
// between accounts and apply wire fees.
export function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  notify();
}

// ---------- Transactions ----------
function defaultTxns(): Transaction[] {
  const today = new Date();
  const d = (offset: number) =>
    new Date(today.getTime() - offset * 86400000).toISOString().slice(0, 10);
  return [
    { id: "t1", date: d(0), merchant: "Payroll Deposit", amount: 2400, category: "Income" },
    { id: "t2", date: d(1), merchant: "Whole Foods Market", amount: -84.22, category: "Groceries" },
    { id: "t3", date: d(2), merchant: "Transfer to Savings", amount: -500, category: "Transfer" },
    { id: "t4", date: d(3), merchant: "Pacific Gas & Electric", amount: -120, category: "Utilities" },
    { id: "t5", date: d(5), merchant: "Blue Bottle Coffee", amount: -6.75, category: "Dining" },
    { id: "t6", date: d(7), merchant: "Refund — Online Store", amount: 42.5, category: "Refund" },
  ];
}

export function getTxns(): Transaction[] {
  if (typeof window === "undefined") return defaultTxns();
  try {
    const raw = localStorage.getItem(TXNS_KEY);
    if (!raw) {
      const seeded = defaultTxns();
      localStorage.setItem(TXNS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    return defaultTxns();
  }
}

export function addTxn(t: Transaction) {
  const list = [t, ...getTxns()];
  localStorage.setItem(TXNS_KEY, JSON.stringify(list));
  notify();
}

// ---------- Helpers ----------
export function formatCurrency(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
