import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

const UploadPage = () => {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  const [classLevel, setClassLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return toast.error("Please select files to upload");
    toast.success(`${files.length} file(s) uploaded and sent for review`);
    setFiles([]);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-bold mb-1">{t("nav.upload")}</h1>
      <p className="text-muted-foreground text-sm mb-6">Upload documents for review</p>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* Drop zone */}
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

        {/* File list */}
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

        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Document Details</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("label.class")}</Label>
              <Select value={classLevel} onValueChange={setClassLevel}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {["S1", "S2", "S3", "S4", "S5", "S6"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("label.subject")}</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>
                  {["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "Economics"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("label.year")}</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>
                  {["2026", "2025", "2024", "2023", "2022"].map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("label.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {["National Exam", "Mocks", "Notes", "Revision", "Books"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full gap-2">
          <Upload className="h-4 w-4" />
          {t("action.upload")} ({files.length} files)
        </Button>
      </form>
    </div>
  );
};

export default UploadPage;
