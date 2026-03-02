import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Search, FileText, Download, Filter } from "lucide-react";
import { Link } from "react-router-dom";

const mockDocs = [
  { id: "1", name: "Mathematics Final Exam 2025.pdf", subject: "Mathematics", class: "S6", year: "2025", category: "Past Papers", size: "2.4 MB", downloads: 142 },
  { id: "2", name: "Physics Revision Notes.pdf", subject: "Physics", class: "S5", year: "2025", category: "Notes", size: "1.8 MB", downloads: 89 },
  { id: "3", name: "Chemistry Handbook.pdf", subject: "Chemistry", class: "S4", year: "2025", category: "Books", size: "5.1 MB", downloads: 67 },
  { id: "4", name: "Biology Mock Exam S3.pdf", subject: "Biology", class: "S3", year: "2024", category: "Mocks", size: "1.2 MB", downloads: 203 },
  { id: "5", name: "English Literature Guide.pdf", subject: "English", class: "S6", year: "2025", category: "Books", size: "3.7 MB", downloads: 55 },
  { id: "6", name: "History National Exam 2024.pdf", subject: "History", class: "S6", year: "2024", category: "Past Papers", size: "2.1 MB", downloads: 178 },
];

const BrowsePage = () => {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/">{t("nav.home")}</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{t("nav.documents")}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-display font-bold mb-6">{t("nav.documents")}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("action.search")} className="pl-9" />
        </div>
        <Select>
          <SelectTrigger className="w-32"><SelectValue placeholder={t("label.class")} /></SelectTrigger>
          <SelectContent>
            {["S1", "S2", "S3", "S4", "S5", "S6"].map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-40"><SelectValue placeholder={t("label.subject")} /></SelectTrigger>
          <SelectContent>
            {["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"].map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-32"><SelectValue placeholder={t("label.year")} /></SelectTrigger>
          <SelectContent>
            {["2025", "2024", "2023"].map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Document grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockDocs.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow group cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {doc.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="secondary" className="text-xs">{doc.class}</Badge>
                    <Badge variant="outline" className="text-xs">{doc.subject}</Badge>
                    <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{doc.size} · {doc.year}</span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {doc.downloads}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrowsePage;
