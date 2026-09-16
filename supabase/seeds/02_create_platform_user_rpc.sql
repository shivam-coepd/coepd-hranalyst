-- ============================================================
-- HRANALYST PLACEMENT WING - MISSING RPC FUNCTION
-- Creates the create_platform_user function required by 
-- the user creation service.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_platform_user(
  p_user_id uuid,
  p_role_id uuid,
  p_assigned_by uuid,
  p_first_name text,
  p_last_name text,
  p_phone text,
  p_email text,
  p_role text,
  p_enrollment_id text,
  p_verification_reference text,
  p_verified_by uuid,
  p_company_id uuid,
  p_work_email text
) RETURNS void AS $$
BEGIN
  -- 1. Ensure the profile is updated with the provided details
  -- (The auth trigger automatically creates the row upon user creation)
  UPDATE public.profiles
  SET 
    first_name = p_first_name,
    last_name = p_last_name,
    phone = p_phone,
    account_status = 'approved',
    approved_at = now()
  WHERE id = p_user_id;

  -- 2. Assign the requested role
  INSERT INTO public.user_roles (user_id, role_id, assigned_by)
  VALUES (p_user_id, p_role_id, p_assigned_by)
  ON CONFLICT (user_id, role_id) DO NOTHING;

  -- 3. Role-specific logic
  IF p_role = 'student' THEN
    -- Link the newly created auth user to their verified student profile
    UPDATE public.student_profiles
    SET 
      user_id = p_user_id,
      verification_status = 'verified',
      verified_by = p_verified_by,
      verification_at = now()
    WHERE lower(enrollment_id) = lower(p_enrollment_id);
    
  ELSIF p_role = 'client_hr' THEN
    -- Create the client HR profile linking them to the company
    INSERT INTO public.client_hr_profiles (user_id, company_id, work_email, is_primary_contact)
    VALUES (p_user_id, p_company_id, p_work_email, false)
    ON CONFLICT (user_id) DO UPDATE SET 
      company_id = EXCLUDED.company_id, 
      work_email = EXCLUDED.work_email;
  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reload schema cache to ensure API recognizes the function
NOTIFY pgrst, 'reload schema';
