import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface LookupItem {
  id: string;
  name: string;
}

export function useLookups() {
  const [subjects, setSubjects] = useState<LookupItem[]>([]);
  const [categories, setCategories] = useState<LookupItem[]>([]);
  const [years, setYears] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [s, c, y] = await Promise.all([
      supabase.from("subjects").select("id, name").order("name"),
      supabase.from("categories").select("id, name").order("name"),
      supabase.from("years").select("id, name").order("name", { ascending: false }),
    ]);
    setSubjects(s.data ?? []);
    setCategories(c.data ?? []);
    setYears(y.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  return { subjects, categories, years, loading, refetch: fetchAll };
}
