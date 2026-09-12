import CvManager from "@/components/student/cv-manager";
import { requireRole } from "@/lib/auth/guards";
import {
  getOwnStudentCvs,
  getOwnStudentProfile,
} from "@/repositories/students.repository";
export default async function Page() {
  const u = await requireRole("student");
  const s = await getOwnStudentProfile(u.id);
  const cvs = await getOwnStudentCvs(s.id);
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold">CV Manager</h1>
      <p className="mt-1 text-slate-600">
        Your primary CV is attached when you apply.
      </p>
      <div className="mt-8">
        <CvManager initialCvs={cvs} />
      </div>
    </main>
  );
}
