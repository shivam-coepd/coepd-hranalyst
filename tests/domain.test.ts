import { describe, expect, it } from "vitest";
import { calculateMatchScore } from "../src/services/scoring/calculate-match";
import { calculateAtsScore } from "../src/services/scoring/calculate-ats";
import { buildCsv } from "../src/lib/reports/csv";
import {
  getAccountStatusRoute,
  getDashboardRoute,
} from "../src/lib/auth/dashboard-route";
import { verificationSchema } from "../src/lib/validators/verification.schema";
import {
  getEffectiveScore,
  isClientSubmissionEligible,
} from "../src/lib/applications/effective-score";
import { canTransitionJob } from "../src/services/jobs/job-status";
import {
  studentOfferDecisionSchema,
  registerOfferSchema,
} from "../src/lib/validators/offer.schema";
import { companySchema } from "../src/lib/validators/company.schema";

describe("PRD score and verification gates", () => {
  it("uses the exact 70/20/10 weights", () => {
    expect(
      calculateMatchScore({
        mustHave: { matched: 1, total: 2 },
        goodToHave: { matched: 1, total: 1 },
        tools: { matched: 0, total: 1 },
      }).matchScore,
    ).toBe(55);
  });
  it("does not redistribute an empty category", () => {
    expect(
      calculateMatchScore({
        mustHave: { matched: 1, total: 1 },
        goodToHave: { matched: 0, total: 0 },
        tools: { matched: 0, total: 0 },
      }).matchScore,
    ).toBe(70);
  });
  it("permits verification below 60 while retaining verified overrides", () => {
    expect(
      verificationSchema.parse({
        applicationId: "00000000-0000-4000-8000-000000000001",
        decision: "verified",
        verifiedMatchScore: 59,
        mustHaveVerified: true,
        cvVerified: true,
        experienceVerified: true,
        domainVerified: true,
      }).verifiedMatchScore,
    ).toBe(59);
  });
  it("requires a rejection reason", () => {
    expect(
      verificationSchema.safeParse({
        applicationId: "00000000-0000-4000-8000-000000000001",
        decision: "rejected",
        mustHaveVerified: false,
        cvVerified: false,
        experienceVerified: false,
        domainVerified: false,
      }).success,
    ).toBe(false);
  });
  it("uses the 20/30/20/15/15 ATS category caps", () => {
    const evidence = Array.from({ length: 12 }, (_, index) => ({
      name: `Skill ${index}`,
      normalized_name: `skill-${index}`,
      evidence: `Skill ${index}`,
      confidence: 1,
    }));
    const score = calculateAtsScore(
      {
        full_name: "Test Student",
        email: "student@example.test",
        phone: "9999999999",
        location: "Pune",
        linkedin_url: "https://www.linkedin.com/in/test-student",
        professional_summary: "Business analyst",
        total_experience_months: 60,
        current_company: "Example",
        current_designation: "Business Analyst",
        skills: evidence,
        tools: [],
        domains: [],
        methodologies: [],
        certifications: [],
        education: [],
        experience: [],
        projects: [],
      },
      Array.from({ length: 35 }, () =>
        Array.from({ length: 10 }, () => "experience").join(" "),
      ).join("\n"),
    );
    expect(score).toEqual({
      atsScore: 100,
      contactScore: 20,
      skillsScore: 30,
      experienceScore: 20,
      formattingScore: 15,
      lengthScore: 15,
    });
  });
});
describe("effective score and workflow boundaries", () => {
  it("prefers the verified score even when it is zero", () =>
    expect(getEffectiveScore(0, 92)).toBe(0));
  it("requires verified status and an effective Match score of 60", () => {
    expect(isClientSubmissionEligible("verified", 60, 20).eligible).toBe(true);
    expect(isClientSubmissionEligible("verified", 59, 99).eligible).toBe(false);
    expect(isClientSubmissionEligible("scoring", 100, 100).eligible).toBe(
      false,
    );
  });
  it("rejects invalid job state changes", () => {
    expect(canTransitionJob("draft", "pending_checklist")).toBe(true);
    expect(canTransitionJob("draft", "published")).toBe(false);
    expect(canTransitionJob("closed", "published")).toBe(false);
  });
  it("requires a reason when a Student declines an offer", () => {
    expect(
      studentOfferDecisionSchema.safeParse({
        offerId: "00000000-0000-4000-8000-000000000001",
        decision: "declined",
      }).success,
    ).toBe(false);
  });
  it("rejects offer validity before the offer date", () => {
    expect(
      registerOfferSchema.safeParse({
        applicationId: "00000000-0000-4000-8000-000000000001",
        feedbackId: "00000000-0000-4000-8000-000000000002",
        designation: "Business Analyst",
        offerDate: "2026-09-12",
        offerValidUntil: "2026-09-11",
      }).success,
    ).toBe(false);
  });
});
describe("account routing", () => {
  it("fails closed for unknown states", () =>
    expect(getAccountStatusRoute("unknown")).toBe("/unauthorized"));
  it("routes pending accounts to an existing page", () =>
    expect(getAccountStatusRoute("pending")).toBe("/pending-approval"));
  it("prioritizes admin for multiple roles", () =>
    expect(getDashboardRoute(["student", "admin"])).toBe("/admin"));
});
describe("CSV export", () => {
  it.each(["=1+1", "+cmd", "-cmd", "@SUM(A1)", "  =cmd", "\t=cmd", "\r=cmd"])(
    "neutralizes formula %j",
    (value) => expect(buildCsv([{ value }])).toContain(`'${value}`),
  );
  it("escapes commas and quotes", () =>
    expect(buildCsv([{ value: 'A,"B"' }])).toBe('value\r\n"A,""B"""'));
});

describe("company input", () => {
  it("normalizes a website-shaped company domain", () => {
    const result = companySchema.parse({
      companyName: "APT Digital Express",
      companyDomain: "https://www.aptdigital.in/about",
    });
    expect(result.companyDomain).toBe("aptdigital.in");
  });

  it("rejects an industry label used as a company domain", () => {
    expect(
      companySchema.safeParse({
        companyName: "APT Digital Express",
        companyDomain: "IT Solutions",
      }).success,
    ).toBe(false);
  });
});
