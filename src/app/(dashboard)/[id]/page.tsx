"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardCanvas } from "@/components/features/dashboard/DashboardCanvas";
import { WidgetEditor } from "@/components/features/editor/WidgetEditor";
import { ChatPanel } from "@/components/features/chat/ChatPanel";
import { useDashboardStore } from "@/stores/dashboard-store";
import { useDataStore } from "@/stores/data-store";

export default function DashboardPage() {
  const params = useParams();
  const config = useDashboardStore((s) => s.config);
  const activeWidgetId = useDashboardStore((s) => s.activeWidgetId);
  const dataset = useDataStore((s) => s.dataset);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch(`/api/dashboard/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          useDashboardStore.getState().setConfig(data.config);
        }
      } catch {
        // Dashboard not found, user will create one
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {dataset && (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <DashboardCanvas />
          </div>
          {config && activeWidgetId && (
            <div className="w-80 shrink-0">
              <WidgetEditor />
            </div>
          )}
        </div>
      )}
      {config && !dataset && (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Upload data to get started
        </div>
      )}
      {config && <ChatPanel />}
    </div>
  );
}
