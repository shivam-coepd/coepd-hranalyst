import { requireRole } from "@/lib/auth/guards";
import { getNotifications } from "@/repositories/notifications.repository";
import { PageHeader } from "@/components/ui/page-header";
import LiveNotifications from "@/components/notifications/live-notifications";

export default async function AdminNotificationsPage() {
  const user = await requireRole(["admin", "super_admin"]);
  const notifications = await getNotifications(user.id, 100);

  return (
    <div className="p-8">
      <PageHeader 
        title="System Notifications" 
        description="Live administrative and system health alerts."
      />
      <div className="mt-8">
        <LiveNotifications userId={user.id} initialNotifications={notifications} />
      </div>
    </div>
  );
}
