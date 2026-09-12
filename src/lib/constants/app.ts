export const APP = {
  NAME: "HRAnalyst Placement Wing",

  DESCRIPTION:
    "Placement management platform for HRAnalyst students, Placement HR and Client HR.",

  DEFAULT_TIMEZONE: "Asia/Kolkata",

  DEFAULT_LOCALE: "en-IN",

  MAX_CV_FILE_SIZE: 10 * 1024 * 1024,

  MAX_OFFER_FILE_SIZE: 10 * 1024 * 1024,
} as const;

export const STORAGE_BUCKETS = {
  STUDENT_CVS: "student-cvs",

  OFFER_LETTERS: "offer-letters",

  SYSTEM_EXPORTS: "system-exports",

  COMPANY_LOGOS: "company-logos",

  PROFILE_IMAGES: "profile-images",

  JOB_ASSETS: "job-assets",
} as const;
