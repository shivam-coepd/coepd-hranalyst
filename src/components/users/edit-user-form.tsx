"use client";

import { useActionState } from "react";
import type { EditUserState } from "@/app/admin/users/[id]/edit/actions";

export default function EditUserForm({
  action,
  defaults,
}: {
  action: (state: EditUserState, formData: FormData) => Promise<EditUserState>;
  defaults: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}) {
  const [state, formAction, pending] = useActionState(action, {
    success: false,
    message: "",
  });

  const getValue = (field: keyof typeof defaults) => {
    if (state.fields && state.fields[field] !== undefined) {
      return state.fields[field];
    }
    return defaults[field] ?? "";
  };

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            First name <span className="text-red-500">*</span>
          </span>
          <input
            name="firstName"
            type="text"
            required
            defaultValue={getValue("firstName")}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
          />
          {state.fieldErrors?.firstName && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.firstName[0]}</p>
          )}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">
            Last name <span className="text-red-500">*</span>
          </span>
          <input
            name="lastName"
            type="text"
            required
            defaultValue={getValue("lastName")}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
          />
          {state.fieldErrors?.lastName && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.lastName[0]}</p>
          )}
        </label>

        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm font-medium">Phone number</span>
          <input
            name="phone"
            type="text"
            defaultValue={getValue("phone")}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:ring-2"
          />
        </label>
      </div>

      {state.message && (
        <div
          className={`rounded-lg p-3 text-sm font-medium ${state.success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
        >
          {state.message}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving changes..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
