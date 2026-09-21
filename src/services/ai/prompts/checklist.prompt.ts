export const CHECKLIST_PROMPT_VERSION = "checklist-v1";

interface JobPromptInput {
  jobTitle: string;
  roleType: string;
  locationType: string;
  location?: string | null;

  experienceMinYears: number;

  experienceMaxYears?: number | null;

  jdText: string;
}

export function buildChecklistPrompt(job: JobPromptInput) {
  return `
You are assisting the HRAnalyst Placement Wing.

Your job is to analyze the supplied job description
for one of these roles:

- Business Analyst
- Product Owner
- Product Manager

Create a CV screening checklist.

IMPORTANT RULES:

1. Use only requirements that are explicitly stated
   or strongly supported by the supplied JD.

2. Do not invent certifications, tools, technologies,
   domains, years of experience, or qualifications.

3. Separate mandatory requirements from preferences.

4. must_have must contain requirements whose absence
   could reasonably disqualify the candidate.

5. good_to_have should contain preferred or beneficial
   requirements.

6. tools should contain named software/tools/platforms
   mentioned or clearly required by the JD.

7. domain should describe the business domain only when
   the JD supports it. Otherwise use "Not specified".

8. exp_required should reflect the supplied experience
   requirements.

9. Select no more than three important skills for
   top_3_skills.

10. Do not infer protected personal characteristics.

JOB:

Title:
${job.jobTitle}

Role Type:
${job.roleType}

Location Type:
${job.locationType}

Location:
${job.location ?? "Not specified"}

Minimum Experience years:
${job.experienceMinYears}

Maximum Experience years:
${job.experienceMaxYears ?? "Not specified"}

JOB DESCRIPTION:

${job.jdText}
`;
}
