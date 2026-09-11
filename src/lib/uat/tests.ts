export interface UatTestDefinition {

  code:
    string;

  area:
    string;

  role:
    string;

  description:
    string;

  expected:
    string;
}


export const UAT_TESTS:
  UatTestDefinition[] =
[

  // ==========================================================
  // AUTH / USER MANAGEMENT
  // ==========================================================

  {
    code:
      "AUTH-001",

    area:
      "Authentication",

    role:
      "student",

    description:
      "Pending student attempts login",

    expected:
      "User is redirected to account-pending and cannot access Student Panel",
  },

  {
    code:
      "AUTH-002",

    area:
      "Authentication",

    role:
      "student",

    description:
      "Approved student logs in",

    expected:
      "Student dashboard opens successfully",
  },

  {
    code:
      "AUTH-003",

    area:
      "Authentication",

    role:
      "client_hr",

    description:
      "Approved Client HR logs in",

    expected:
      "Client dashboard opens successfully",
  },

  {
    code:
      "AUTH-004",

    area:
      "RBAC",

    role:
      "student",

    description:
      "Student attempts to access Admin URL",

    expected:
      "Access denied",
  },

  {
    code:
      "AUTH-005",

    area:
      "RBAC",

    role:
      "client_hr",

    description:
      "Client HR attempts to access Placement HR verification URL",

    expected:
      "Access denied",
  },

  {
    code:
      "AUTH-006",

    area:
      "User Management",

    role:
      "admin",

    description:
      "Admin approves existing HRAnalyst student enrollment",

    expected:
      "Student account moves Pending to Approved",
  },

  {
    code:
      "AUTH-007",

    area:
      "User Management",

    role:
      "admin",

    description:
      "Admin attempts to approve invalid enrollment ID",

    expected:
      "Approval is blocked",
  },


  // ==========================================================
  // COMPANY / CLIENT HR
  // ==========================================================

  {
    code:
      "COMP-001",

    area:
      "Companies",

    role:
      "admin",

    description:
      "Admin creates valid client company",

    expected:
      "Company record is created",
  },

  {
    code:
      "COMP-002",

    area:
      "Companies",

    role:
      "client_hr",

    description:
      "Client HR accesses candidate belonging to another company",

    expected:
      "Access denied",
  },


  // ==========================================================
  // JOB
  // ==========================================================

  {
    code:
      "JOB-001",

    area:
      "Jobs",

    role:
      "client_hr",

    description:
      "Client HR creates job",

    expected:
      "Job created in Draft state",
  },

  {
    code:
      "JOB-002",

    area:
      "Jobs",

    role:
      "client_hr",

    description:
      "Client HR attempts arbitrary company_id",

    expected:
      "Server uses authenticated Client HR company and ignores unauthorized company",
  },

  {
    code:
      "JOB-003",

    area:
      "Jobs",

    role:
      "placement_hr",

    description:
      "Placement HR moves complete JD to checklist",

    expected:
      "Job moves to Pending Checklist",
  },


  // ==========================================================
  // CHECKLIST
  // ==========================================================

  {
    code:
      "CHK-001",

    area:
      "Checklist",

    role:
      "placement_hr",

    description:
      "Placement HR generates AI checklist",

    expected:
      "Draft checklist is created",
  },

  {
    code:
      "CHK-002",

    area:
      "Checklist",

    role:
      "placement_hr",

    description:
      "Placement HR reviews and approves checklist",

    expected:
      "Approved checklist is created with audit metadata",
  },

  {
    code:
      "CHK-003",

    area:
      "Publishing",

    role:
      "placement_hr",

    description:
      "Placement HR attempts publish without approved checklist",

    expected:
      "Publication blocked",
  },

  {
    code:
      "CHK-004",

    area:
      "Publishing",

    role:
      "placement_hr",

    description:
      "Placement HR publishes job with approved checklist",

    expected:
      "Job becomes Published and visible to approved students",
  },


  // ==========================================================
  // STUDENT
  // ==========================================================

  {
    code:
      "STU-001",

    area:
      "Student Feed",

    role:
      "student",

    description:
      "Approved student loads published jobs",

    expected:
      "Published jobs load successfully",
  },

  {
    code:
      "STU-002",

    area:
      "CV",

    role:
      "student",

    description:
      "Student uploads valid PDF CV",

    expected:
      "Private CV record is created",
  },

  {
    code:
      "STU-003",

    area:
      "CV",

    role:
      "student",

    description:
      "Student uploads invalid file type",

    expected:
      "Upload rejected",
  },

  {
    code:
      "STU-004",

    area:
      "Applications",

    role:
      "student",

    description:
      "Student applies to published job",

    expected:
      "Application created once and scoring job queued",
  },

  {
    code:
      "STU-005",

    area:
      "Applications",

    role:
      "student",

    description:
      "Student applies twice to same job",

    expected:
      "Duplicate application blocked",
  },


  // ==========================================================
  // SCORING
  // ==========================================================

  {
    code:
      "SCORE-001",

    area:
      "Scoring",

    role:
      "system",

    description:
      "Application scoring processes CV",

    expected:
      "Match and ATS score are generated",
  },

  {
    code:
      "SCORE-002",

    area:
      "Scoring",

    role:
      "system",

    description:
      "Match score calculation executes",

    expected:
      "Score follows 70% must-have + 20% good-to-have + 10% tools",
  },

  {
    code:
      "SCORE-003",

    area:
      "Scoring",

    role:
      "system",

    description:
      "Scoring worker fails",

    expected:
      "Application moves Scoring Failed and retry is possible",
  },


  // ==========================================================
  // VERIFICATION
  // ==========================================================

  {
    code:
      "VER-001",

    area:
      "Verification",

    role:
      "placement_hr",

    description:
      "Placement HR claims verification",

    expected:
      "Exclusive verification lock is obtained",
  },

  {
    code:
      "VER-002",

    area:
      "Verification",

    role:
      "placement_hr",

    description:
      "Second HR attempts active locked application",

    expected:
      "Claim blocked",
  },

  {
    code:
      "VER-003",

    area:
      "Verification",

    role:
      "placement_hr",

    description:
      "Placement HR verifies candidate",

    expected:
      "Candidate moves to Verified",
  },

  {
    code:
      "VER-004",

    area:
      "Verification",

    role:
      "placement_hr",

    description:
      "Placement HR requests CV update",

    expected:
      "Student receives update request",
  },


  // ==========================================================
  // CLIENT SUBMISSION
  // ==========================================================

  {
    code:
      "SUB-001",

    area:
      "Submission",

    role:
      "placement_hr",

    description:
      "Placement HR submits verified candidate with effective match >=60",

    expected:
      "Candidate is submitted to Client HR",
  },

  {
    code:
      "SUB-002",

    area:
      "Submission",

    role:
      "placement_hr",

    description:
      "Placement HR submits candidate with effective match <60",

    expected:
      "Submission blocked",
  },

  {
    code:
      "SUB-003",

    area:
      "Privacy",

    role:
      "client_hr",

    description:
      "Client HR attempts to access unsubmitted candidate",

    expected:
      "Access denied",
  },


  // ==========================================================
  // MOCK
  // ==========================================================

  {
    code:
      "MOCK-001",

    area:
      "Mock",

    role:
      "student",

    description:
      "Student books available mock slot",

    expected:
      "Mock interview is scheduled",
  },

  {
    code:
      "MOCK-002",

    area:
      "Mock",

    role:
      "mock_evaluator",

    description:
      "Evaluator submits communication/technical/domain scorecard",

    expected:
      "Official completed mock scorecard recorded",
  },

  {
    code:
      "MOCK-003",

    area:
      "Mock",

    role:
      "student",

    description:
      "Student attempts to edit evaluator scores",

    expected:
      "Access denied",
  },


  // ==========================================================
  // CLIENT DECISION
  // ==========================================================

  {
    code:
      "CLIENT-001",

    area:
      "Shortlisting",

    role:
      "client_hr",

    description:
      "Client HR shortlists submitted candidate",

    expected:
      "Candidate becomes Shortlisted",
  },

  {
    code:
      "CLIENT-002",

    area:
      "Shortlisting",

    role:
      "client_hr",

    description:
      "Client HR rejects candidate without reason",

    expected:
      "Decision blocked",
  },

  {
    code:
      "CLIENT-003",

    area:
      "Shortlisting",

    role:
      "client_hr",

    description:
      "Client HR rejects candidate with reason",

    expected:
      "Candidate becomes Rejected Client",
  },


  // ==========================================================
  // INTERVIEW
  // ==========================================================

  {
    code:
      "INT-001",

    area:
      "Interview",

    role:
      "client_hr",

    description:
      "Client attempts scheduling before completed mock",

    expected:
      "Interview scheduling blocked",
  },

  {
    code:
      "INT-002",

    area:
      "Interview",

    role:
      "client_hr",

    description:
      "Client schedules shortlisted candidate after completed mock",

    expected:
      "Interview created and Student/Admin notifications queued",
  },

  {
    code:
      "INT-003",

    area:
      "Interview",

    role:
      "client_hr",

    description:
      "Client schedules online interview without link",

    expected:
      "Request blocked",
  },

  {
    code:
      "INT-004",

    area:
      "Interview",

    role:
      "client_hr",

    description:
      "Client schedules offline interview without location",

    expected:
      "Request blocked",
  },

  {
    code:
      "INT-005",

    area:
      "Interview",

    role:
      "client_hr",

    description:
      "Client creates duplicate active interview round",

    expected:
      "Duplicate round blocked",
  },


  // ==========================================================
  // FEEDBACK
  // ==========================================================

  {
    code:
      "FDB-001",

    area:
      "Feedback",

    role:
      "client_hr",

    description:
      "Client submits feedback before interview completion",

    expected:
      "Feedback blocked",
  },

  {
    code:
      "FDB-002",

    area:
      "Feedback",

    role:
      "client_hr",

    description:
      "Client selects candidate after completed interview",

    expected:
      "Application becomes Selected",
  },

  {
    code:
      "FDB-003",

    area:
      "Feedback",

    role:
      "client_hr",

    description:
      "Client rejects candidate without comments",

    expected:
      "Feedback blocked",
  },

  {
    code:
      "FDB-004",

    area:
      "Feedback SLA",

    role:
      "system",

    description:
      "Feedback remains missing for more than 24 hours",

    expected:
      "SLA marked overdue",
  },

  {
    code:
      "FDB-005",

    area:
      "Feedback Escalation",

    role:
      "system",

    description:
      "Feedback remains missing for more than 48 hours",

    expected:
      "Admin critical escalation is generated",
  },


  // ==========================================================
  // OFFER
  // ==========================================================

  {
    code:
      "OFF-001",

    area:
      "Offer",

    role:
      "placement_hr",

    description:
      "Placement HR uploads offer for non-selected candidate",

    expected:
      "Offer blocked",
  },

  {
    code:
      "OFF-002",

    area:
      "Offer",

    role:
      "placement_hr",

    description:
      "Placement HR uploads valid PDF offer for selected candidate",

    expected:
      "Private offer record is created",
  },

  {
    code:
      "OFF-003",

    area:
      "Offer Security",

    role:
      "student",

    description:
      "Student requests own offer file",

    expected:
      "Short-lived signed URL returned",
  },

  {
    code:
      "OFF-004",

    area:
      "Offer Security",

    role:
      "student",

    description:
      "Student requests another student's offer",

    expected:
      "Access denied",
  },

  {
    code:
      "OFF-005",

    area:
      "Offer",

    role:
      "student",

    description:
      "Student accepts offer",

    expected:
      "Offer becomes Accepted and Placement record created",
  },

  {
    code:
      "OFF-006",

    area:
      "Offer",

    role:
      "student",

    description:
      "Student declines offer without reason",

    expected:
      "Decision blocked",
  },


  // ==========================================================
  // PLACEMENT
  // ==========================================================

  {
    code:
      "PLC-001",

    area:
      "Placement",

    role:
      "system",

    description:
      "Accepted offer creates placement",

    expected:
      "Application status becomes Placed",
  },

  {
    code:
      "PLC-002",

    area:
      "Placement",

    role:
      "placement_hr",

    description:
      "Placement HR marks candidate joined",

    expected:
      "Placement becomes Joined",
  },

  {
    code:
      "PLC-003",

    area:
      "Placement",

    role:
      "placement_hr",

    description:
      "Placement HR closes placement",

    expected:
      "Placement becomes Closed with audit history",
  },


  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  {
    code:
      "NOT-001",

    area:
      "Notifications",

    role:
      "system",

    description:
      "Notification worker processes pending in-app event",

    expected:
      "Outbox becomes Sent and notification is visible",
  },

  {
    code:
      "NOT-002",

    area:
      "Notifications",

    role:
      "system",

    description:
      "SMTP delivery fails temporarily",

    expected:
      "Outbox retries without rolling back business event",
  },

  {
    code:
      "NOT-003",

    area:
      "Notifications",

    role:
      "student",

    description:
      "Student attempts to read another user's notification",

    expected:
      "Access denied",
  },

  {
    code:
      "NOT-004",

    area:
      "Calendar",

    role:
      "system",

    description:
      "Client interview scheduling email is delivered",

    expected:
      "Calendar invitation is attached",
  },


  // ==========================================================
  // ANALYTICS / REPORTING
  // ==========================================================

  {
    code:
      "ANA-001",

    area:
      "Analytics",

    role:
      "admin",

    description:
      "Admin opens placement analytics",

    expected:
      "Application funnel and SLA KPIs load",
  },

  {
    code:
      "ANA-002",

    area:
      "Analytics",

    role:
      "client_hr",

    description:
      "Client HR opens company analytics",

    expected:
      "Only own-company metrics are visible",
  },

  {
    code:
      "ANA-003",

    area:
      "Reports",

    role:
      "placement_hr",

    description:
      "Placement HR exports placement report",

    expected:
      "CSV downloads successfully",
  },

  {
    code:
      "ANA-004",

    area:
      "Reports",

    role:
      "student",

    description:
      "Student attempts administrative report download",

    expected:
      "Access denied",
  },


  // ==========================================================
  // SECURITY
  // ==========================================================

  {
    code:
      "SEC-001",

    area:
      "Storage Security",

    role:
      "anonymous",

    description:
      "Anonymous user requests CV storage URL directly",

    expected:
      "Access denied",
  },

  {
    code:
      "SEC-002",

    area:
      "Storage Security",

    role:
      "anonymous",

    description:
      "Anonymous user requests offer storage URL directly",

    expected:
      "Access denied",
  },

  {
    code:
      "SEC-003",

    area:
      "API Security",

    role:
      "anonymous",

    description:
      "Cron endpoint called without CRON_SECRET",

    expected:
      "Request rejected",
  },

  {
    code:
      "SEC-004",

    area:
      "Rate Limiting",

    role:
      "anonymous",

    description:
      "Repeated excessive login attempts",

    expected:
      "Requests rate-limited",
  },

  {
    code:
      "SEC-005",

    area:
      "State Machine",

    role:
      "system",

    description:
      "Attempt invalid application transition Verified directly to Placed",

    expected:
      "Database rejects transition",
  },


  // ==========================================================
  // PERFORMANCE
  // ==========================================================

  {
    code:
      "PERF-001",

    area:
      "Performance",

    role:
      "system",

    description:
      "Run 1,000-concurrent-student feed test",

    expected:
      "Feed satisfies PRD target under two seconds",
  },

  {
    code:
      "PERF-002",

    area:
      "Performance",

    role:
      "system",

    description:
      "Load verification queue under production-like data",

    expected:
      "P95 remains within approved Stage 14 threshold",
  },


  // ==========================================================
  // FINAL BUSINESS FLOW
  // ==========================================================

  {
    code:
      "E2E-001",

    area:
      "End To End",

    role:
      "all",

    description:
      "Execute full successful placement workflow",

    expected:
      "Approved Student progresses Job -> Apply -> Verify -> Client -> Mock -> Shortlist -> Interview -> Selected -> Offer -> Placed",
  },

];