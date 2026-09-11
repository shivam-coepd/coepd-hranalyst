import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  queueNotification,
} from "@/services/notifications/queue.service";

async function
getAdminUsers() {

  const {
    data,
  } =
    await supabaseAdmin
      .from("user_roles")
      .select(`
        user_id,

        roles!inner (
          name
        )
      `)
      .in(
        "roles.name",
        [
          "admin",
          "super_admin",
        ]
      );

  return (
    data ?? []
  ).map(
    row =>
      row.user_id
  );
}

export async function
enqueueFeedbackReminders() {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "analytics_feedback_sla"
      )
      .select(`
        interview_id,
        application_id,
        company_id,
        completed_at,
        feedback_due_at,
        sla_status,
        elapsed_hours
      `)
      .in(
        "sla_status",
        [
          "pending",
          "overdue",
          "escalation",
        ]
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  const adminUsers =
    await getAdminUsers();

  let queued = 0;

  for (
    const row
    of data ?? []
  ) {

    if (
      row.sla_status ===
      "pending"
      &&
      Number(
        row.elapsed_hours
      ) < 20
    ) {
      continue;
    }

    const {
      data:
        clientHrs,
    } =
      await supabaseAdmin
        .from(
          "client_hr_profiles"
        )
        .select(
          "user_id"
        )
        .eq(
          "company_id",
          row.company_id
        )
        .eq(
          "is_active",
          true
        );

    if (
      row.sla_status ===
        "pending"
      ||
      row.sla_status ===
        "overdue"
    ) {

      const eventType =
        row.sla_status ===
          "pending"
          ? "FEEDBACK_DUE"
          : "FEEDBACK_OVERDUE";

      for (
        const client
        of clientHrs ?? []
      ) {

        await queueNotification({
          eventType,

          channel:
            "in_app",

          recipientUserId:
            client.user_id,

          entityType:
            "interview",

          entityId:
            row.interview_id,

          payload: {
            interview_id:
              row.interview_id,
          },

          dedupeKey:
            `${eventType}:${row.interview_id}:${client.user_id}`,
        });

        await queueNotification({
          eventType,

          channel:
            "email",

          recipientUserId:
            client.user_id,

          entityType:
            "interview",

          entityId:
            row.interview_id,

          payload: {
            interview_id:
              row.interview_id,
          },

          dedupeKey:
            `${eventType}:${row.interview_id}:${client.user_id}:email`,
        });

        queued += 2;
      }
    }

    if (
      row.sla_status ===
      "escalation"
    ) {

      await supabaseAdmin
        .from(
          "operational_alerts"
        )
        .upsert(
          {
            alert_type:
              "client_feedback_48h",

            entity_type:
              "interview",

            entity_id:
              row.interview_id,

            severity:
              "critical",

            title:
              "Client feedback pending over 48 hours",

            description:
              "Admin follow-up with the client is required.",
          },
          {
            onConflict:
              "alert_type,entity_type,entity_id",

            ignoreDuplicates:
              true,
          }
        );

      for (
        const adminId
        of adminUsers
      ) {

        await queueNotification({
          eventType:
            "FEEDBACK_ESCALATION",

          channel:
            "in_app",

          recipientUserId:
            adminId,

          entityType:
            "interview",

          entityId:
            row.interview_id,

          payload: {
            interview_id:
              row.interview_id,
            company_id:
              row.company_id,
          },

          dedupeKey:
            `FEEDBACK_ESCALATION:${row.interview_id}:${adminId}`,
        });

        await queueNotification({
          eventType:
            "FEEDBACK_ESCALATION",

          channel:
            "email",

          recipientUserId:
            adminId,

          entityType:
            "interview",

          entityId:
            row.interview_id,

          payload: {
            interview_id:
              row.interview_id,
            company_id:
              row.company_id,
          },

          dedupeKey:
            `FEEDBACK_ESCALATION:${row.interview_id}:${adminId}:email`,
        });

        queued += 2;
      }
    }
  }

  return queued;
}

