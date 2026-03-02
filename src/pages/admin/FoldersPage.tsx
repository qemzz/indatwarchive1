import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FolderTree, Folder, Plus, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface FolderNode {
  id: string;
  name: string;
  children: FolderNode[];
}

const initialFolders: FolderNode[] = [
  {
    id: "1",
    name: "2025",
    children: [
      {
        id: "1a",
        name: "S6",
        children: [
          { id: "1a1", name: "Mathematics", children: [
            { id: "1a1a", name: "National Exam", children: [] },
            { id: "1a1b", name: "Mocks", children: [] },
          ]},
          { id: "1a2", name: "Physics", children: [] },
        ],
      },
      { id: "1b", name: "S5", children: [] },
    ],
  },
  {
    id: "2",
    name: "2024",
    children: [
      { id: "2a", name: "S6", children: [] },
      { id: "2b", name: "S4", children: [] },
    ],
  },
];

const FolderItem = ({
  folder,
  depth = 0,
  onAdd,
  onRename,
  onDelete,
}: {
  folder: FolderNode;
  depth?: number;
  onAdd: (parentId: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [open, setOpen] = useState(depth < 2);

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1.5 px-2 rounded-md hover:bg-muted/50 group cursor-pointer"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        <button onClick={() => setOpen(!open)} className="shrink-0">
          <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
        <Folder className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm flex-1">{folder.name}</span>
        <div className="hidden group-hover:flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdd(folder.id)}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRename(folder.id, folder.name)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={() => onDelete(folder.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {open &&
        folder.children.map((child) => (
          <FolderItem key={child.id} folder={child} depth={depth + 1} onAdd={onAdd} onRename={onRename} onDelete={onDelete} />
        ))}
    </div>
  );
};

const FoldersPage = () => {
  const { t } = useI18n();
  const [folders, setFolders] = useState(initialFolders);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const handleAdd = (parentId: string) => {
    setDialogOpen(true);
  };

  const handleCreate = () => {
    if (!newFolderName.trim()) return;
    toast.success(`Folder "${newFolderName}" created`);
    setNewFolderName("");
    setDialogOpen(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">{t("nav.folders")}</h1>
          <p className="text-muted-foreground text-sm">Manage directory structure</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          New Root Folder
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          {folders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              onAdd={handleAdd}
              onRename={(id, name) => toast.info(`Rename: ${name}`)}
              onDelete={(id) => toast.error("Folder moved to recycle bin")}
            />
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("action.cancel")}</Button>
            <Button onClick={handleCreate}>{t("action.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoldersPage;
