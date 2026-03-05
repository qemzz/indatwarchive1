import { useLocation, Link, useNavigate } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, FileCheck, Upload, FileText, FolderTree,
  Users, BarChart3, Trash2, LogOut, Sun, Moon, Globe, BookOpen, ChevronLeft, Settings,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  dosOnly?: boolean;
}

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const { role, logout, userEmail } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems: NavItem[] = [
    { to: "/admin", label: t("nav.dashboard"), icon: <LayoutDashboard className="h-4 w-4" /> },
    { to: "/admin/approvals", label: t("nav.approvals"), icon: <FileCheck className="h-4 w-4" />, dosOnly: true },
    { to: "/admin/upload", label: t("nav.upload"), icon: <Upload className="h-4 w-4" /> },
    { to: "/admin/my-uploads", label: t("nav.myUploads"), icon: <FileText className="h-4 w-4" /> },
    { to: "/admin/documents", label: t("nav.documents"), icon: <FileText className="h-4 w-4" />, dosOnly: true },
    { to: "/admin/folders", label: t("nav.folders"), icon: <FolderTree className="h-4 w-4" />, dosOnly: true },
    { to: "/admin/users", label: t("nav.users"), icon: <Users className="h-4 w-4" />, dosOnly: true },
    { to: "/admin/analytics", label: t("nav.analytics"), icon: <BarChart3 className="h-4 w-4" />, dosOnly: true },
    { to: "/admin/recycle-bin", label: t("nav.recycleBin"), icon: <Trash2 className="h-4 w-4" />, dosOnly: true },
    { to: "/admin/settings", label: "Settings", icon: <Settings className="h-4 w-4" />, dosOnly: true },
  ];

  const filteredItems = navItems.filter((item) => !item.dosOnly || role === "dos");

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        <span className="font-display font-bold text-base">EduDocs</span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-2 px-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setLang("en")} className={lang === "en" ? "bg-accent" : ""}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("fr")} className={lang === "fr" ? "bg-accent" : ""}>Français</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>

        <div className="px-3 py-2">
          <p className="text-xs text-sidebar-muted truncate">{userEmail}</p>
          <p className="text-xs text-sidebar-primary font-medium uppercase">{role}</p>
        </div>

        <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-muted hover:text-sidebar-foreground rounded-lg hover:bg-sidebar-accent transition-colors">
          <ChevronLeft className="h-4 w-4" />
          {t("nav.home")}
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm text-sidebar-muted hover:text-destructive rounded-lg hover:bg-sidebar-accent transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
