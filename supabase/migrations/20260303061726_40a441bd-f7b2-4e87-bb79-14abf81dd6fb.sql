
-- Role enum
CREATE TYPE public.app_role AS ENUM ('dos', 'teacher');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'teacher',
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Folders table (hierarchical)
CREATE TABLE public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Documents table
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  class_level TEXT,
  subject TEXT,
  year TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  deleted_at TIMESTAMPTZ,
  download_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Helper function: is_dos
CREATE OR REPLACE FUNCTION public.is_dos()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'dos'
  )
$$;

-- Helper function: update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON public.folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'teacher'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: profiles
CREATE POLICY "Anyone authenticated can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "System inserts profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS: folders
CREATE POLICY "Anyone can view non-deleted folders" ON public.folders FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "DOS can create folders" ON public.folders FOR INSERT TO authenticated WITH CHECK (public.is_dos());
CREATE POLICY "DOS can update folders" ON public.folders FOR UPDATE TO authenticated USING (public.is_dos());
CREATE POLICY "DOS can delete folders" ON public.folders FOR DELETE TO authenticated USING (public.is_dos());

-- RLS: documents
CREATE POLICY "Public can view approved docs" ON public.documents FOR SELECT USING (status = 'approved' AND deleted_at IS NULL);
CREATE POLICY "DOS can view all docs" ON public.documents FOR SELECT TO authenticated USING (public.is_dos());
CREATE POLICY "Teachers can view own docs" ON public.documents FOR SELECT TO authenticated USING (auth.uid() = uploaded_by);
CREATE POLICY "Authenticated users can upload docs" ON public.documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "DOS can update any doc" ON public.documents FOR UPDATE TO authenticated USING (public.is_dos());
CREATE POLICY "Teachers can update own pending docs" ON public.documents FOR UPDATE TO authenticated USING (auth.uid() = uploaded_by AND status = 'pending');
CREATE POLICY "DOS can delete any doc" ON public.documents FOR DELETE TO authenticated USING (public.is_dos());
CREATE POLICY "Teachers can delete own docs" ON public.documents FOR DELETE TO authenticated USING (auth.uid() = uploaded_by);

-- Storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Storage RLS
CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Anyone can view document files" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
CREATE POLICY "DOS can delete files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND public.is_dos());
