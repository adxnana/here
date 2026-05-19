// ============================================================
// MASKAel — LOGO SLOT
// Replace `logoUrl` below with your own asset if needed.
//   import logoUrl from "@/assets/your-logo.svg";
// Or use an absolute URL string. The wrapper keeps sizing
// and accessible alt text consistent across the app.
// ============================================================
import logoUrl from "@/assets/wells-fargo-logo.jpeg";

type Props = { className?: string; compact?: boolean };

export function Logo({ className = "", compact = false }: Props) {
  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      data-maskael-logo-slot="replace-with-img"
    >
      <img
        src={logoUrl}
        alt="Wells Fargo"
        className="h-10 w-10 rounded-lg object-cover shadow-brand"
      />
      {!compact && (
        <span className="font-bold tracking-tight text-base sm:text-lg text-foreground leading-tight">
          Wells Fargo
          <span className="block text-[11px] font-semibold text-primary uppercase tracking-wider">
            Online Access
          </span>
        </span>
      )}
    </div>
  );
}
