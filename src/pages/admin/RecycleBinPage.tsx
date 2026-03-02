import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, FileText, Folder } from "lucide-react";
import { toast } from "sonner";

const deletedItems = [
  { id: "1", name: "Old Biology Notes.pdf", type: "document", deletedAt: "2025-02-28", deletedBy: "Admin DOS" },
  { id: "2", name: "2023", type: "folder", deletedAt: "2025-02-25", deletedBy: "Admin DOS" },
  { id: "3", name: "Draft Chemistry Paper.pdf", type: "document", deletedAt: "2025-02-20", deletedBy: "Mr. Kamanzi" },
];

const RecycleBinPage = () => {
  const { t } = useI18n();

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-1">{t("nav.recycleBin")}</h1>
      <p className="text-muted-foreground text-sm mb-6">Restore or permanently delete items</p>

      <div className="space-y-3">
        {deletedItems.map((item) => (
          <Card key={item.id} className="animate-fade-in">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.type === "folder" ? (
                  <Folder className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Deleted {item.deletedAt} by {item.deletedBy}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">{item.type}</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Item restored")}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  {t("action.restore")}
                </Button>
                <Button variant="destructive" size="sm" className="gap-1.5" onClick={() => toast.error("Permanently deleted")}>
                  <Trash2 className="h-3.5 w-3.5" />
                  {t("action.delete")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecycleBinPage;
