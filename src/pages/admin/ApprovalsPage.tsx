import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, FileText, Clock } from "lucide-react";
import { toast } from "sonner";

interface PendingDoc {
  id: string;
  name: string;
  uploader: string;
  date: string;
  size: string;
  class: string;
  subject: string;
  year: string;
  category: string;
}

const initialDocs: PendingDoc[] = [
  { id: "1", name: "Mathematics Mock Exam 2025.pdf", uploader: "Mr. Kamanzi", date: "2025-03-01", size: "2.4 MB", class: "S6", subject: "Mathematics", year: "2025", category: "Mocks" },
  { id: "2", name: "Physics Lab Report Template.pdf", uploader: "Mrs. Uwase", date: "2025-03-01", size: "890 KB", class: "S5", subject: "Physics", year: "2025", category: "Notes" },
  { id: "3", name: "Biology Revision Guide S3.pdf", uploader: "Mr. Habimana", date: "2025-02-28", size: "3.1 MB", class: "S3", subject: "Biology", year: "2025", category: "Revision" },
  { id: "4", name: "English Literature Essay Models.pdf", uploader: "Ms. Ingabire", date: "2025-02-28", size: "1.5 MB", class: "S6", subject: "English", year: "2025", category: "Notes" },
];

const ApprovalsPage = () => {
  const { t } = useI18n();
  const [docs, setDocs] = useState(initialDocs);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleApprove = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success("Document approved successfully");
  };

  const handleReject = () => {
    if (rejectDialog) {
      setDocs((prev) => prev.filter((d) => d.id !== rejectDialog));
      toast.error("Document rejected");
      setRejectDialog(null);
      setRejectionReason("");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">{t("nav.approvals")}</h1>
          <p className="text-muted-foreground text-sm">{docs.length} {t("status.pending").toLowerCase()}</p>
        </div>
        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 gap-1">
          <Clock className="h-3 w-3" />
          {docs.length} pending
        </Badge>
      </div>

      {docs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success" />
            <p className="font-medium">{t("label.noPending")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => (
            <Card key={doc.id} className="animate-fade-in">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-warning" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{doc.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.uploader} · {doc.date} · {doc.size}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="secondary" className="text-xs">{doc.class}</Badge>
                        <Badge variant="outline" className="text-xs">{doc.subject}</Badge>
                        <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                        <Badge variant="outline" className="text-xs">{doc.year}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      {t("action.preview")}
                    </Button>
                    <Button size="sm" className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleApprove(doc.id)}>
                      <CheckCircle className="h-3.5 w-3.5" />
                      {t("action.approve")}
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setRejectDialog(doc.id)}>
                      <XCircle className="h-3.5 w-3.5" />
                      {t("action.reject")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!rejectDialog} onOpenChange={() => setRejectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("action.reject")} Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("label.rejectionReason")}</label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(null)}>{t("action.cancel")}</Button>
            <Button variant="destructive" onClick={handleReject}>{t("action.reject")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalsPage;
