"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/hooks/useDashboard";

export default function NewDashboardPage() {
  const router = useRouter();
  const { createDashboard } = useDashboard();

  useEffect(() => {
    const id = createDashboard("Untitled Dashboard");
    router.replace(`/dashboard/${id}`);
  }, [createDashboard, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}
