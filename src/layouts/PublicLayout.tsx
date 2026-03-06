import { Outlet } from "react-router-dom";
import PublicHeader from "@/components/PublicHeader";

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 INDATWA ARCHIVE — School Document Portal
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
