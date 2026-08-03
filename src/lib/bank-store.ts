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

// NOTE: bump the "_v2" suffix on these keys any time you change the seeded
// credentials, balances, or transactions below — it forces every browser to
// re-seed with the new values instead of reusing old saved data.
const USERS_KEY = "wf_users_v2";
const SESSION_KEY = "wf_session_v2";
const ACCOUNTS_KEY = "wf_accounts_v2";
const TXNS_KEY = "wf_txns_v2";

// ════════════════════════════════════════════════════════════════════
// 👤 EDIT THE SIGN-IN CREDENTIALS HERE
// Change `username`, `password`, `firstName`, and `fullName` below to set
// who can sign in. These values are seeded automatically on first run.
// ════════════════════════════════════════════════════════════════════
const ACCOUNT_HOLDER: User = {
  username: "Suebee1230",
  password: "mollyisagoodkitten1",
  firstName: "Kayla",
  fullName: "Kayla",
};

// ════════════════════════════════════════════════════════════════════
// 💰 EDIT THE STARTING ACCOUNT BALANCES HERE
// Change the `balance` (and `number`/`type`) values below to set the
// opening balances. They are written to localStorage on first run.
// Total shown on the dashboard = sum of every balance below.
// To apply new values to a browser that already ran the app, clear the
// site data (or remove the "wf_accounts_v2" localStorage key).
// ════════════════════════════════════════════════════════════════════
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: "chk-1", type: "Checking", number: "****4218", balance: 150000 },
  { id: "sav-1", type: "Savings", number: "****9043", balance: 250000 },
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

// ════════════════════════════════════════════════════════════════════
// 🧾 EDIT / ADD TRANSACTIONS HERE
// Each row is one entry in the activity list. Copy any line below and
// change the values:
//   id       — must be unique (e.g. "t31")
//   date     — d(n) means "n days ago"; or hardcode "2026-07-14"
//   merchant — the text shown as the title
//   amount   — POSITIVE = money in (green), NEGATIVE = money out
//   category — free text, also searchable
// These are written to localStorage on first run; clear site data (or
// remove the "wf_txns_v2" key) to re-seed an existing browser.
// ════════════════════════════════════════════════════════════════════
function defaultTxns(): Transaction[] {
  const today = new Date();
  const d = (offset: number) =>
    new Date(today.getTime() - offset * 86400000).toISOString().slice(0, 10);
  return [
    { id: "t1", date: d(0), merchant: "Payroll Deposit — Northgate Holdings", amount: 12480, category: "Income" },
    { id: "t2", date: d(0), merchant: "Whole Foods Market", amount: -184.22, category: "Groceries" },
    { id: "t3", date: d(1), merchant: "Interest Payment — Savings", amount: 812.4, category: "Interest" },
    { id: "t4", date: d(1), merchant: "Transfer to Savings", amount: -5000, category: "Transfer" },
    { id: "t5", date: d(2), merchant: "Pacific Gas & Electric", amount: -246.18, category: "Utilities" },
    { id: "t6", date: d(2), merchant: "Delta Air Lines", amount: -1284.6, category: "Travel" },
    { id: "t7", date: d(3), merchant: "Wire Transfer — Meridian Escrow", amount: -25000, category: "Wire Transfer" },
    { id: "t8", date: d(3), merchant: "Blue Bottle Coffee", amount: -18.75, category: "Dining" },
    { id: "t9", date: d(4), merchant: "Dividend — Vanguard VTSAX", amount: 3140.55, category: "Investments" },
    { id: "t10", date: d(4), merchant: "Apple Store", amount: -2399, category: "Shopping" },
    { id: "t11", date: d(5), merchant: "Chevron Station #2214", amount: -78.4, category: "Auto" },
    { id: "t12", date: d(5), merchant: "Blue Shield of California", amount: -642.1, category: "Insurance" },
    { id: "t13", date: d(6), merchant: "Client Payment — Harbor Design", amount: 18750, category: "Income" },
    { id: "t14", date: d(6), merchant: "Trader Joe's", amount: -132.86, category: "Groceries" },
    { id: "t15", date: d(7), merchant: "Refund — Online Store", amount: 342.5, category: "Refund" },
    { id: "t16", date: d(8), merchant: "Mortgage Payment — Home Loan", amount: -4180, category: "Housing" },
    { id: "t17", date: d(9), merchant: "Comcast Xfinity", amount: -129.99, category: "Utilities" },
    { id: "t18", date: d(10), merchant: "Nordstrom", amount: -864.3, category: "Shopping" },
    { id: "t19", date: d(11), merchant: "Rental Income — 14th Street", amount: 4200, category: "Income" },
    { id: "t20", date: d(12), merchant: "The Fig House Restaurant", amount: -218.44, category: "Dining" },
    { id: "t21", date: d(13), merchant: "Transfer from Savings", amount: 2500, category: "Transfer" },
    { id: "t22", date: d(14), merchant: "State Farm Auto Insurance", amount: -312.75, category: "Insurance" },
    { id: "t23", date: d(16), merchant: "Amazon.com", amount: -426.19, category: "Shopping" },
    { id: "t24", date: d(18), merchant: "Bonus Deposit — Northgate Holdings", amount: 9500, category: "Income" },
    { id: "t25", date: d(20), merchant: "United Airlines", amount: -1642.8, category: "Travel" },
    { id: "t26", date: d(22), merchant: "Sunrise Property Management", amount: -1850, category: "Housing" },
    { id: "t27", date: d(24), merchant: "Interest Payment — Checking", amount: 96.32, category: "Interest" },
    { id: "t28", date: d(26), merchant: "Costco Wholesale", amount: -487.62, category: "Groceries" },
    { id: "t29", date: d(28), merchant: "Sale of Securities — Fidelity", amount: 26400, category: "Investments" },
    { id: "t30", date: d(30), merchant: "Wire Transfer — Alvarez & Co.", amount: -14000, category: "Wire Transfer" },
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
