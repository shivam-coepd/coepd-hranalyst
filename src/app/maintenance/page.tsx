export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-xl rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Scheduled Maintenance</h1>

        <p className="mt-3 text-gray-600">
          HRAnalyst Placement Wing is temporarily unavailable while system
          maintenance is being completed.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Please try again after maintenance is complete.
        </p>
      </div>
    </main>
  );
}
