"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type Props = {
  placementId:
    string;
  status:
    string;
};

export function
PlacementActions({
  placementId,
  status,
}: Props) {

  const router =
    useRouter();

  const [
    closeMode,
    setCloseMode,
  ] =
    useState(false);

  const [
    reason,
    setReason,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  async function markJoined() {

    setLoading(true);

    const response =
      await fetch(
        `/api/placements/${placementId}/joined`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              joinedAt:
                new Date()
                  .toISOString(),
            }),
        }
      );

    setLoading(false);

    if (response.ok) {
      router.refresh();
    }
  }

  async function close() {

    setLoading(true);

    const response =
      await fetch(
        `/api/placements/${placementId}/close`,
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              reason,
            }),
        }
      );

    setLoading(false);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">

      {status ===
        "placed" && (
        <button
          type="button"
          disabled={loading}
          onClick={
            markJoined
          }
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Mark Joined
        </button>
      )}

      {status !==
        "closed" &&
        !closeMode && (
        <button
          type="button"
          onClick={() =>
            setCloseMode(
              true
            )
          }
          className="ml-3 rounded-md border px-4 py-2 text-sm"
        >
          Close Placement
        </button>
      )}

      {closeMode && (
        <div className="max-w-xl space-y-3">

          <textarea
            value={reason}
            onChange={event =>
              setReason(
                event.target.value
              )
            }
            rows={4}
            placeholder="Closure reason"
            className="w-full rounded-md border px-3 py-2"
          />

          <div className="flex gap-3">

            <button
              type="button"
              disabled={
                loading ||
                !reason.trim()
              }
              onClick={close}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Confirm Close
            </button>

            <button
              type="button"
              onClick={() =>
                setCloseMode(
                  false
                )
              }
              className="rounded-md border px-4 py-2 text-sm"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

    </div>
  );
}