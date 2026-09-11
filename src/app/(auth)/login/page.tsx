import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            HRAnalyst
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Placement Management Platform
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">
            Sign in
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Enter your registered account details.
          </p>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}