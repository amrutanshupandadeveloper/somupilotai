import { Badge } from "./Badge";

export function CreditBadge({ credits, maxCredits, label }) {
  const percentage = (credits / maxCredits) * 100;
  
  let variant = "default";
  if (percentage > 50) variant = "success";
  else if (percentage > 25) variant = "warning";
  else if (percentage > 0) variant = "danger";
  else variant = "danger";
  
  return (
    <div className="flex items-center gap-2">
      <Badge variant={variant}>
        {credits}/{maxCredits}
      </Badge>
      {label && <span className="text-xs text-slate-400">{label}</span>}
    </div>
  );
}
