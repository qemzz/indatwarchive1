import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Search, FileText, Download, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Doc {
  id: string;
  title: string;
  file_path: string;
  file_size: number | null;
  class_level: string | null;
  subject: string | null;
  year: string | null;
  category: string | null;
  download_count: number;
}

const BrowsePage = () => {
  const { t } = useI18n();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);

      let query = supabase
        .from("documents")
        .select("id, title, file_path, file_size, class_level, subject, year, category, download_count")
        .eq("status", "approved")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (filterClass !== "all") query = query.eq("class_level", filterClass);
      if (filterSubject !== "all") query = query.eq("subject", filterSubject);
      if (filterYear !== "all") query = query.eq("year", filterYear);

      const { data } = await query;
      setDocs(data ?? []);
      setLoading(false);
    };
    fetchDocs();
  }, [filterClass, filterSubject, filterYear]);

  const filtered = docs.filter((d) =>
    !search || d.title.toLowerCase().includes(search.toLowerCase())
  );

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  };

  const handlePreview = (doc: Doc) => {
    const fileUrl = getFileUrl(doc.file_path);
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = async (doc: Doc) => {
    const fileUrl = getFileUrl(doc.file_path);
    if (!fileUrl) return;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = doc.title;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const nextCount = doc.download_count + 1;
    setDocs((prev) => prev.map((item) => item.id === doc.id ? { ...item, download_count: nextCount } : item));
    supabase.from("documents").update({ download_count: nextCount }).eq("id", doc.id).then();
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    return bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/">{t("nav.home")}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink>{t("nav.documents")}</BreadcrumbLink></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-display font-bold mb-6">{t("nav.documents")}</h1>

      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("action.search")} className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-32"><SelectValue placeholder={t("label.class")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {["S1", "S2", "S3", "S4", "S5", "S6"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-40"><SelectValue placeholder={t("label.subject")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-32"><SelectValue placeholder={t("label.year")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {["2026", "2025", "2024", "2023"].map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading documents...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t("label.noDocuments")}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{doc.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {doc.class_level && <Badge variant="secondary" className="text-xs">{doc.class_level}</Badge>}
                      {doc.subject && <Badge variant="outline" className="text-xs">{doc.subject}</Badge>}
                      {doc.category && <Badge variant="outline" className="text-xs">{doc.category}</Badge>}
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <span>{formatSize(doc.file_size)} · {doc.year}</span>
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" />{doc.download_count}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => handlePreview(doc)}>
                    <Eye className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => handleDownload(doc)}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowsePage;