export async function
enqueueInterviewReminders() {

  const now =
    new Date();

  const upper =
    new Date(
      now.getTime()
      +
      24 * 60 * 60 * 1000
    );

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("interviews")
      .select(`
        id,
        application_id,
        scheduled_at,
        timezone,
        round_name,

        applications!inner (
          student_id,

          student_profiles!inner (
            user_id
          )
        )
      `)
      .in(
        "status",
        [
          "scheduled",
          "confirmed",
          "rescheduled",
        ]
      )
      .gte(
        "scheduled_at",
        now.toISOString()
      )
      .lte(
        "scheduled_at",
        upper.toISOString()
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  let queued = 0;

  for (
    const interview
    of data ?? []
  ) {

    const application =
      Array.isArray(
        interview.applications
      )
        ? interview
            .applications[0]
        : interview
            .applications;

    const student =
      Array.isArray(
        application
          ?.student_profiles
      )
        ? application
            ?.student_profiles[0]
        : application
            ?.student_profiles;

    if (!student?.user_id) {
      continue;
    }

    const scheduled =
      new Date(
        interview.scheduled_at
      );

    const hours =
      (
        scheduled.getTime()
        -
        now.getTime()
      )
      /
      3600000;

    const reminderKey =
      hours <= 2
        ? "2h"
        : "24h";

    await queueNotification({
      eventType:
        "CLIENT_INTERVIEW_REMINDER",

      channel:
        "in_app",

      recipientUserId:
        student.user_id,

      entityType:
        "interview",

      entityId:
        interview.id,

      payload: {
        interview_id:
          interview.id,

        round_name:
          interview.round_name,

        scheduled_at:
          interview.scheduled_at,

        timezone:
          interview.timezone,
      },

      dedupeKey:
        `CLIENT_INTERVIEW_REMINDER:${interview.id}:${reminderKey}:inapp`,
    });

    await queueNotification({
      eventType:
        "CLIENT_INTERVIEW_REMINDER",

      channel:
        "email",

      recipientUserId:
        student.user_id,

      entityType:
        "interview",

      entityId:
        interview.id,

      payload: {
        interview_id:
          interview.id,

        round_name:
          interview.round_name,

        scheduled_at:
          interview.scheduled_at,

        timezone:
          interview.timezone,
      },

      dedupeKey:
        `CLIENT_INTERVIEW_REMINDER:${interview.id}:${reminderKey}:email`,
    });

    queued += 2;
  }

  return queued;
}

export async function
enqueueOfferExpiryReminders() {

  const today =
    new Date();

  const target =
    new Date(
      today.getTime()
      +
      2 * 24 * 60 * 60 * 1000
    );

  const targetDate =
    target
      .toISOString()
      .slice(
        0,
        10
      );

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from("offers")
      .select(`
        id,
        student_id,
        designation,
        offer_valid_until,

        student_profiles!inner (
          user_id
        )
      `)
      .eq(
        "status",
        "sent_to_student"
      )
      .eq(
        "offer_valid_until",
        targetDate
      );

  if (error) {
    throw new Error(
      error.message
    );
  }

  let queued = 0;

  for (
    const offer
    of data ?? []
  ) {

    const student =
      Array.isArray(
        offer.student_profiles
      )
        ? offer
            .student_profiles[0]
        : offer
            .student_profiles;

    if (!student?.user_id) {
      continue;
    }

    await queueNotification({
      eventType:
        "OFFER_EXPIRING",

      channel:
        "in_app",

      recipientUserId:
        student.user_id,

      entityType:
        "offer",

      entityId:
        offer.id,

      payload: {
        offer_id:
          offer.id,

        designation:
          offer.designation,

        message:
          `Your offer expires on ${offer.offer_valid_until}.`,
      },

      dedupeKey:
        `OFFER_EXPIRING:${offer.id}:inapp`,
    });

    await queueNotification({
      eventType:
        "OFFER_EXPIRING",

      channel:
        "email",

      recipientUserId:
        student.user_id,

      entityType:
        "offer",

      entityId:
        offer.id,

      payload: {
        offer_id:
          offer.id,

        designation:
          offer.designation,

        message:
          `Your offer expires on ${offer.offer_valid_until}.`,
      },

      dedupeKey:
        `OFFER_EXPIRING:${offer.id}:email`,
    });

    queued += 2;
  }

  return queued;
}