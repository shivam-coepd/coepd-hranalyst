import CvManager from "@/components/student/cv-manager";
import { requireRole } from "@/lib/auth/guards";
import { getOwnStudentCvs, getOwnStudentProfile } from "@/repositories/students.repository";
import { PageHeader } from "@/components/ui/page-header";

export default async function Page() {
  const u = await requireRole("student");
  const s = await getOwnStudentProfile(u.id);
  const cvs = await getOwnStudentCvs(s.id);

  return (
    <main className="p-8">
      <PageHeader 
        title="CV Manager" 
        description="Your primary CV is attached when you apply."
      />
      
      <div className="mt-8">
        <CvManager initialCvs={cvs} />
      </div>
    </main>
  );
}
