-- Prevent teachers from self-approving documents on insert
CREATE OR REPLACE FUNCTION public.enforce_document_insert_workflow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only DOS users may create immediately approved documents
  IF public.is_dos() THEN
    IF NEW.status IS DISTINCT FROM 'approved' THEN
      NEW.status := 'approved';
    END IF;
    NEW.rejection_reason := NULL;
    NEW.approved_by := COALESCE(NEW.approved_by, auth.uid());
    NEW.approved_at := COALESCE(NEW.approved_at, now());
  ELSE
    NEW.status := 'pending';
    NEW.approved_by := NULL;
    NEW.approved_at := NULL;
    NEW.rejection_reason := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_document_insert_workflow ON public.documents;

CREATE TRIGGER enforce_document_insert_workflow
BEFORE INSERT ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.enforce_document_insert_workflow();