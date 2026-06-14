export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="app-card flex flex-col items-center justify-center rounded-[28px] px-6 py-14 text-center">
      {icon ? (
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-3xl">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-medium text-[var(--text)]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
