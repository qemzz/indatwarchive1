import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Folder, Plus, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FolderRow {
  id: string;
  parent_id: string | null;
  name: string;
  created_at: string;
}

interface FolderNode extends FolderRow {
  children: FolderNode[];
}

function buildTree(rows: FolderRow[]): FolderNode[] {
  const map = new Map<string, FolderNode>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));
  const roots: FolderNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

const FolderItem = ({
  folder, depth = 0, onAdd, onRename, onDelete,
}: {
  folder: FolderNode; depth?: number;
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
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdd(folder.id)}><Plus className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRename(folder.id, folder.name)}><Pencil className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={() => onDelete(folder.id)}><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>
      {open && folder.children.map((child) => (
        <FolderItem key={child.id} folder={child} depth={depth + 1} onAdd={onAdd} onRename={onRename} onDelete={onDelete} />
      ))}
    </div>
  );
};

const FoldersPage = () => {
  const { t } = useI18n();
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [parentId, setParentId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  const fetchFolders = async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("id, parent_id, name, created_at")
      .is("deleted_at", null)
      .order("created_at");
    if (!error && data) setFolders(buildTree(data));
    setLoading(false);
  };

  useEffect(() => { fetchFolders(); }, []);

  const handleCreate = async () => {
    if (!newFolderName.trim()) return;
    const { error } = await supabase.from("folders").insert({
      name: newFolderName.trim(),
      parent_id: parentId,
    });
    if (error) return toast.error(error.message);
    toast.success(`Folder "${newFolderName}" created`);
    setNewFolderName("");
    setParentId(null);
    setDialogOpen(false);
    fetchFolders();
  };

  const handleRename = async () => {
    if (!renameId || !renameName.trim()) return;
    const { error } = await supabase.from("folders").update({ name: renameName.trim() }).eq("id", renameId);
    if (error) return toast.error(error.message);
    toast.success("Folder renamed");
    setRenameId(null);
    fetchFolders();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("folders").update({ deleted_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.error("Folder moved to recycle bin");
    fetchFolders();
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold">{t("nav.folders")}</h1>
          <p className="text-muted-foreground text-sm">Manage directory structure</p>
        </div>
        <Button onClick={() => { setParentId(null); setDialogOpen(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Root Folder
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
          ) : folders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No folders yet. Create one to get started.</p>
          ) : (
            folders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                onAdd={(pid) => { setParentId(pid); setDialogOpen(true); }}
                onRename={(id, name) => { setRenameId(id); setRenameName(name); }}
                onDelete={handleDelete}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Folder</DialogTitle></DialogHeader>
          <Input placeholder="Folder name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("action.cancel")}</Button>
            <Button onClick={handleCreate}>{t("action.create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename dialog */}
      <Dialog open={!!renameId} onOpenChange={() => setRenameId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename Folder</DialogTitle></DialogHeader>
          <Input value={renameName} onChange={(e) => setRenameName(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameId(null)}>{t("action.cancel")}</Button>
            <Button onClick={handleRename}>{t("action.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoldersPage;
