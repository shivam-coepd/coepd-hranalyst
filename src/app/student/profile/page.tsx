import ProfileForm from "@/components/student/profile-form";
import { requireRole } from "@/lib/auth/guards";
import { getOwnStudentProfile } from "@/repositories/students.repository";
export default async function Page() {
  const u = await requireRole("student");
  const p = await getOwnStudentProfile(u.id);
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold">Placement Profile</h1>
      <p className="mt-1 text-slate-600">
        Keep your profile current before applying.
      </p>
      <div className="mt-8">
        <ProfileForm profile={p} />
      </div>
    </main>
  );
}
