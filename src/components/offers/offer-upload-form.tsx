"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type Props = {
  applicationId:
    string;
  feedbackId:
    string;
};

export function
OfferUploadForm({
  applicationId,
  feedbackId,
}: Props) {

  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  async function submit(
    event:
      React.FormEvent<
        HTMLFormElement
      >
  ) {

    event.preventDefault();

    setLoading(true);
    setError(null);

    try {

      const form =
        new FormData(
          event.currentTarget
        );

      form.set(
        "applicationId",
        applicationId
      );

      form.set(
        "feedbackId",
        feedbackId
      );

      const response =
        await fetch(
          "/api/offers",
          {
            method:
              "POST",

            body:
              form,
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ??
          "Unable to upload offer"
        );
      }

      router.refresh();

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload offer"
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 rounded-xl border bg-white p-6"
    >

      <h2 className="text-lg font-semibold">
        Upload Offer Letter
      </h2>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">

        <input
          name="designation"
          placeholder="Designation"
          required
          className="rounded-md border px-3 py-2"
        />

        <input
          name="department"
          placeholder="Department"
          className="rounded-md border px-3 py-2"
        />

        <input
          name="employmentType"
          placeholder="Employment Type"
          className="rounded-md border px-3 py-2"
        />

        <input
          name="joiningLocation"
          placeholder="Joining Location"
          className="rounded-md border px-3 py-2"
        />

        <input
          name="annualCtc"
          type="number"
          min="0"
          step="0.01"
          placeholder="Annual CTC"
          className="rounded-md border px-3 py-2"
        />

        <input
          name="currency"
          defaultValue="INR"
          placeholder="Currency"
          className="rounded-md border px-3 py-2"
        />

        <div>
          <label className="mb-1 block text-sm">
            Offer Date
          </label>
          <input
            name="offerDate"
            type="date"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">
            Joining Date
          </label>
          <input
            name="joiningDate"
            type="date"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm">
            Offer Valid Until
          </label>
          <input
            name="offerValidUntil"
            type="date"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <input
          name="probationPeriodMonths"
          type="number"
          min="0"
          max="36"
          placeholder="Probation Months"
          className="rounded-md border px-3 py-2"
        />

      </div>

      <label className="flex items-center gap-2 text-sm">

        <input
          type="checkbox"
          name="noticeBuyoutAvailable"
          value="true"
        />

        Notice buyout available

      </label>

      <textarea
        name="notes"
        rows={4}
        placeholder="Offer notes"
        className="w-full rounded-md border px-3 py-2"
      />

      <div>
        <label className="mb-1 block text-sm font-medium">
          Offer Letter PDF
        </label>

        <input
          type="file"
          name="file"
          accept="application/pdf,.pdf"
          required
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading
          ? "Uploading..."
          : "Upload Offer"}
      </button>

    </form>
  );
}