# Scoring and AI Specification

## Match score

The score is `(matched must / total must * 70) + (matched good / total good * 20) + (matched tools / total tools * 10)`, clamped to 0–100. An empty category contributes zero and its weight is not redistributed. Requirement rows preserve normalized requirement, match method, confidence and evidence.

## ATS score

ATS uses category caps of contact information 20, skills 30, experience 20, formatting 15, and length 15, then clamps the total to 0–100. Tests assert both the Match formula/empty categories and the complete ATS cap breakdown.

Applications retain automated Match/ATS and HR-verified Match/ATS separately. Effective values use a non-null verified score, including zero, before the automated value. HR may verify below 60; Client submission still requires verified status and effective Match at least 60.

## AI boundary

OpenAI checklist and CV extraction use structured response schemas and Zod validation. AI-generated checklist output is saved as a draft with generation metadata; a Placement HR/Admin review and audited approval is required before publication. Malformed/provider failures do not publish data. Scoring runs have explicit pending/processing/completed/failed state, one active run per application, preserved error detail for operators, and retry support.

Models are configured with `OPENAI_CHECKLIST_MODEL` and `OPENAI_CV_MODEL`; no model name or successful result is fabricated when configuration is missing.
