import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signIn, signUp } from "@/lib/bank-store";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (mode === "signup") {
      const name = fullName.trim();
      if (name.length < 2) return "Please enter your full name.";
      if (name.length > 80) return "Name is too long.";
    }
    const e = email.trim().toLowerCase();
    if (!EMAIL_RE.test(e)) return "Enter a valid email address.";
    if (e.length > 120) return "Email is too long.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password.length > 128) return "Password is too long.";
    return null;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    const result =
      mode === "signin"
        ? signIn(email, password)
        : signUp({ email, password, fullName });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary to-primary-dark">
      <div className="flex-1 grid place-items-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-elevated">
              <Logo />
            </div>
          </div>

          <div className="bg-card rounded-2xl shadow-elevated p-6 sm:p-8 border border-border">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {mode === "signin" ? "Sign on" : "Create your account"}
            </h1>

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              {mode === "signup" && (
                <Field label="Full name" htmlFor="fullName">
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bank-input"
                    maxLength={80}
                    required
                  />
                </Field>
              )}

              <Field label="Username" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bank-input"
                  maxLength={120}
                  required
                />
              </Field>

              <Field label="Password" htmlFor="password">
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bank-input pr-12"
                    minLength={6}
                    maxLength={128}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute inset-y-0 right-0 px-3 grid place-items-center text-muted-foreground hover:text-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </Field>

              {mode === "signin" && (
                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 text-foreground">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 accent-[color:var(--primary)]"
                    />
                    Save username
                  </label>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold shadow-brand hover:bg-primary-dark transition-colors disabled:opacity-60"
              >
                {loading ? "Please wait…" : mode === "signin" ? "Sign on" : "Create account"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <button
                  onClick={() => setMode("signup")}
                  className="text-primary font-semibold hover:underline"
                >
                  Enroll
                </button>
              ) : (
                <button
                  onClick={() => setMode("signin")}
                  className="text-primary font-semibold hover:underline"
                >
                  Back to sign on
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bank-input {
          width: 100%;
          height: 3rem;
          border-radius: 0.75rem;
          background: var(--background);
          border: 1px solid var(--border);
          padding: 0 0.875rem;
          color: var(--foreground);
          font-size: 1rem;
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .bank-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px color-mix(in oklab, var(--primary) 15%, transparent);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="block text-sm font-medium text-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}
