"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

const initialState = {
  success: false,
  message: "",
};

export default function LoginForm() {
  const [state, formAction, pending] =
    useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-5">

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
          placeholder="name@company.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
        />
      </div>

      {state?.message && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>

    </form>
  );
}