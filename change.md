# change.md — How to change everything in this app

This app has **no server and no database**. Everything that looks like
"backend data" (the user, the balances, the transactions) is defined in **one
file** and then cached in the browser's `localStorage`.

> **The one file you will edit 95% of the time:**
> `src/lib/bank-store.ts`

---

## 0. IMPORTANT — how data is saved (read this first)

The values in `src/lib/bank-store.ts` are only **seed values**. The first time
a browser opens the app they get copied into `localStorage` under these keys:

| Key               | What it holds                     |
| ----------------- | --------------------------------- |
| `wf_users_v1`     | the sign-on username / password   |
| `wf_session_v1`   | who is currently signed in        |
| `wf_accounts_v1`  | the account balances              |
| `wf_txns_v1`      | the transaction list              |

**After you edit the file, an already-used browser will still show the OLD
data** because it reads the saved copy. To see your changes:

1. Open the app.
2. Press `F12` → **Application** tab → **Local Storage** → your site.
3. Right-click → **Clear** (or delete just the key you changed).
4. Refresh the page.

Quick alternative: paste this into the browser console and refresh.

```js
localStorage.clear(); location.reload();
```

Or just use a private/incognito window while testing.

---

## 1. Change the username and password

**File:** `src/lib/bank-store.ts`
**Look for:** `👤 EDIT THE SIGN-IN CREDENTIALS HERE`

```ts
const ACCOUNT_HOLDER: User = {
  username: "Suebee1230",
  password: "mollyisagoodkitten1",
  firstName: "Sandra",          // used in "Good morning, Sandra"
  fullName: "Sandra Olsen Gore" // shown in Settings / profile
};
```

Change any of the four strings. Then clear `wf_users_v1` (or all of
localStorage) so the new credentials are seeded.

---

## 2. Change the account balances / the total

**File:** `src/lib/bank-store.ts`
**Look for:** `💰 EDIT THE STARTING ACCOUNT BALANCES HERE`

```ts
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: "chk-1", type: "Checking", number: "****4218", balance: 150000 },
  { id: "sav-1", type: "Savings",  number: "****9043", balance: 250000 },
];
```

- The **total balance** shown on the dashboard is simply the **sum of every
  `balance` above**. Right now: `150,000 + 250,000 = $400,000`.
- Write numbers plainly, no commas and no `$`: `150000`, not `150,000`.
- Cents are allowed: `150000.75`.

### Add a third account (copy-paste)

```ts
export const DEFAULT_ACCOUNTS: Account[] = [
  { id: "chk-1", type: "Checking", number: "****4218", balance: 150000 },
  { id: "sav-1", type: "Savings",  number: "****9043", balance: 250000 },
  { id: "sav-2", type: "Savings",  number: "****7761", balance: 75000 },
];
```

Rules: `id` must be unique, `type` must be exactly `"Checking"` or `"Savings"`,
`number` is just display text (use `****` + 4 digits).

Then clear `wf_accounts_v1` and refresh.

---

## 3. Add / edit transactions

**File:** `src/lib/bank-store.ts`
**Look for:** `🧾 EDIT / ADD TRANSACTIONS HERE` (inside `defaultTxns()`)

Every transaction is one line. Copy any existing line, paste it, and change
the values:

```ts
{ id: "t31", date: d(2), merchant: "Costa Coffee", amount: -12.40, category: "Dining" },
```

| Field      | Meaning                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| `id`       | Must be **unique**. Just keep counting: `t31`, `t32`, `t33`…             |
| `date`     | `d(0)` = today, `d(1)` = yesterday, `d(30)` = 30 days ago.               |
| `merchant` | The title shown in the list. Any text.                                   |
| `amount`   | **Positive = money in** (shown green with `+`). **Negative = money out.**|
| `category` | Any text — e.g. `Income`, `Groceries`, `Travel`. It is also searchable.  |

### Want a fixed calendar date instead of "days ago"?

Replace `d(2)` with a plain string in `YYYY-MM-DD` form:

```ts
{ id: "t32", date: "2026-07-14", merchant: "Hotel Bellevue", amount: -820, category: "Travel" },
```

### Copy-paste block: 5 new transactions

Paste these just **above** the closing `];` inside `defaultTxns()`:

