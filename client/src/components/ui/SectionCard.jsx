export function SectionCard({ title, children, actions, className = "" }) {
  return (
    <div className={`app-card rounded-[28px] p-6 ${className}`}>
      {(title || actions) && (
        <div className="mb-5 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
