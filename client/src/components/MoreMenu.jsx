import { useRef, useEffect } from "react";
import { Brain, FileText, Settings, Shield } from "lucide-react";
import SidebarNavItem from "./SidebarNavItem";

const baseMenuItems = [
  {
    label: "Memories",
    to: "/memories",
    hint: "Context",
    icon: <Brain className="h-[18px] w-[18px]" strokeWidth={1.9} />,
  },
  {
    label: "Documents",
    to: "/documents",
    hint: "PDF Q&A",
    icon: <FileText className="h-[18px] w-[18px]" strokeWidth={1.9} />,
  },
  {
    label: "Settings",
    to: "/settings",
    hint: "Preferences",
    icon: <Settings className="h-[18px] w-[18px]" strokeWidth={1.9} />,
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
            icon: <Shield className="h-[18px] w-[18px]" strokeWidth={1.9} />,
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
