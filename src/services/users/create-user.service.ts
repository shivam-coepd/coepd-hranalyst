import "server-only";
import { requireAdmin } from "@/lib/auth/guards";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  createUserSchema,
  type CreateUserInput,
} from "@/lib/validators/create-user.schema";

type CreateUserResult = {
  success: true;
  userId: string;
};

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
   * 5. Student-specific validation and ID generation
   * --------------------------------------------------------
   */
  let generatedEnrollmentId: string | null = null;
  if (parsed.role === "student") {
    if (!parsed.location || !parsed.batchDate) {
      throw new Error("Location and Batch Date are required for students");
    }

    const date = new Date(parsed.batchDate);
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    const prefix = `${yy}${parsed.location}${dd}${mm}`; // e.g. 26PU0406
    const searchPrefix = `${yy}__${dd}${mm}`; // Wildcard for location

    // Find all existing serials for this batch date across all locations
    const { data: students, error: studentsError } = await supabaseAdmin
      .from("student_profiles")
      .select("enrollment_id")
      .like("enrollment_id", `${searchPrefix}%`);

    if (studentsError) {
      throw new Error(`Failed to generate enrollment ID: ${studentsError.message}`);
    }

    let nextSerial = 1;
    if (students && students.length > 0) {
      let maxSerial = 0;
      for (const student of students) {
        if (student.enrollment_id && student.enrollment_id.length >= 11) {
          const serialStr = student.enrollment_id.slice(-3);
          const parsedSerial = parseInt(serialStr, 10);
          if (!isNaN(parsedSerial) && parsedSerial > maxSerial) {
            maxSerial = parsedSerial;
          }
        }
      }
      nextSerial = maxSerial + 1;
    }
    
    generatedEnrollmentId = `${prefix}${nextSerial.toString().padStart(3, "0")}`;
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
   * 8. Create Supabase Auth User
   * --------------------------------------------------------
   */
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true,
      user_metadata: {
        first_name: parsed.firstName,
        last_name: parsed.lastName,
        phone: parsed.phone || null,
      },
    });
  if (authError) {
    throw new Error(authError.message || "Unable to create user");
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
  const enrollmentId = generatedEnrollmentId;
  const verificationReference = null; // Removed external verification logic
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
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      first_name: parsed.firstName,
      last_name: parsed.lastName,
      email: parsed.email,
      phone: parsed.phone || null,
    });
    if (profileError) throw new Error(`Profile creation failed: ${profileError.message}`);

    const { error: userRoleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: userId,
      role_id: role.id,
      assigned_by: admin.id,
    });
    if (userRoleError) throw new Error(`User role creation failed: ${userRoleError.message}`);

    if (parsed.role === "student") {
      const { error: studentProfileError } = await supabaseAdmin.from("student_profiles").insert({
        user_id: userId,
        enrollment_id: enrollmentId!,
        verification_status: "verified",
        // @ts-ignore: the live database uses verified_at instead of verification_at
        verified_at: new Date().toISOString(),
      } as any);
      if (studentProfileError) throw new Error(`Student profile creation failed: ${studentProfileError.message}`);
    } else if (parsed.role === "client_hr") {
      const { error: clientHrError } = await supabaseAdmin.from("client_hr_profiles").insert({
        user_id: userId,
        company_id: companyId!,
        work_email: workEmail,
      });
      if (clientHrError) throw new Error(`Client HR profile creation failed: ${clientHrError.message}`);
    } else if (parsed.role === "placement_hr") {
      const { error: placementHrError } = await supabaseAdmin.from("placement_hr_profiles").insert({
        user_id: userId,
        work_email: workEmail,
      });
      if (placementHrError) throw new Error(`Placement HR profile creation failed: ${placementHrError.message}`);
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
