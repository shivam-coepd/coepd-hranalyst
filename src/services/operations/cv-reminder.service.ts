import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  queueNotification,
} from "@/services/notifications/queue.service";


export async function
enqueueMissingCvReminders() {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "student_profiles"
      )
      .select(`
        id,
        user_id,

        student_cvs (
          id,
          is_primary,
          deleted_at
        )
      `)
      .eq(
        "verification_status",
        "verified"
      );


  if (error) {
    throw new Error(
      error.message
    );
  }


  let queued =
    0;


  for (
    const student
    of data ?? []
  ) {

    const cvs =
      Array.isArray(
        student.student_cvs
      )
        ? student.student_cvs
        : [];


    const hasPrimaryCv =
      cvs.some(
        cv =>
          cv.is_primary
          &&
          !cv.deleted_at
      );


    if (
      hasPrimaryCv
      ||
      !student.user_id
    ) {
      continue;
    }


    const dateKey =
      new Date()
        .toISOString()
        .slice(
          0,
          10
        );


    await queueNotification({

      eventType:
        "STUDENT_CV_REMINDER",

      channel:
        "in_app",

      recipientUserId:
        student.user_id,

      entityType:
        "student_profile",

      entityId:
        student.id,

      payload: {

        message:
          "Upload your latest CV to apply for placement opportunities.",

      },

      dedupeKey:
        `STUDENT_CV_REMINDER:${student.id}:${dateKey}:inapp`,

    });


    await queueNotification({

      eventType:
        "STUDENT_CV_REMINDER",

      channel:
        "email",

      recipientUserId:
        student.user_id,

      entityType:
        "student_profile",

      entityId:
        student.id,

      payload: {

        message:
          "Upload your latest CV to apply for placement opportunities.",

      },

      dedupeKey:
        `STUDENT_CV_REMINDER:${student.id}:${dateKey}:email`,

    });


    queued +=
      2;
  }


  return queued;
}