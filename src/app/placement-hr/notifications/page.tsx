import { requireRole } from "@/lib/auth/guards";
import { getNotifications } from "@/repositories/notifications.repository";
import { PageHeader } from "@/components/ui/page-header";
import LiveNotifications from "@/components/notifications/live-notifications";

export default async function PlacementNotificationsPage() {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const notifications = await getNotifications(user.id, 100);

  return (
    <div className="p-8">
      <PageHeader 
        title="Notifications" 
        description="Live updates on student verifications, mocks, and client interactions."
      />
      <div className="mt-8">
        <LiveNotifications userId={user.id} initialNotifications={notifications} />
      </div>
    </div>
  );
}
