import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Search, Sun, Moon, Globe, LogIn, LayoutDashboard } from "lucide-react";

const PublicHeader = () => {
  const { t, lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/browse", label: t("nav.documents") },
    { to: "/browse?cat=past-papers", label: t("nav.pastPapers") },
    { to: "/browse?cat=books", label: t("nav.books") },
    { to: "/browse?cat=notes", label: t("nav.notes") },
  ];

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg hidden sm:inline">EduDocs</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("action.search")}
              className="pl-9 w-48 h-9 text-sm bg-muted/50"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Globe className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("en")} className={lang === "en" ? "bg-accent" : ""}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("fr")} className={lang === "fr" ? "bg-accent" : ""}>
                Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {isAuthenticated ? (
            <Link to="/admin">
              <Button size="sm" className="gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" />
                {t("nav.dashboard")}
              </Button>
            </Link>
          ) : (
            <Link to="/admin">
              <Button size="sm" variant="outline" className="gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                {t("nav.login")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
