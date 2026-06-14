import { useRef, useEffect } from "react";
import SidebarNavItem from "./SidebarNavItem";

const baseMenuItems = [
  { label: "Memories", to: "/memories", hint: "Context" },
  { label: "Documents", to: "/documents", hint: "PDF Q&A" },
  { label: "Settings", to: "/settings", hint: "Preferences" },
];

function MoreMenu({ isOpen, onClose, user }) {
  const menuRef = useRef(null);
  const moreMenuItems =
    user?.role === "admin"
      ? [...baseMenuItems, { label: "Admin", to: "/admin/dashboard", hint: "Control" }]
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
      className="ml-3 mt-1 space-y-1 overflow-hidden transition-all duration-300"
    >
      {moreMenuItems.map((item) => (
        <SidebarNavItem
          key={item.to}
          to={item.to}
          label={item.label}
          hint={item.hint}
          onClick={onClose}
        />
      ))}
    </div>
  );
}

export default MoreMenu;
