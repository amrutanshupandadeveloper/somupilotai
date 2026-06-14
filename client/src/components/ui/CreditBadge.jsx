import { Badge } from "./Badge";

export function CreditBadge({ credits = 0, maxCredits = 0, label, countdown }) {
  let variant = "success";

  if (credits <= 0) {
    variant = "danger";
  } else if (credits <= 5) {
    variant = "warning";
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>
        {credits}/{maxCredits} credits
      </Badge>
      {label || countdown ? (
        <span className="text-xs text-[var(--text-muted)]">
          {label}
          {label && countdown ? " • " : ""}
          {countdown ? `Renews in ${countdown}` : ""}
        </span>
      ) : null}
    </div>
  );
}
