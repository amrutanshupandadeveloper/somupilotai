import { NavLink } from "react-router-dom";

function SidebarNavItem({ to, label, hint, icon, onClick, isActive }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive: linkIsActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
          isActive || linkIsActive
            ? "bg-teal-500/10 text-teal-400"
            : "text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
        }`
      }
    >
      {icon && <span className="text-lg">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        {hint && (
          <p className="text-xs text-[var(--text-muted)] truncate">{hint}</p>
        )}
      </div>
    </NavLink>
  );
}

export default SidebarNavItem;
