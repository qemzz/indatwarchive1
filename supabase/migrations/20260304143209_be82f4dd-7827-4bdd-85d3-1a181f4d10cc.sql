-- Fix signup trigger role assignment to use the app_role enum correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE
      WHEN NEW.email = 'dos@school.com' THEN 'dos'::public.app_role
      ELSE 'teacher'::public.app_role
    END
  );
  RETURN NEW;
END;
$function$;