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
            ? "text-[var(--sidebar-active-text)]"
            : "text-[var(--text-muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
        } ${
          collapsed
            ? "flex h-11 items-center justify-center px-2 py-2"
            : "flex min-h-[42px] items-center gap-2.5 px-2.5 py-2"
        }`
      }
      style={({ isActive: linkIsActive }) =>
        isActive || linkIsActive
          ? { backgroundColor: "var(--sidebar-active-bg)" }
          : undefined
      }
    >
      {({ isActive: linkIsActive }) => {
        const active = isActive || linkIsActive;

        return (
          <>
            {icon ? (
              <span
                className={`inline-flex h-[18px] w-[18px] items-center justify-center leading-none ${
                  active ? "text-[var(--sidebar-active-text)]" : ""
                }`}
              >
                {icon}
              </span>
            ) : null}
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-[14px] font-semibold leading-5 ${
                    active ? "text-[var(--sidebar-active-text)]" : "text-glow-soft"
                  }`}
                >
                  {label}
                </p>
                {hint ? (
                  <p
                    className={`truncate text-[10px] font-medium ${
                      active ? "" : "text-glow-muted text-[var(--text-muted)]"
                    }`}
                    style={active ? { color: "color-mix(in srgb, var(--sidebar-active-text) 82%, transparent)" } : undefined}
                  >
                    {hint}
                  </p>
                ) : null}
              </div>
            ) : null}
          </>
        );
      }}
    </NavLink>
  );
}

export default SidebarNavItem;
