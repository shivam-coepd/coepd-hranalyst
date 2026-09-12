# RBAC and Security

The application recognizes five roles: Super Admin, Placement Admin, Placement HR, Client HR, and Student. Authentication alone is insufficient; protected access also requires an approved, active account.

Super Admin and Placement Admin manage platform-wide records. Placement HR sees jobs assigned to that user and related candidates, CVs, interviews, offers, and placements. Client HR is restricted to jobs and candidates for linked companies. Students can access their own profile, CVs, applications, interviews, offers, and placement records.

Route handlers use server guards before parsing or performing privileged work. Repositories using the service-role client reproduce the same role, tenant, assignment, and ownership checks explicitly. RLS policies remain the final database boundary and are directly probed by `stage17_tenant_isolation.sql`.

Privileged database functions use `SECURITY DEFINER` only where required, set a controlled `search_path`, and validate the caller. Private Storage objects are exposed through short-lived signed URLs. API failures use request IDs and mask internal details for 5xx responses. Login and sensitive endpoints have rate-limit support.
