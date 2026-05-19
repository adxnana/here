// Local store for the Wells Fargo: Online Access prototype.
// Persists users, accounts, and activity in localStorage.

export type User = {
  email: string;
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

const USERS_KEY = "maskael_users_v1";
const SESSION_KEY = "maskael_session_v1";
const ACCOUNTS_KEY = "maskael_accounts_v1";
const TXNS_KEY = "maskael_txns_v1";

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

function seedDemoUser() {
  const users = readUsers();
  if (!users.some((u) => u.email === "sandra@demo.bank")) {
    users.push({
      email: "sandra@demo.bank",
      password: "demo1234",
      firstName: "Sandra",
      fullName: "Sandra Olsen Gore",
    });
    writeUsers(users);
  }
}

export function signUp(input: {
  email: string;
  password: string;
  fullName: string;
}): { ok: true } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password || !input.fullName.trim()) {
    return { ok: false, error: "Please fill in all fields." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  const users = readUsers();
  if (users.some((u) => u.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  users.push({
    email,
    password: input.password,
    firstName: input.fullName.trim().split(" ")[0],
    fullName: input.fullName.trim(),
  });
  writeUsers(users);
  setSession(email);
  return { ok: true };
}

export function signIn(
  email: string,
  password: string,
): { ok: true } | { ok: false; error: string } {
  seedDemoUser();
  const users = readUsers();
  const u = users.find((x) => x.email === email.trim().toLowerCase());
  if (!u || u.password !== password) {
    return { ok: false, error: "Invalid email or password." };
  }
  setSession(u.email);
  return { ok: true };
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY);
}

function setSession(email: string) {
  localStorage.setItem(SESSION_KEY, email);
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  seedDemoUser();
  const email = localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return readUsers().find((u) => u.email === email) ?? null;
}

// ---------- Accounts ----------
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: "chk-1", type: "Checking", number: "****4218", balance: 15000 },
  { id: "sav-1", type: "Savings", number: "****9043", balance: 5000 },
];

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

export function saveAccounts(accounts: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  notify();
}

export function updateAccountBalance(id: string, balance: number) {
  const next = getAccounts().map((a) =>
    a.id === id ? { ...a, balance: Math.max(0, Number(balance) || 0) } : a,
  );
  saveAccounts(next);
}

export function resetAccounts() {
  saveAccounts(cloneDefaults());
  localStorage.setItem(TXNS_KEY, JSON.stringify(defaultTxns()));
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
