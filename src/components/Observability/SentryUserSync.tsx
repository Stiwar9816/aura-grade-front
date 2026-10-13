"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useAuth } from "@/hooks";

export default function SentryUserSync() {
  const { user } = useAuth();

  useEffect(() => {
    Sentry.setUser(user?.id ? { id: user.id } : null);
    Sentry.setTag("user_role", user?.role || "anonymous");
  }, [user?.id, user?.role]);

  return null;
}
