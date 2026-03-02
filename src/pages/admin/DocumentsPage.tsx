import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FileText, Trash2 } from "lucide-react";

const allDocs = [
  { id: "1", name: "Mathematics Final Exam 2025.pdf", uploader: "Mr. Kamanzi", class: "S6", subject: "Mathematics", status: "approved", date: "2025-03-01" },
  { id: "2", name: "Physics Lab Notes.pdf", uploader: "Mrs. Uwase", class: "S5", subject: "Physics", status: "approved", date: "2025-02-28" },
  { id: "3", name: "Biology Mock S3.pdf", uploader: "Mr. Habimana", class: "S3", subject: "Biology", status: "pending", date: "2025-02-27" },
  { id: "4", name: "English Essay Models.pdf", uploader: "Ms. Ingabire", class: "S6", subject: "English", status: "rejected", date: "2025-02-26" },
];

const statusStyle: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const DocumentsPage = () => {
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">{t("nav.documents")}</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("action.search")} className="pl-9" />
        </div>
        <Select>
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
              {allDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {doc.name}
                    </div>
                  </TableCell>
                  <TableCell>{doc.uploader}</TableCell>
                  <TableCell>{doc.class}</TableCell>
                  <TableCell>{doc.subject}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusStyle[doc.status]}>{doc.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{doc.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;
