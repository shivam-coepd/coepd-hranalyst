import "server-only";

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsUtc(value: Date) {
  return value
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

export interface CalendarInviteInput {
  uid: string;
  title: string;
  description: string;
  startAt: Date;
  durationMinutes: number;
  location?: string | null;
  meetingLink?: string | null;
  organizerEmail?: string | null;
}

export function generateInterviewIcs(input: CalendarInviteInput) {
  const endAt = new Date(
    input.startAt.getTime() + input.durationMinutes * 60_000,
  );

  const location = input.location ?? input.meetingLink ?? "";

  const descriptionParts = [
    input.description,

    input.meetingLink ? `Meeting: ${input.meetingLink}` : "",
  ].filter(Boolean);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HRAnalyst//Placement Wing//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(input.uid)}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(input.startAt)}`,
    `DTEND:${toIcsUtc(endAt)}`,
    `SUMMARY:${escapeIcsText(input.title)}`,
    `DESCRIPTION:${escapeIcsText(descriptionParts.join("\n\n"))}`,
    `LOCATION:${escapeIcsText(location)}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