```ts
    { id: "t31", date: d(1),  merchant: "Starbucks",                amount: -9.85,   category: "Dining" },
    { id: "t32", date: d(3),  merchant: "Consulting Fee — Acme LLC", amount: 7500,    category: "Income" },
    { id: "t33", date: d(6),  merchant: "Verizon Wireless",          amount: -142.30, category: "Utilities" },
    { id: "t34", date: d(9),  merchant: "Best Buy",                  amount: -1299.99,category: "Shopping" },
    { id: "t35", date: d(15), merchant: "Tax Refund — IRS",          amount: 3820.44, category: "Refund" },
```

Then clear `wf_txns_v1` and refresh.

> Note: transactions are **display history only** — they do not recalculate
> the balances. Set the balances yourself in section 2.

---

## 4. Change the bank name / app name / page title

| What                      | File                          | What to look for                     |
| ------------------------- | ----------------------------- | ------------------------------------ |
| Browser tab title & meta  | `index.html`                  | `<title>` and `<meta name="description">` |
| Header / login wordmark   | `src/components/Logo.tsx`     | the text next to the logo image      |
| Route page headings       | `src/routes/_app.*.tsx`       | the `<h1>` at the top of each page   |

---

## 5. Change the logo

**File:** `src/components/Logo.tsx` — search for the marker `MASKAel`.

```tsx
// MASKAel — LOGO SLOT
import logoUrl from "@/assets/wells-fargo-logo.jpeg";
```

Two options:

1. **Keep the path** — drop your own image at
   `src/assets/wells-fargo-logo.jpeg` (overwrite the file).
2. **Point somewhere else** — change the import to another local path
   (`@/assets/my-logo.png`) **or** delete the import and use an absolute URL
   directly in the `<img src="https://…">`.

---

## 6. Change the colors / light + dark theme

**File:** `src/styles.css`

All colors are CSS variables (design tokens) at the top of the file:

- `:root { … }` → **light mode** values
- `.dark { … }` → **dark mode** values

Change `--primary` to re-brand the whole app in one edit. Never hardcode
colors inside components — always edit the tokens here so both themes stay
consistent.

The default theme is **light**; users toggle dark mode in **Settings**
(`src/routes/_app.settings.tsx`, logic in `src/hooks/use-theme.ts`).

---

## 7. Change the wire-transfer rules

**File:** `src/routes/_app.transfers.tsx`

- The **$25 wire fee** — search for `25` near the fee label.
- Validation limits (min/max amount, routing-number length) live in the
  `validate()` function in the same file.
- Money movement calls `saveAccounts()` and `addTxn()` from
  `src/lib/bank-store.ts`, so any transfer instantly updates the balances and
  drops a new row into the activity list.

---

## 8. File map (where everything lives)

```
src/
  lib/bank-store.ts        ← USER, BALANCES, TRANSACTIONS  (edit this)
  hooks/use-bank.ts        ← keeps the UI in sync with the store
  hooks/use-theme.ts       ← light/dark mode
  hooks/use-session.ts     ← who is signed in
  components/
    Logo.tsx               ← MASKAel logo slot
    AppLayout.tsx          ← header + mobile bottom nav
    TransactionDetailsDrawer.tsx
  routes/
    login.tsx              ← sign-on screen
    _app.dashboard.tsx     ← balances + recent activity
    _app.transactions.tsx  ← full list, search + filters
    _app.transfers.tsx     ← internal + wire transfers
    _app.services.tsx
    _app.settings.tsx      ← profile, dark mode, sign out
  styles.css               ← colors / theme tokens
index.html                 ← page title & meta description
```

---

## 9. After editing — run it

```bash
npm install
npm run dev      # local preview
npm run build    # production build into ./dist
```

Deployment steps are in `DEPLOY.md`.

---

## 10. Troubleshooting

| Symptom                                   | Fix                                                        |
| ----------------------------------------- | ---------------------------------------------------------- |
| New password doesn't work                 | Clear `wf_users_v1` in localStorage, refresh                |
| Balances still show the old numbers       | Clear `wf_accounts_v1`, refresh                             |
| New transactions don't appear             | Clear `wf_txns_v1`, refresh                                 |
| Blank page after an edit                  | Check the terminal — usually a missing comma in an array    |
| Everything is stale                       | Console: `localStorage.clear(); location.reload();`         |
