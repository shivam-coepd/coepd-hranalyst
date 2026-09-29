const { studentProfileSchema } = require("./src/lib/validators/student-profile.schema");

const body = {
  firstName: "Test",
  lastName: "Test",
  phone: "",
  headline: "",
  summary: "Passionate developer with 3 years of experience in React and Node.js.",
  city: "",
  state: "",
  country: "",
  qualification: "",
  graduationYear: undefined,
  specialization: "",
  totalExperienceMonths: 0,
  currentCompany: "",
  currentDesignation: "",
  currentCtc: undefined,
  expectedCtc: undefined,
  noticePeriodDays: undefined,
  preferredRole: undefined,
  preferredLocation: "",
  preferredWorkplaceType: undefined,
  willingToRelocate: false,
  availabilityStatus: "available",
  linkedinUrl: "",
  githubUrl: "",
  portfolioUrl: "",
  skills: []
};

const parsed = studentProfileSchema.safeParse(body);
if (!parsed.success) {
  console.log("Validation failed:", parsed.error.issues);
} else {
  console.log("Validation succeeded!", parsed.data);
}
