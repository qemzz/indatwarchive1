import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider } from "@/contexts/AuthContext";

import PublicLayout from "@/layouts/PublicLayout";
import AdminLayout from "@/layouts/AdminLayout";

import HomePage from "@/pages/HomePage";
import BrowsePage from "@/pages/BrowsePage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

import DashboardPage from "@/pages/admin/DashboardPage";
import ApprovalsPage from "@/pages/admin/ApprovalsPage";
import UploadPage from "@/pages/admin/UploadPage";
import MyUploadsPage from "@/pages/admin/MyUploadsPage";
import DocumentsPage from "@/pages/admin/DocumentsPage";
import FoldersPage from "@/pages/admin/FoldersPage";
import UsersPage from "@/pages/admin/UsersPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import RecycleBinPage from "@/pages/admin/RecycleBinPage";
import SettingsPage from "@/pages/admin/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/browse" element={<BrowsePage />} />
                </Route>

                {/* Auth */}
                <Route path="/admin/login" element={<LoginPage />} />

                {/* Admin */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="approvals" element={<ApprovalsPage />} />
                  <Route path="upload" element={<UploadPage />} />
                  <Route path="my-uploads" element={<MyUploadsPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="folders" element={<FoldersPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="recycle-bin" element={<RecycleBinPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
