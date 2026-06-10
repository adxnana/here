import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/hooks/use-session";
import { useTheme } from "@/hooks/use-theme";
import { Bell, KeyRound, ShieldCheck, LogOut, User, Moon, Sun } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, logout } = useSession();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile and security preferences.
        </p>
      </header>

      <section className="rounded-2xl bg-card border border-border p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground grid place-items-center text-xl font-bold">
            {user?.firstName?.[0] ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{user?.fullName}</p>
            <p className="text-sm text-muted-foreground truncate">@{user?.username}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-card border border-border shadow-card divide-y divide-border overflow-hidden">
        <Row icon={<User className="h-5 w-5" />} title="Profile" desc="Update your name, email and phone" />
        <Row icon={<Bell className="h-5 w-5" />} title="Notifications" desc="Manage alerts and statements" />
        <Row icon={<KeyRound className="h-5 w-5" />} title="Reset password" desc="Change your account password" />
        <Row icon={<ShieldCheck className="h-5 w-5" />} title="Security" desc="Two-factor authentication & devices" />
      </section>

      <section className="rounded-2xl bg-card border border-border p-5 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground">Dark mode</p>
              <p className="text-xs text-muted-foreground">
                Default is light. Toggle a darker, easier-on-the-eyes theme.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Toggle dark mode"
            onClick={toggle}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
              theme === "dark" ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </section>

      <button
        onClick={() => {
          logout();
          navigate({ to: "/login" });
        }}
        className="w-full h-12 rounded-xl bg-card border border-border text-primary font-semibold hover:bg-primary/5 inline-flex items-center justify-center gap-2"
      >
        <LogOut className="h-5 w-5" /> Sign out
      </button>

      <p className="text-xs text-center text-muted-foreground">
        Wells Fargo: Online Access
      </p>
    </div>
  );
}

function Row({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      className="w-full flex items-center gap-4 p-4 text-left hover:bg-secondary/60 transition-colors"
    >
      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}
