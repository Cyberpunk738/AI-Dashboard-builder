"use client";

import { UploadPanel } from "@/components/features/upload/UploadPanel";
import { DataPreview } from "@/components/features/data-preview/DataPreview";
import { DashboardCanvas } from "@/components/features/dashboard/DashboardCanvas";
import { WidgetEditor } from "@/components/features/editor/WidgetEditor";
import { ChatPanel } from "@/components/features/chat/ChatPanel";
import { useDataStore } from "@/stores/data-store";
import { useDashboardStore } from "@/stores/dashboard-store";

export default function Home() {
  const dataset = useDataStore((s) => s.dataset);
  const config = useDashboardStore((s) => s.config);
  const activeWidgetId = useDashboardStore((s) => s.activeWidgetId);

  if (!dataset) {
    return <UploadPanel />;
  }

  return (
    <div className="flex h-screen flex-col">
      <DataPreview />

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

      {config && <ChatPanel />}
    </div>
  );
}
