import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, Download, Upload, FileCheck, FolderTree, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type RecentDoc = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  uploaded_by: string;
  uploader_name?: string;
};

const statusBadge = (status: string) => {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    pending: { variant: "secondary", className: "bg-warning/10 text-warning border-warning/20" },
    approved: { variant: "secondary", className: "bg-success/10 text-success border-success/20" },
    rejected: { variant: "secondary", className: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const config = map[status] || map.pending;
  return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const DashboardPage = () => {
  const { t } = useI18n();
  const { role } = useAuth();

  const [totalDocs, setTotalDocs] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const { count: total } = await supabase
      .from("documents").select("*", { count: "exact", head: true }).is("deleted_at", null);
    const { count: pending } = await supabase
      .from("documents").select("*", { count: "exact", head: true }).eq("status", "pending").is("deleted_at", null);
    const { count: approved } = await supabase
      .from("documents").select("*", { count: "exact", head: true }).eq("status", "approved").is("deleted_at", null);
    const { data: dlData } = await supabase
      .from("documents").select("download_count").is("deleted_at", null);

    setTotalDocs(total ?? 0);
    setPendingCount(pending ?? 0);
    setApprovedCount(approved ?? 0);
    setTotalDownloads(dlData?.reduce((sum, d) => sum + (d.download_count || 0), 0) ?? 0);
  };

  const fetchRecent = async () => {
    const { data } = await supabase
      .from("documents")
      .select("id, title, status, created_at, uploaded_by")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(6);

    if (!data) { setRecentDocs([]); return; }

    const uploaderIds = [...new Set(data.map(d => d.uploaded_by))];
    const { data: profiles } = await supabase
      .from("profiles").select("id, full_name").in("id", uploaderIds);
    const nameMap = new Map(profiles?.map(p => [p.id, p.full_name]) ?? []);

    setRecentDocs(data.map(d => ({ ...d, uploader_name: nameMap.get(d.uploaded_by) ?? "Unknown" })));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchRecent()]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "documents" }, () => {
        fetchStats();
        fetchRecent();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = [
    { key: "totalDocuments", icon: FileText, value: totalDocs.toLocaleString(), color: "text-primary" },
    { key: "pendingReview", icon: Clock, value: pendingCount.toLocaleString(), color: "text-warning" },
    { key: "approvedDocs", icon: CheckCircle, value: approvedCount.toLocaleString(), color: "text-success" },
    { key: "totalDownloads", icon: Download, value: totalDownloads.toLocaleString(), color: "text-primary" },
  ];

  const quickActions = [
    { label: t("nav.upload"), icon: Upload, to: "/admin/upload" },
    ...(role === "dos" ? [
      { label: t("nav.approvals"), icon: FileCheck, to: "/admin/approvals" },
      { label: t("nav.folders"), icon: FolderTree, to: "/admin/folders" },
      { label: t("nav.users"), icon: Users, to: "/admin/users" },
    ] : []),
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-1">{t("label.welcome")} 👋</h1>
      <p className="text-muted-foreground mb-6">{t("nav.dashboard")}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.key}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{loading ? "–" : stat.value}</p>
                <p className="text-xs text-muted-foreground">{t(`label.${stat.key}`)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">{t("label.recentUploads")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentDocs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents yet</p>
            ) : (
              recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.uploader_name} · {timeAgo(doc.created_at)}</p>
                    </div>
                  </div>
                  {statusBadge(doc.status)}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">{t("label.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.to} to={action.to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
