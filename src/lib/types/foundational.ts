import type {
  AccountStatus,
} from "@/lib/constants/account-status";

import type {
  UserRole,
} from "@/lib/constants/roles";


export interface BaseTimestamps {

  created_at:
    string;

  updated_at:
    string;
}


export interface Profile
  extends BaseTimestamps {

  id:
    string;

  first_name:
    string | null;

  last_name:
    string | null;

  email:
    string;

  phone:
    string | null;

  avatar_url:
    string | null;

  account_status:
    AccountStatus;

  approved_at:
    string | null;

  approved_by:
    string | null;

  rejected_at:
    string | null;

  rejected_by:
    string | null;

  rejection_reason:
    string | null;

  suspended_at:
    string | null;

  suspended_by:
    string | null;

  suspension_reason:
    string | null;

  last_login_at:
    string | null;
}


export interface Role {

  id:
    string;

  name:
    UserRole;

  display_name:
    string;

  description:
    string | null;

  is_system:
    boolean;

  created_at:
    string;

  updated_at:
    string;
}


export interface Company
  extends BaseTimestamps {

  id:
    string;

  name:
    string;

  legal_name:
    string | null;

  code:
    string | null;

  domain:
    string | null;

  website:
    string | null;

  industry:
    string | null;

  size:
    string | null;

  registration_number:
    string | null;

  gst_number:
    string | null;

  linkedin_url:
    string | null;

  primary_email:
    string | null;

  primary_phone:
    string | null;

  address:
    string | null;

  city:
    string | null;

  state:
    string | null;

  country:
    string | null;

  postal_code:
    string | null;

  logo:
    string | null;

  verification_status:
    "pending"
    | "verified"
    | "rejected";

  verification_method:
    string | null;

  verification_notes:
    string | null;

  verified_at:
    string | null;

  verified_by:
    string | null;

  is_active:
    boolean;

  created_by:
    string | null;

  deleted_at:
    string | null;

  deleted_by:
    string | null;
}


export interface StudentProfile
  extends BaseTimestamps {

  id:
    string;

  user_id:
    string;

  enrollment_id:
    string;

  verification_status:
    "pending"
    | "verified"
    | "rejected";

  verification_source:
    string | null;

  verification_reference:
    string | null;

  verification_at:
    string | null;

  verified_by:
    string | null;

  verification_reason:
    string | null;

  first_name:
    string | null;

  last_name:
    string | null;

  phone:
    string | null;

  headline:
    string | null;

  summary:
    string | null;

  location:
    string | null;

  city:
    string | null;

  state:
    string | null;

  country:
    string | null;

  postal_code:
    string | null;

  qualification:
    string | null;

  graduation_year:
    number | null;

  specialization:
    string | null;

  total_experience_months:
    number;

  current_company:
    string | null;

  current_designation:
    string | null;

  current_ctc:
    number | null;

  current_ctc_currency:
    string | null;

  notice_period_days:
    number | null;

  preferred_role:
    string | null;

  preferred_location:
    string | null;

  willing_to_relocate:
    boolean | null;

  linkedin_url:
    string | null;

  github_url:
    string | null;

  portfolio_url:
    string | null;

  profile_completion:
    number;

  profile_status:
    "active"
    | "inactive"
    | "placed"
    | "archived";
}