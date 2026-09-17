import "server-only";

export interface ExternalStudentRecord {
  enrollmentId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}

export async function verifyExistingHRAnalystStudent(
  enrollmentId: string,
): Promise<ExternalStudentRecord | null> {
  const endpoint = process.env.HRANALYST_STUDENT_VERIFY_URL;
  const token = process.env.HRANALYST_STUDENT_VERIFY_TOKEN;

  if (!endpoint) {
    throw new Error(
      "HRAnalyst student verification is not configured. Set HRANALYST_STUDENT_VERIFY_URL before creating student accounts.",
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ enrollment_id: enrollmentId }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `HRAnalyst verification service returned HTTP ${response.status}`,
    );
  }

  const payload: unknown = await response.json();

  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid HRAnalyst verification response");
  }

  const record = payload as {
    exists?: unknown;
    student?: {
      enrollment_id?: unknown;
      first_name?: unknown;
      last_name?: unknown;
      email?: unknown;
    };
  };

  if (record.exists !== true) return null;

  const returnedEnrollment =
    typeof record.student?.enrollment_id === "string"
      ? record.student.enrollment_id
      : enrollmentId;

  return {
    enrollmentId: returnedEnrollment,
    firstName:
      typeof record.student?.first_name === "string"
        ? record.student.first_name
        : null,
    lastName:
      typeof record.student?.last_name === "string"
        ? record.student.last_name
        : null,
    email:
      typeof record.student?.email === "string"
        ? record.student.email.toLowerCase()
        : null,
  };
}
