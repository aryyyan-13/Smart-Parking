-- Create a trigger on auth.users to automatically create a row in public.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    auth_id, 
    email, 
    name, 
    status, 
    created_at, 
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'ACTIVE',
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists (useful for reruns)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger on the auth schema
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
