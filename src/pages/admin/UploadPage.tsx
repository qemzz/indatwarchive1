import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLookups } from "@/hooks/useLookups";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, X, CheckCircle2, Clock3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type UploadedDocument = {
  id: string;
  title: string;
  status: string;
  created_at: string;
};

const UploadPage = () => {
  const { t } = useI18n();
  const { subjects, categories, years: yearsList } = useLookups();
  const { userId, role } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [classLevel, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [folderId, setFolderId] = useState("");
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [recentUploads, setRecentUploads] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadRecentUploads = useCallback(async () => {
    if (!userId) {
      setRecentUploads([]);
      return;
    }

    const { data, error } = await supabase
      .from("documents")
      .select("id, title, status, created_at")
      .eq("uploaded_by", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data) {
      setRecentUploads(data);
    }
  }, [userId]);

  useEffect(() => {
    supabase
      .from("folders")
      .select("id, name")
      .is("deleted_at", null)
      .order("name")
      .then(({ data }) => {
        if (data) setFolders(data);
      });
  }, []);

  useEffect(() => {
    loadRecentUploads();
  }, [loadRecentUploads]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || files.length === 0) return toast.error("Please select files to upload");
    setUploading(true);

    try {
      for (const file of files) {
        const ts = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const filePath = `${userId}/${ts}_${safeName}`;

        const { error: storageErr } = await supabase.storage
          .from("documents")
          .upload(filePath, file);
        if (storageErr) throw storageErr;

        const status = role === "dos" ? "approved" : "pending";

        const { error: dbErr } = await supabase.from("documents").insert({
          title: file.name,
          file_path: filePath,
          file_size: file.size,
          class_level: classLevel || null,
          subject: subject || null,
          year: year || null,
          category: category || null,
          folder_id: folderId || null,
          uploaded_by: userId,
          status,
          ...(status === "approved" ? { approved_by: userId, approved_at: new Date().toISOString() } : {}),
        });
        if (dbErr) throw dbErr;
      }

      const msg = role === "dos"
        ? `${files.length} file(s) uploaded and published`
        : `${files.length} file(s) uploaded and sent for review`;
      toast.success(msg);
      setFiles([]);
      await loadRecentUploads();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold mb-1">{t("nav.upload")}</h1>
        <p className="text-muted-foreground text-sm">
          {role === "dos" ? "Upload documents (auto-published)" : "Upload documents for review"}
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-sm">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX up to 20MB each</p>
          <input id="file-input" type="file" multiple accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileInput} />
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFile(i)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Document Details</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Folder</Label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
                <SelectContent>
                  {folders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("label.class")}</Label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {["S1", "S2", "S3", "S4", "S5", "S6"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("label.subject")}</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("label.year")}</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {yearsList.map((y) => <SelectItem key={y.id} value={y.name}>{y.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("label.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full gap-2" disabled={uploading}>
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : `${t("action.upload")} (${files.length} files)`}
        </Button>
      </form>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentUploads.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your uploaded documents will appear here immediately after upload.</p>
          ) : (
            recentUploads.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {new Date(doc.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge variant={doc.status === "approved" ? "default" : "secondary"} className="shrink-0 gap-1">
                  {doc.status === "approved" ? <CheckCircle2 className="h-3 w-3" /> : <Clock3 className="h-3 w-3" />}
                  {doc.status === "approved" ? "Uploaded" : "Pending review"}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadPage;

