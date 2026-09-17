"use client";

import { useActionState, useState } from "react";
import { resetPasswordAction } from "./actions";
import type { AuthActionState } from "@/types/auth";
import { Eye, EyeOff } from "lucide-react";

const initialState: AuthActionState = { success: false, message: "" };

export default function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    initialState,
  );
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          New password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className="w-full rounded-lg border px-4 py-3 pr-12 outline-none focus:ring-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium"
        >
          Confirm password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            className="w-full rounded-lg border px-4 py-3 pr-12 outline-none focus:ring-2"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      {state.message ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      <button
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-50 transition-opacity"
      >
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
