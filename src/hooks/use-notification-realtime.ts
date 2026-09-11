"use client";

import {
  useEffect,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

export function
useNotificationRealtime({
  userId,
  onNotification,
}: {
  userId:
    string;
  onNotification:
    () => void;
}) {

  useEffect(
    () => {

      const supabase =
        createClient();

      const channel =
        supabase
          .channel(
            `notifications:${userId}`
          )
          .on(
            "postgres_changes",
            {
              event:
                "INSERT",

              schema:
                "public",

              table:
                "notifications",

              filter:
                `user_id=eq.${userId}`,
            },
            () => {
              onNotification();
            }
          )
          .subscribe();

      return () => {
        supabase
          .removeChannel(
            channel
          );
      };
    },
    [
      userId,
      onNotification,
    ]
  );
}