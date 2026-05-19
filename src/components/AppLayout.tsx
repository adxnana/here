import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { useSession } from "@/hooks/use-session";
import { useEffect } from "react";
import { Wallet, ArrowLeftRight, Receipt, Compass, Settings, LogOut } from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Accounts", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/transfers", label: "Transfers", icon: ArrowLeftRight },
  { to: "/services", label: "Explore", icon: Compass },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout() {
  const { user, ready, logout } = useSession();
  const navigate = useNavigate();
  const { location } = useRouterState();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/login" });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground shadow-brand">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center" aria-label="Home">
            <div className="bg-white rounded-xl px-2 py-1">
              <Logo />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            {NAV.map((n) => {
              const active = location.pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-white text-primary"
                      : "text-primary-foreground/90 hover:bg-white/10"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/10"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>

          <span className="md:hidden text-sm font-medium">Hi, {user.firstName}</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-card border-t border-border shadow-elevated"
        aria-label="Primary mobile"
      >
        <ul className="grid grid-cols-5">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = location.pathname.startsWith(n.to);
            return (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium min-h-14 ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
