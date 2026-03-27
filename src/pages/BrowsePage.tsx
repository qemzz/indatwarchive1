import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useLookups } from "@/hooks/useLookups";
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
import { Search, FileText, Download, Eye, Folder, ChevronRight, Home } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
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
  folder_id: string | null;
}

interface FolderItem {
  id: string;
  name: string;
  parent_id: string | null;
}

const BrowsePage = () => {
  const { t } = useI18n();
  const { subjects, categories: cats, years: yearsList } = useLookups();
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get("cat");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterYear, setFilterYear] = useState("all");

  // Fetch all folders once
  useEffect(() => {
    supabase
      .from("folders")
      .select("id, name, parent_id")
      .is("deleted_at", null)
      .order("name")
      .then(({ data }) => setAllFolders(data ?? []));
  }, []);

  // Build breadcrumb trail and child folders when currentFolderId changes
  useEffect(() => {
    const children = allFolders.filter((f) => f.parent_id === currentFolderId);
    setFolders(children);

    // Build breadcrumb
    const trail: FolderItem[] = [];
    let id = currentFolderId;
    while (id) {
      const folder = allFolders.find((f) => f.id === id);
      if (folder) {
        trail.unshift(folder);
        id = folder.parent_id;
      } else break;
    }
    setBreadcrumb(trail);
  }, [currentFolderId, allFolders]);

  // Fetch documents for current folder / filters
  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      let query = supabase
        .from("documents")
        .select("id, title, file_path, file_size, class_level, subject, year, category, download_count, folder_id")
        .eq("status", "approved")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (currentFolderId) {
        query = query.eq("folder_id", currentFolderId);
      }
      // Filter by category from URL query param
      if (catParam) {
        const categoryMap: Record<string, string> = {
          "past-papers": "Past Papers",
          "books": "Books",
          "notes": "Notes",
        };
        const categoryName = categoryMap[catParam];
        if (categoryName) {
          query = query.eq("category", categoryName);
        }
      }
      if (filterClass !== "all") query = query.eq("class_level", filterClass);
      if (filterSubject !== "all") query = query.eq("subject", filterSubject);
      if (filterYear !== "all") query = query.eq("year", filterYear);

      const { data } = await query;
      setDocs(data ?? []);
      setLoading(false);
    };
    fetchDocs();
  }, [currentFolderId, filterClass, filterSubject, filterYear, catParam]);

  const filtered = docs.filter((d) =>
    !search || d.title.toLowerCase().includes(search.toLowerCase())
  );

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  };

  const handlePreview = (doc: Doc) => {
    const fileUrl = getFileUrl(doc.file_path);
    if (fileUrl) window.open(fileUrl, "_blank", "noopener,noreferrer");
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
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/">{t("nav.home")}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer"
              onClick={() => setCurrentFolderId(null)}
            >
              {t("nav.documents")}
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumb.map((folder) => (
            <span key={folder.id} className="contents">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => setCurrentFolderId(folder.id)}
                >
                  {folder.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-display font-bold mb-6">
        {breadcrumb.length > 0 ? breadcrumb[breadcrumb.length - 1].name : t("nav.documents")}
      </h1>

      {/* Filters */}
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
            {subjects.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-32"><SelectValue placeholder={t("label.year")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {yearsList.map((y) => <SelectItem key={y.id} value={y.name}>{y.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Subfolders */}
      {folders.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Folders</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className="cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                onClick={() => setCurrentFolderId(folder.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Folder className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium truncate flex-1">{folder.name}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Back button when inside a folder */}
      {currentFolderId && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 gap-2"
          onClick={() => {
            const parent = allFolders.find((f) => f.id === currentFolderId);
            setCurrentFolderId(parent?.parent_id ?? null);
          }}
        >
          <Home className="h-4 w-4" />
          {breadcrumb.length > 1 ? `Back to ${breadcrumb[breadcrumb.length - 2].name}` : "Back to all documents"}
        </Button>
      )}

      {/* Documents */}
      {loading ? (
        <p className="text-center text-muted-foreground py-12">Loading documents...</p>
      ) : filtered.length === 0 && folders.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t("label.noDocuments")}</p>
      ) : filtered.length === 0 ? null : (
        <>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Documents</h2>
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
        </>
      )}
    </div>
  );
};

export default BrowsePage;
