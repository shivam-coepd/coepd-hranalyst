"use client";

import { useActionState, useState } from "react";
import { createUserAction, type CreateUserState } from "./actions";

interface CompanyOption {
  id: string;
  name: string;
}
const initialState: CreateUserState = { success: false, message: "" };

export default function CreateUserForm({
  companies,
}: {
  companies: CompanyOption[];
}) {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    initialState,
  );
  const [role, setRole] = useState("student");

  return (
    <form
      action={formAction}
      className="mt-6 space-y-5 rounded-xl border bg-white p-6"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="First name"
          name="firstName"
          required
          error={state.fieldErrors?.firstName?.[0]}
        />
        <Field
          label="Last name"
          name="lastName"
          required
          error={state.fieldErrors?.lastName?.[0]}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          error={state.fieldErrors?.email?.[0]}
        />
        <Field
          label="Phone"
          name="phone"
          error={state.fieldErrors?.phone?.[0]}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium" htmlFor="role">
          Role
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-lg border px-3 py-2.5"
        >
          <option value="student">Student</option>
          <option value="placement_hr">Placement HR</option>
          <option value="client_hr">Client HR</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {role === "student" ? (
        <Field
          label="Enrollment ID"
          name="enrollmentId"
          required
          error={state.fieldErrors?.enrollmentId?.[0]}
        />
      ) : null}

      {role === "client_hr" ? (
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="companyId">
            Verified company
          </label>
          <select
            id="companyId"
            name="companyId"
            required
            className="w-full rounded-lg border px-3 py-2.5"
          >
            <option value="">Select company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          {state.fieldErrors?.companyId?.[0] ? (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.companyId[0]}
            </p>
          ) : null}
        </div>
      ) : null}

      {state.message ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-5 py-2.5 font-medium text-white disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create and invite user"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border px-3 py-2.5"
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
