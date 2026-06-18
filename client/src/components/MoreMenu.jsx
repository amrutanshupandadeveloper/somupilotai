import { useRef, useEffect } from "react";
import SidebarNavItem from "./SidebarNavItem";

const baseMenuItems = [
  {
    label: "Memories",
    to: "/memories",
    hint: "Context",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v8m-4-4h8m5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: "Documents",
    to: "/documents",
    hint: "PDF Q&A",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 3h7l5 5v13a1 1 0 01-1 1H7a2 2 0 01-2-2V5a2 2 0 012-2z"
        />
      </svg>
    ),
  },
  {
    label: "Settings",
    to: "/settings",
    hint: "Preferences",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317a1 1 0 011.35-.936l.86.344a1 1 0 00.93-.09l.762-.508a1 1 0 011.503.65l.18.899a1 1 0 00.62.74l.867.347a1 1 0 01.566 1.37l-.347.867a1 1 0 00.09.93l.508.762a1 1 0 01-.65 1.503l-.899.18a1 1 0 00-.74.62l-.347.867a1 1 0 01-1.37.566l-.867-.347a1 1 0 00-.93.09l-.762.508a1 1 0 01-1.503-.65l-.18-.899a1 1 0 00-.62-.74l-.867-.347a1 1 0 01-.566-1.37l.347-.867a1 1 0 00-.09-.93l-.508-.762a1 1 0 01.65-1.503l.899-.18a1 1 0 00.74-.62l.347-.867z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    ),
  },
];

function MoreMenu({ isOpen, onClose, user, collapsed = false }) {
  const menuRef = useRef(null);
  const moreMenuItems =
    user?.role === "admin"
      ? [
          ...baseMenuItems,
          {
            label: "Admin",
            to: "/admin/dashboard",
            hint: "Control",
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 2l7 4v6c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V6l7-4z"
                />
              </svg>
            ),
          },
        ]
      : baseMenuItems;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={
        collapsed
          ? "absolute left-[calc(100%+12px)] top-0 z-40 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface-glass)] p-2 shadow-2xl backdrop-blur-xl"
          : "ml-2 mt-1 space-y-1 overflow-hidden transition-all duration-300"
      }
    >
      {moreMenuItems.map((item) => (
        <SidebarNavItem
          key={item.to}
          to={item.to}
          label={item.label}
          hint={item.hint}
          icon={item.icon}
          collapsed={collapsed}
          onClick={onClose}
        />
      ))}
    </div>
  );
}

export default MoreMenu;
