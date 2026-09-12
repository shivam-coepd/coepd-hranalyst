"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "./actions";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = { success: false, message: "" };

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );
  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium"
        >
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          className="w-full rounded-lg border px-4 py-3"
        />
      </div>
      {state.message ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      <button
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
