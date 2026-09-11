export function calculateAts({
  contact,
  skills,
  experience,
  formatting,
  length,
}: {
  contact: number;
  skills: number;
  experience: number;
  formatting: number;
  length: number;
}) {

  const ats =
    contact +
    skills +
    experience +
    formatting +
    length;

  return {
    atsScore:
      Math.min(
        100,
        Number(
          ats.toFixed(2)
        )
      ),

    contactScore:
      contact,

    skillsScore:
      skills,

    experienceScore:
      experience,

    formattingScore:
      formatting,

    lengthScore:
      length,
  };
}