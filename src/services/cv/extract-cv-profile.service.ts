import "server-only";

import {
  zodTextFormat,
} from "openai/helpers/zod";

import {
  openai,
} from "@/lib/openai/client";

const response = await openai.responses.parse({
  model: process.env.OPENAI_CV_MODEL!,

  input: [
    {
      role: "system",
      content: CV_EXTRACTION_SYSTEM_PROMPT,
    },

    {
      role: "user",
      content: parsedCvText,
    },
  ],

  text: {
    format: zodTextFormat(CvExtractionSchema, "cv_profile"),
  },
});
