"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction } from "./actions";
import type { AuthActionState } from "@/types/auth";

const initialState: AuthActionState = { success: false, message: "" };

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Registered email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.fields?.email ?? ""}
          className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
        />
      </div>
      {state.message ? (
        <div
          className={`rounded-lg p-3 text-sm ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
        >
          {state.message}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Sending..." : "Send reset link"}
      </button>
      <div className="text-center">
        <Link href="/login" className="text-sm underline">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
