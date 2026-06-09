"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { isTechnicianRole } from "@/constants/routes";
import { workerProfileApi } from "@/apis/worker-profile.api";

export function WorkerRedirect() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user && isTechnicianRole(user.role)) {
      workerProfileApi.getMe()
        .then((profile) => {
          if (profile?.id) {
            router.replace("/technician/bookings");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch worker profile status:", err);
        });
    }
  }, [isAuthenticated, user, router]);

  return null;
}
