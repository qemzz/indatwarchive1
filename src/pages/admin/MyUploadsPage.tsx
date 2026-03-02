import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

const myDocs = [
  { id: "1", name: "Math Mock Exam 2025.pdf", date: "2025-03-01", status: "pending", reason: null },
  { id: "2", name: "Physics Lab Notes.pdf", date: "2025-02-28", status: "approved", reason: null },
  { id: "3", name: "Old Chemistry Notes.pdf", date: "2025-02-25", status: "rejected", reason: "Incorrect subject classification" },
];

const statusStyle: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const MyUploadsPage = () => {
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-1">{t("nav.myUploads")}</h1>
      <p className="text-muted-foreground text-sm mb-6">Track your uploaded documents</p>

      <div className="space-y-3">
        {myDocs.map((doc) => (
          <Card key={doc.id} className="animate-fade-in">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.date}</p>
                  {doc.reason && (
                    <p className="text-xs text-destructive mt-1">Reason: {doc.reason}</p>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className={statusStyle[doc.status]}>
                {t(`status.${doc.status}`)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyUploadsPage;
