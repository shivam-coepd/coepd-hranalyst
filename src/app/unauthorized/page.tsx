export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Access denied</h1>

        <p className="mt-3 text-muted-foreground">
          You do not have permission to access this section.
        </p>
      </div>
    </main>
  );
}
