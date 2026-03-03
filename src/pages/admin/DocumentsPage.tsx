import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocRow {
  id: string;
  title: string;
  class_level: string | null;
  subject: string | null;
  status: string;
  created_at: string;
  uploaded_by: string;
  uploader_name?: string;
}

const statusStyle: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const DocumentsPage = () => {
  const { t } = useI18n();
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchDocs = async () => {
    let query = supabase
      .from("documents")
      .select("id, title, class_level, subject, status, created_at, uploaded_by")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (statusFilter !== "all") query = query.eq("status", statusFilter);

    const { data } = await query;
    if (data) {
      const uploaderIds = [...new Set(data.map((d) => d.uploaded_by))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", uploaderIds);
      const nameMap = new Map(profiles?.map((p) => [p.id, p.full_name]) ?? []);
      setDocs(data.map((d) => ({ ...d, uploader_name: nameMap.get(d.uploaded_by) ?? "Unknown" })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchDocs(); }, [statusFilter]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("documents").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success("Document moved to recycle bin");
  };

  const filtered = docs.filter((d) => !search || d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">{t("nav.documents")}</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("action.search")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28"><SelectValue placeholder={t("label.status")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>{t("label.uploadedBy")}</TableHead>
                <TableHead>{t("label.class")}</TableHead>
                <TableHead>{t("label.subject")}</TableHead>
                <TableHead>{t("label.status")}</TableHead>
                <TableHead>{t("label.date")}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">{t("label.noDocuments")}</TableCell></TableRow>
              ) : (
                filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {doc.title}
                      </div>
                    </TableCell>
                    <TableCell>{doc.uploader_name}</TableCell>
                    <TableCell>{doc.class_level}</TableCell>
                    <TableCell>{doc.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusStyle[doc.status] ?? ""}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;
