import { getUsageToneClasses } from "../utils/usage";

function UsageBadge({ usage, countdown }) {
  if (!usage) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border px-3 py-2 text-xs transition ${getUsageToneClasses(
        usage.aiCredits
      )} bg-white/5 backdrop-blur`}
    >
      <p className="font-semibold">AI {usage.aiCredits}/{usage.maxAiCredits}</p>
      <p className="mt-1 opacity-80">Renews in {countdown}</p>
    </div>
  );
}

export default UsageBadge;
