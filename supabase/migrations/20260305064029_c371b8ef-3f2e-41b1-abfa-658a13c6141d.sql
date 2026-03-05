
-- Subjects lookup table
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "DOS can manage subjects" ON public.subjects FOR ALL TO authenticated USING (public.is_dos()) WITH CHECK (public.is_dos());

-- Categories lookup table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "DOS can manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_dos()) WITH CHECK (public.is_dos());

-- Years lookup table
CREATE TABLE public.years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view years" ON public.years FOR SELECT USING (true);
CREATE POLICY "DOS can manage years" ON public.years FOR ALL TO authenticated USING (public.is_dos()) WITH CHECK (public.is_dos());

-- Seed initial data
INSERT INTO public.subjects (name) VALUES ('Mathematics'),('Physics'),('Chemistry'),('Biology'),('English'),('History'),('Geography'),('Economics');
INSERT INTO public.categories (name) VALUES ('National Exam'),('Mocks'),('Notes'),('Revision'),('Books');
INSERT INTO public.years (name) VALUES ('2026'),('2025'),('2024'),('2023'),('2022');
