import "server-only";
import { requireAdmin } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  createUserSchema,
  type CreateUserInput,
} from "@/lib/validators/create-user.schema";
import { verifyExistingHRAnalystStudent } from "@/services/students/student-verification.service";
type CreateUserResult = {
  success: true;
  userId: string;
};
type VerifiedStudent = Awaited<
  ReturnType<typeof verifyExistingHRAnalystStudent>
>;
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
function getEmailDomain(email: string): string {
  const atIndex = email.lastIndexOf("@");
  if (atIndex === -1) {
    return "";
  }
  return email
    .slice(atIndex + 1)
    .trim()
    .toLowerCase();
}
export async function createUser(
  input: CreateUserInput,
): Promise<CreateUserResult> {
  /*
   * --------------------------------------------------------
   * 1. Authenticate administrator
   * --------------------------------------------------------
   */
  const admin = await requireAdmin();
  /*
   * --------------------------------------------------------
   * 2. Validate input
   * --------------------------------------------------------
   */
  const parsed = createUserSchema.parse({
    ...input,
    email: normalizeEmail(input.email),
  });
  /*
   * --------------------------------------------------------
   * 3. Authorization
   * --------------------------------------------------------
   */
  if (parsed.role === "admin" && !admin.roles.includes("super_admin")) {
    throw new Error("Only a Super Admin can create another Admin account");
  }
  /*
   * --------------------------------------------------------
   * 4. Resolve role
   *
   * Do this before Auth creation so we don't create an Auth
   * user for an invalid application role.
   * --------------------------------------------------------
   */
  const { data: role, error: roleError } = await supabaseAdmin
    .from("roles")
    .select("id")
    .eq("name", parsed.role)
    .maybeSingle();
  if (roleError) {
    throw new Error(`Unable to retrieve role: ${roleError.message}`);
  }
  if (!role) {
    throw new Error(`Role "${parsed.role}" was not found`);
  }
  /*
   * --------------------------------------------------------
   * 5. Student-specific validation
   * --------------------------------------------------------
   */
  let verifiedStudent: VerifiedStudent = null;
  if (parsed.role === "student") {
    verifiedStudent = await verifyExistingHRAnalystStudent(
      parsed.enrollmentId!,
    );
    if (!verifiedStudent) {
      throw new Error(
        "Only existing HRAnalyst students can be created in the placement platform",
      );
    }
    const verifiedEmail = verifiedStudent.email
      ? normalizeEmail(verifiedStudent.email)
      : null;
    if (verifiedEmail && verifiedEmail !== parsed.email) {
      throw new Error(
        "Enrollment ID does not match the supplied student email",
      );
    }
  }
  /*
   * --------------------------------------------------------
   * 6. Client HR company validation
   * --------------------------------------------------------
   */
  if (parsed.role === "client_hr") {
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("id, domain, verification_status, is_active, deleted_at")
      .eq("id", parsed.companyId!)
      .maybeSingle();
    if (companyError) {
      throw new Error(`Unable to validate company: ${companyError.message}`);
    }
    if (!company) {
      throw new Error("Selected company was not found");
    }
    if (company.deleted_at) {
      throw new Error("Selected company is deleted");
    }
    if (!company.is_active) {
      throw new Error("Selected company is inactive");
    }
    if (company.verification_status !== "verified") {
      throw new Error("Client HR can only be created for a verified company");
    }
    if (company.domain) {
      const companyDomain = company.domain.trim().toLowerCase();
      const userDomain = getEmailDomain(parsed.email);
      if (!userDomain || userDomain !== companyDomain) {
        throw new Error(
          "Client HR email domain must match the verified company domain",
        );
      }
    }
  }
  /*
   * --------------------------------------------------------
   * 7. Application URL
   * --------------------------------------------------------
   */
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is not configured");
  }
  /*
   * --------------------------------------------------------
   * 8. Create Supabase Auth invitation
   * --------------------------------------------------------
   */
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(parsed.email, {
      data: {
        first_name: parsed.firstName,
        last_name: parsed.lastName,
        phone: parsed.phone || null,
      },
      redirectTo: `${appUrl}/reset-password`,
    });
  if (authError) {
    throw new Error(authError.message || "Unable to create user invitation");
  }
  if (!authData?.user) {
    throw new Error("Supabase did not return the created user");
  }
  const userId = authData.user.id;
  /*
   * --------------------------------------------------------
   * 9. Prepare RPC data
   * --------------------------------------------------------
   */
  const enrollmentId = parsed.role === "student" ? parsed.enrollmentId! : null;
  const verificationReference =
    parsed.role === "student"
      ? (verifiedStudent?.enrollmentId ?? parsed.enrollmentId!)
      : null;
  const companyId = parsed.role === "client_hr" ? parsed.companyId! : null;
  const workEmail =
    parsed.role === "placement_hr" || parsed.role === "client_hr"
      ? parsed.email
      : null;
  /*
   * --------------------------------------------------------
   * 10. Database transaction
   * --------------------------------------------------------
   */
  try {
    const { error: transactionError } = await supabaseAdmin.rpc(
      "create_platform_user",
      {
        p_user_id: userId,
        p_role_id: role.id,
        p_assigned_by: admin.id,
        p_first_name: parsed.firstName,
        p_last_name: parsed.lastName,
        p_phone: parsed.phone || null,
        p_email: parsed.email,
        p_role: parsed.role,
        p_enrollment_id: enrollmentId,
        p_verification_reference: verificationReference,
        p_verified_by: parsed.role === "student" ? admin.id : null,
        p_company_id: companyId ?? null,
        p_work_email: workEmail,
      },
    );
    if (transactionError) {
      throw new Error(transactionError.message);
    }
    /*
     * ------------------------------------------------------
     * 11. Success
     * ------------------------------------------------------
     */
    return {
      success: true,
      userId,
    };
  } catch (error) {
    /*
     * ------------------------------------------------------
     * 12. Auth cleanup
     *
     * Auth and PostgreSQL are separate systems, therefore
     * the Auth user must be manually cleaned up if the DB
     * transaction fails.
     * ------------------------------------------------------
     */
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId);
    } catch (cleanupError) {
      console.error(
        "Failed to cleanup Auth user after database transaction failure",
        {
          userId,
          cleanupError,
        },
      );
    }
    throw error;
  }
}
