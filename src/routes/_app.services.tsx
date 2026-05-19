import { createFileRoute } from "@tanstack/react-router";
import {
  CreditCard,
  PiggyBank,
  TrendingUp,
  Home,
  Plane,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_app/services")({
  component: ServicesPage,
});

const SERVICES = [
  { icon: CreditCard, title: "Cards", desc: "Manage debit & credit cards" },
  { icon: PiggyBank, title: "Savings goals", desc: "Plan for what matters" },
  { icon: TrendingUp, title: "Investing", desc: "Grow your money long-term" },
  { icon: Home, title: "Mortgages", desc: "Home loans made simple" },
  { icon: Plane, title: "Travel", desc: "Notify us before you travel" },
  { icon: ShieldCheck, title: "Insurance", desc: "Protect what you love" },
];

function ServicesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Explore services</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discover everything Wells Fargo can help you with.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map(({ icon: Icon, title, desc }) => (
          <button
            key={title}
            type="button"
            className="text-left rounded-2xl bg-card border border-border p-5 shadow-card hover:shadow-elevated transition-shadow"
          >
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
