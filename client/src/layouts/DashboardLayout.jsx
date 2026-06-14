import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import AppSidebar from "../components/AppSidebar";
import TopBar from "../components/TopBar";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/chat": "Chat",
  "/notes": "Notes",
  "/tasks": "Tasks",
  "/memories": "Memories",
  "/documents": "Documents",
  "/settings": "Settings",
  "/admin/dashboard": "Admin Dashboard",
  "/admin/users": "Admin Users",
  "/admin/usage": "Admin Usage",
  "/admin/providers": "Admin Providers",
  "/admin/audit-logs": "Admin Audit Logs",
};

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, usage, usageCountdown } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="app-shell h-screen overflow-hidden flex bg-black">
      <div className="mx-auto flex h-full w-full max-w-[1720px]">
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          user={user}
          usage={usage}
          usageCountdown={usageCountdown}
          onLogout={handleLogout}
          onNewChat={() => {
            setIsSidebarOpen(false);
            navigate("/chat");
          }}
        />

        {isSidebarOpen ? (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-40 bg-black/82 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        ) : null}

        <div className="flex h-full min-w-0 flex-1 flex-col">
          <TopBar
            title={pageTitles[location.pathname] || "SomuPilot AI"}
            user={user}
            usage={usage}
            usageCountdown={usageCountdown}
            theme={theme}
            onToggleTheme={toggleTheme}
            onMenuOpen={() => setIsSidebarOpen(true)}
          />

          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 xl:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
