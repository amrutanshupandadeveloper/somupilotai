export function SectionCard({ title, children, actions, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
