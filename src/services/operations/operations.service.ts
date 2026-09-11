import "server-only";

import {
  enqueueFeedbackReminders,
  enqueueInterviewReminders,
  enqueueOfferExpiryReminders,
} from "./reminder.service";

import { enqueueMissingCvReminders } from "./cv-reminder.service";

export async function runOperationalChecks() {
  const feedback = await enqueueFeedbackReminders();

  const interviews = await enqueueInterviewReminders();

  const offers = await enqueueOfferExpiryReminders();

  const cvReminders = await enqueueMissingCvReminders();

  return {
    feedbackNotifications: feedback,

    interviewNotifications: interviews,

    offerNotifications: offers,

    cvReminderNotifications: cvReminders,

    totalQueued: feedback + interviews + offers + cvReminders,
  };
}
