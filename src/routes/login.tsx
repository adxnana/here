import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signIn } from "@/lib/bank-store";
import { Logo } from "@/components/Logo";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (username.trim().length < 3) return "Enter your username.";
    if (username.length > 60) return "Username is too long.";
    if (password.length < 1) return "Enter your password.";
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
    const result = signIn(username, password);
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
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Sign on</h1>

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <Field label="Username" htmlFor="username">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bank-input"
                  maxLength={60}
                  required
                />
              </Field>

              <Field label="Password" htmlFor="password">
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bank-input pr-12"
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
                {loading ? "Please wait…" : "Sign on"}
              </button>
            </form>
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
