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

  if (
    parsed.role === "admin" &&
    !admin.roles.includes("super_admin")
  ) {
    throw new Error(
      "Only a Super Admin can create another Admin account",
    );
  }

  /*
   * --------------------------------------------------------
   * 4. Resolve role
   *
   * Do this before Auth creation so we don't create an Auth
   * user for an invalid application role.
   * --------------------------------------------------------
   */

  const {
    data: role,
    error: roleError,
  } = await supabaseAdmin
    .from("roles")
    .select("id")
    .eq("name", parsed.role)
    .maybeSingle();

  if (roleError) {
    throw new Error(
      `Unable to retrieve role: ${roleError.message}`,
    );
  }

  if (!role) {
    throw new Error(
      `Role "${parsed.role}" was not found`,
    );
  }

  /*
   * --------------------------------------------------------
   * 5. Student-specific validation
   * --------------------------------------------------------
   */

  let verifiedStudent: VerifiedStudent = null;

  if (parsed.role === "student") {
    verifiedStudent =
      await verifyExistingHRAnalystStudent(
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

    if (
      verifiedEmail &&
      verifiedEmail !== parsed.email
    ) {
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
    const {
      data: company,
      error: companyError,
    } = await supabaseAdmin
      .from("companies")
      .select(
        "id, domain, verification_status, is_active, deleted_at",
      )
      .eq("id", parsed.companyId!)
      .maybeSingle();

    if (companyError) {
      throw new Error(
        `Unable to validate company: ${companyError.message}`,
      );
    }

    if (!company) {
      throw new Error(
        "Selected company was not found",
      );
    }

    if (company.deleted_at) {
      throw new Error(
        "Selected company is deleted",
      );
    }

    if (!company.is_active) {
      throw new Error(
        "Selected company is inactive",
      );
    }

    if (
      company.verification_status !== "verified"
    ) {
      throw new Error(
        "Client HR can only be created for a verified company",
      );
    }

    if (company.domain) {
      const companyDomain = company.domain
        .trim()
        .toLowerCase();

      const userDomain =
        getEmailDomain(parsed.email);

      if (
        !userDomain ||
        userDomain !== companyDomain
      ) {
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

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!appUrl) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not configured",
    );
  }

  /*
   * --------------------------------------------------------
   * 8. Create Supabase Auth invitation
   * --------------------------------------------------------
   */

  const {
    data: authData,
    error: authError,
  } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(
      parsed.email,
      {
        data: {
          first_name: parsed.firstName,
          last_name: parsed.lastName,
          phone: parsed.phone || null,
        },

        redirectTo: `${appUrl}/reset-password`,
      },
    );

  if (authError) {
    throw new Error(
      authError.message ||
        "Unable to create user invitation",
    );
  }

  if (!authData?.user) {
    throw new Error(
      "Supabase did not return the created user",
    );
  }

  const userId = authData.user.id;

  /*
   * --------------------------------------------------------
   * 9. Prepare RPC data
   * --------------------------------------------------------
   */

  const enrollmentId =
    parsed.role === "student"
      ? parsed.enrollmentId!
      : null;

  const verificationReference =
    parsed.role === "student"
      ? verifiedStudent?.enrollmentId ??
        parsed.enrollmentId!
      : null;

  const companyId =
    parsed.role === "client_hr"
      ? parsed.companyId!
      : null;

  const workEmail =
    parsed.role === "placement_hr" ||
    parsed.role === "client_hr"
      ? parsed.email
      : null;

  /*
   * --------------------------------------------------------
   * 10. Database transaction
   * --------------------------------------------------------
   */

  try {
    const {
      error: transactionError,
    } = await supabaseAdmin.rpc(
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

        p_verification_reference:
          verificationReference,

        p_verified_by:
          parsed.role === "student"
            ? admin.id
            : null,

        p_company_id: companyId,

        p_work_email: workEmail,
      },
    );

    if (transactionError) {
      throw new Error(
        transactionError.message,
      );
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
      await supabaseAdmin.auth.admin.deleteUser(
        userId,
      );
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



// Version 2 - from override codebase
// import "server-only";

// import { requireAdmin } from "@/lib/auth/guards";
// import { supabaseAdmin } from "@/lib/supabase/admin";
// import {
//   createUserSchema,
//   type CreateUserInput,
// } from "@/lib/validators/create-user.schema";
// import { writeAuditLog } from "@/services/audit/audit.service";
// import { verifyExistingHRAnalystStudent } from "@/services/students/student-verification.service";

// function emailDomain(email: string): string {
//   return email.split("@")[1]?.toLowerCase() ?? "";
// }

// export async function createUser(input: CreateUserInput) {
//   const admin = await requireAdmin();
//   const parsed = createUserSchema.parse(input);

//   if (parsed.role === "admin" && !admin.roles.includes("super_admin")) {
//     throw new Error("Only a Super Admin can create another Admin account");
//   }

//   let verifiedStudent: Awaited<
//     ReturnType<typeof verifyExistingHRAnalystStudent>
//   > = null;

//   if (parsed.role === "student") {
//     verifiedStudent = await verifyExistingHRAnalystStudent(
//       parsed.enrollmentId!,
//     );
//     if (!verifiedStudent) {
//       throw new Error(
//         "Only existing HRAnalyst students can be created in the placement platform",
//       );
//     }
//     if (verifiedStudent.email && verifiedStudent.email !== parsed.email) {
//       throw new Error(
//         "Enrollment ID does not match the supplied student email",
//       );
//     }
//   }

//   if (parsed.role === "client_hr") {
//     const { data: company, error } = await supabaseAdmin
//       .from("companies")
//       .select("id,domain,verification_status,is_active,deleted_at")
//       .eq("id", parsed.companyId!)
//       .single();

//     if (error || !company || company.deleted_at || !company.is_active) {
//       throw new Error("Selected company is not available");
//     }
//     if (company.verification_status !== "verified") {
//       throw new Error("Client HR can only be created for a verified company");
//     }
//     if (
//       company.domain &&
//       emailDomain(parsed.email) !== company.domain.toLowerCase()
//     ) {
//       throw new Error(
//         "Client HR email domain must match the verified company domain",
//       );
//     }
//   }

//   const appUrl = process.env.NEXT_PUBLIC_APP_URL;
//   if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured");

//   const { data: authData, error: authError } =
//     await supabaseAdmin.auth.admin.inviteUserByEmail(parsed.email, {
//       data: {
//         first_name: parsed.firstName,
//         last_name: parsed.lastName,
//         phone: parsed.phone || null,
//       },
//       redirectTo: `${appUrl}/reset-password`,
//     });

//   if (authError || !authData.user) {
//     throw new Error(authError?.message ?? "Unable to create user invitation");
//   }

//   const userId = authData.user.id;

//   try {
//     const { error: profileError } = await supabaseAdmin
//       .from("profiles")
//       .update({
//         first_name: parsed.firstName,
//         last_name: parsed.lastName,
//         phone: parsed.phone || null,
//       })
//       .eq("id", userId);
//     if (profileError) throw profileError;

//     const { data: role, error: roleError } = await supabaseAdmin
//       .from("roles")
//       .select("id")
//       .eq("name", parsed.role)
//       .single();
//     if (roleError || !role) throw new Error("Requested role was not found");

//     const { error: assignmentError } = await supabaseAdmin
//       .from("user_roles")
//       .insert({
//         user_id: userId,
//         role_id: role.id,
//         assigned_by: admin.id,
//       });
//     if (assignmentError) throw assignmentError;

//     if (parsed.role === "student") {
//       const { error } = await supabaseAdmin.from("student_profiles").insert({
//         user_id: userId,
//         enrollment_id: parsed.enrollmentId!,
//         verification_status: "verified",
//         verification_source: "hranalyst_api",
//         verification_reference:
//           verifiedStudent?.enrollmentId ?? parsed.enrollmentId!,
//         verification_at: new Date().toISOString(),
//         verified_by: admin.id,
//         first_name: parsed.firstName,
//         last_name: parsed.lastName,
//         phone: parsed.phone || null,
//       });
//       if (error) throw error;
//     }

//     if (parsed.role === "placement_hr") {
//       const { error } = await supabaseAdmin
//         .from("placement_hr_profiles")
//         .insert({
//           user_id: userId,
//           work_email: parsed.email,
//         });
//       if (error) throw error;
//     }

//     if (parsed.role === "client_hr") {
//       const { error } = await supabaseAdmin.from("client_hr_profiles").insert({
//         user_id: userId,
//         company_id: parsed.companyId!,
//         work_email: parsed.email,
//       });
//       if (error) throw error;
//     }

//     await writeAuditLog({
//       actorUserId: admin.id,
//       entityType: "user",
//       entityId: userId,
//       action: "USER_CREATED",
//       newData: {
//         email: parsed.email,
//         role: parsed.role,
//         enrollment_id:
//           parsed.role === "student" ? parsed.enrollmentId : undefined,
//         company_id: parsed.role === "client_hr" ? parsed.companyId : undefined,
//       },
//     });

//     return { success: true as const, userId };
//   } catch (error) {
//     await supabaseAdmin.auth.admin.deleteUser(userId);
//     throw error;
//   }
// }



// Version 1 - from current codebase

// import { supabaseAdmin } from "@/lib/supabase/admin";
// import { requireAdmin } from "@/lib/auth/guards";

// interface CreateUserInput {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone?: string;

//   role:
//     | "admin"
//     | "placement_hr"
//     | "client_hr"
//     | "student";

//   enrollmentId?: string;
//   companyId?: string;
// }

// export async function createUser(
//   input: CreateUserInput
// ) {
//   const admin = await requireAdmin();

//   const {
//     data: authData,
//     error: authError,
//   } = await supabaseAdmin.auth.admin.createUser({
//     email: input.email,

//     email_confirm: true,

//     user_metadata: {
//       first_name: input.firstName,
//       last_name: input.lastName,
//       phone: input.phone,
//     },
//   });

//   if (authError || !authData.user) {
//     throw new Error(
//       authError?.message ??
//       "Unable to create user"
//     );
//   }

//   const userId = authData.user.id;

//   try {

//     const { data: role } =
//       await supabaseAdmin
//         .from("roles")
//         .select("id")
//         .eq("name", input.role)
//         .single();

//     if (!role) {
//       throw new Error("Role not found");
//     }

//     await supabaseAdmin
//       .from("user_roles")
//       .insert({
//         user_id: userId,
//         role_id: role.id,
//         assigned_by: admin.id,
//       });

//     if (input.role === "student") {

//       if (!input.enrollmentId) {
//         throw new Error(
//           "Enrollment ID is required"
//         );
//       }

//       await supabaseAdmin
//         .from("student_profiles")
//         .insert({
//           user_id: userId,
//           enrollment_id: input.enrollmentId,
//           verification_status: "pending",
//           first_name: input.firstName,
//           last_name: input.lastName,
//           phone: input.phone,
//         });

//     }

//     if (input.role === "placement_hr") {

//       await supabaseAdmin
//         .from("placement_hr_profiles")
//         .insert({
//           user_id: userId,
//         });

//     }

//     if (input.role === "client_hr") {

//       if (!input.companyId) {
//         throw new Error(
//           "Company is required for Client HR"
//         );
//       }

//       await supabaseAdmin
//         .from("client_hr_profiles")
//         .insert({
//           user_id: userId,
//           company_id: input.companyId,
//         });

//     }

//     await supabaseAdmin
//       .from("audit_logs")
//       .insert({
//         actor_user_id: admin.id,

//         entity_type: "user",

//         entity_id: userId,

//         action: "USER_CREATED",

//         new_data: {
//           email: input.email,
//           role: input.role,
//         },
//       });

//     return {
//       success: true,
//       userId,
//     };

//   } catch (error) {

//     await supabaseAdmin.auth.admin.deleteUser(
//       userId
//     );

//     throw error;
//   }
// }