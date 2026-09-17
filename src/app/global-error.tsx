"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
          <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center">
            <h1 className="text-2xl font-bold">Something went wrong</h1>

            <p className="mt-3 text-gray-600">
              The request could not be completed.
            </p>

            {error.digest && (
              <p className="mt-2 text-xs text-gray-400">
                Reference: {error.digest}
              </p>
            )}

            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white"
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
