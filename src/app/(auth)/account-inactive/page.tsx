export default function AccountInactivePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">Account Inactive</h1>

        <p className="mt-3 text-gray-600">
          Your HRAnalyst Placement Wing account is currently inactive.
        </p>

        <p className="mt-2 text-sm text-gray-500">
          Please contact the administrator if you believe your access should be
          restored.
        </p>
      </div>
    </main>
  );
}
