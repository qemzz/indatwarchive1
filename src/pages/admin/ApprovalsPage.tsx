import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, FileText, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PendingDoc {
  id: string;
  title: string;
  file_path: string;
  file_size: number | null;
  class_level: string | null;
  subject: string | null;
  year: string | null;
  category: string | null;
  created_at: string;
  uploaded_by: string;
  uploader_name?: string;
}

const ApprovalsPage = () => {
  const { t } = useI18n();
  const { userId } = useAuth();
  const [docs, setDocs] = useState<PendingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchPending = async () => {
    const { data, error } = await supabase
      .from("documents")
      .select("id, title, file_path, file_size, class_level, subject, year, category, created_at, uploaded_by")
      .eq("status", "pending")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (!error && data) {
      // Fetch uploader names
      const uploaderIds = [...new Set(data.map((d) => d.uploaded_by))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", uploaderIds);
      const nameMap = new Map(profiles?.map((p) => [p.id, p.full_name]) ?? []);
      setDocs(data.map((d) => ({ ...d, uploader_name: nameMap.get(d.uploaded_by) ?? "Unknown" })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPending(); }, []);

  const handleApprove = async (id: string) => {
    const { error } = await supabase.from("documents").update({
      status: "approved",
      approved_by: userId,
      approved_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return toast.error(error.message);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success("Document approved and published");
  };

  const handleReject = async () => {
    if (!rejectDialog) return;
    const { error } = await supabase.from("documents").update({
      status: "rejected",
      rejection_reason: rejectionReason,
    }).eq("id", rejectDialog);
    if (error) return toast.error(error.message);
    setDocs((prev) => prev.filter((d) => d.id !== rejectDialog));
    toast.error("Document rejected");
    setRejectDialog(null);
    setRejectionReason("");
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    return bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">{t("nav.approvals")}</h1>
          <p className="text-muted-foreground text-sm">{docs.length} {t("status.pending").toLowerCase()}</p>
        </div>
        <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20 gap-1">
          <Clock className="h-3 w-3" /> {docs.length} pending
        </Badge>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading...</p>
      ) : docs.length === 0 ? (
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
                      <h3 className="font-medium text-sm">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {doc.uploader_name} · {new Date(doc.created_at).toLocaleDateString()} · {formatSize(doc.file_size)}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {doc.class_level && <Badge variant="secondary" className="text-xs">{doc.class_level}</Badge>}
                        {doc.subject && <Badge variant="outline" className="text-xs">{doc.subject}</Badge>}
                        {doc.category && <Badge variant="outline" className="text-xs">{doc.category}</Badge>}
                        {doc.year && <Badge variant="outline" className="text-xs">{doc.year}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground" onClick={() => handleApprove(doc.id)}>
                      <CheckCircle className="h-3.5 w-3.5" /> {t("action.approve")}
                    </Button>
                    <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => setRejectDialog(doc.id)}>
                      <XCircle className="h-3.5 w-3.5" /> {t("action.reject")}
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
          <DialogHeader><DialogTitle>{t("action.reject")} Document</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("label.rejectionReason")}</label>
            <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Enter reason for rejection..." rows={3} />
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
