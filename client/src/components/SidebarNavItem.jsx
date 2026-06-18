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
            ? "flex h-11 items-center justify-center px-2 py-2"
            : "flex min-h-[44px] items-center gap-2.5 px-3 py-2"
        }`
      }
    >
      {icon && <span className="text-[18px] leading-none">{icon}</span>}
      {!collapsed ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium leading-5">{label}</p>
          {hint && <p className="truncate text-[11px] text-[var(--text-muted)]">{hint}</p>}
        </div>
      ) : null}
    </NavLink>
  );
}

export default SidebarNavItem;
