import ProfileForm from "@/components/student/profile-form";
import { requireRole } from "@/lib/auth/guards";
import { getOwnStudentProfile } from "@/repositories/students.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default async function Page() {
  const u = await requireRole("student");
  const p = await getOwnStudentProfile(u.id);

  return (
    <main className="p-8">
      <PageHeader 
        title="Placement Profile" 
        description="Keep your profile current before applying."
      />
      
      <Card className="mt-8 p-6">
        <ProfileForm profile={p} />
      </Card>
    </main>
  );
}
