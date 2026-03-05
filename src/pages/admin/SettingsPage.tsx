import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useLookups } from "@/hooks/useLookups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, BookOpen, Tag, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SettingsPage = () => {
  const { t } = useI18n();
  const { subjects, categories, years, refetch } = useLookups();

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-1">Settings</h1>
      <p className="text-muted-foreground text-sm mb-6">Manage subjects, categories, and academic years</p>

      <div className="grid lg:grid-cols-3 gap-6">
        <LookupCard
          title="Subjects"
          icon={<BookOpen className="h-4 w-4" />}
          items={subjects}
          table="subjects"
          onUpdate={refetch}
        />
        <LookupCard
          title="Categories"
          icon={<Tag className="h-4 w-4" />}
          items={categories}
          table="categories"
          onUpdate={refetch}
        />
        <LookupCard
          title="Academic Years"
          icon={<Calendar className="h-4 w-4" />}
          items={years}
          table="years"
          onUpdate={refetch}
        />
      </div>
    </div>
  );
};

interface LookupCardProps {
  title: string;
  icon: React.ReactNode;
  items: { id: string; name: string }[];
  table: "subjects" | "categories" | "years";
  onUpdate: () => void;
}

const LookupCard = ({ title, icon, items, table, onUpdate }: LookupCardProps) => {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAdding(true);
    const { error } = await supabase.from(table).insert({ name: trimmed });
    if (error) {
      toast.error(error.message.includes("duplicate") ? `"${trimmed}" already exists` : error.message);
    } else {
      toast.success(`Added "${trimmed}"`);
      setNewName("");
      onUpdate();
    }
    setAdding(false);
  };

  const handleDelete = async (id: string, name: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Removed "${name}"`);
      onUpdate();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder={`Add ${title.toLowerCase()}...`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button size="icon" onClick={handleAdd} disabled={adding || !newName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 group">
              <span className="text-sm">{item.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                onClick={() => handleDelete(item.id, item.name)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No {title.toLowerCase()} yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;
