import { requireRole } from "@/lib/auth/guards";
import { getNotifications } from "@/repositories/notifications.repository";
import { PageHeader } from "@/components/ui/page-header";
import LiveNotifications from "@/components/notifications/live-notifications";

export default async function ClientNotificationsPage() {
  const user = await requireRole("client_hr");
  const notifications = await getNotifications(user.id, 100);

  return (
    <div className="p-8">
      <PageHeader 
        title="Notifications" 
        description="Live updates on candidate submissions, interviews, and offers."
      />
      <div className="mt-8">
        <LiveNotifications userId={user.id} initialNotifications={notifications} />
      </div>
    </div>
  );
}
