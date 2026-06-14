import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";

function UserTopBarActions({
  usage,
  primaryActionLabel,
  onPrimaryAction,
  secondaryContent = null,
}) {
  const creditVariant =
    (usage?.aiCredits || 0) <= 0
      ? "danger"
      : (usage?.aiCredits || 0) <= 5
        ? "warning"
        : "success";

  return (
    <div className="flex items-center gap-2">
      {usage ? (
        <Badge variant={creditVariant}>
          {usage.aiCredits}/{usage.maxAiCredits} credits
        </Badge>
      ) : null}
      {secondaryContent}
      {primaryActionLabel && onPrimaryAction ? (
        <Button size="sm" onClick={onPrimaryAction}>
          {primaryActionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default UserTopBarActions;
