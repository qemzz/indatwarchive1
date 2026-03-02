import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, CheckCircle, Download, Upload, FileCheck, FolderTree, Users } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { key: "totalDocuments", icon: FileText, value: "247", color: "text-primary" },
  { key: "pendingReview", icon: Clock, value: "12", color: "text-warning" },
  { key: "approvedDocs", icon: CheckCircle, value: "218", color: "text-success" },
  { key: "totalDownloads", icon: Download, value: "3,842", color: "text-primary" },
];

const recentDocs = [
  { name: "Math Final 2025.pdf", uploader: "Mr. Kamanzi", date: "2h ago", status: "pending" },
  { name: "Physics Notes S5.pdf", uploader: "Mrs. Uwase", date: "5h ago", status: "approved" },
  { name: "Biology Mock S3.pdf", uploader: "Mr. Habimana", date: "1d ago", status: "rejected" },
  { name: "Chemistry Book S4.pdf", uploader: "Ms. Ingabire", date: "1d ago", status: "pending" },
];

const statusBadge = (status: string) => {
  const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    pending: { variant: "secondary", className: "bg-warning/10 text-warning border-warning/20" },
    approved: { variant: "secondary", className: "bg-success/10 text-success border-success/20" },
    rejected: { variant: "secondary", className: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  const config = map[status] || map.pending;
  return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
};

const DashboardPage = () => {
  const { t } = useI18n();
  const { role } = useAuth();

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

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.key}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{t(`label.${stat.key}`)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent uploads */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">{t("label.recentUploads")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDocs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.uploader} · {doc.date}</p>
                  </div>
                </div>
                {statusBadge(doc.status)}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">{t("label.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
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
