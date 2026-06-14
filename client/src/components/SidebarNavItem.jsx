import { NavLink } from "react-router-dom";

function SidebarNavItem({ to, label, hint, icon, onClick, isActive, collapsed = false }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      aria-label={label}
      title={collapsed ? label : undefined}
      className={({ isActive: linkIsActive }) =>
        `group rounded-xl transition-all ${
          isActive || linkIsActive
            ? "bg-teal-500/10 text-teal-400"
            : "text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
        } ${
          collapsed
            ? "flex h-12 items-center justify-center px-2 py-2"
            : "flex items-center gap-3 px-3 py-2.5"
        }`
      }
    >
      {icon && <span className="text-lg">{icon}</span>}
      {!collapsed ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{label}</p>
          {hint && <p className="truncate text-xs text-[var(--text-muted)]">{hint}</p>}
        </div>
      ) : null}
    </NavLink>
  );
}

export default SidebarNavItem;
