import type { WidgetConfig } from "@/types/dashboard";

interface StyleSectionProps {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}

export function StyleLine({ widget, onPatchViz }: StyleSectionProps) {
  if (widget.type !== "line") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.smooth as boolean) ?? false}
          onChange={(e) => onPatchViz("smooth", e.target.checked)}
          className="rounded"
        />
        Smooth curves
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.showPoints as boolean) ?? true}
          onChange={(e) => onPatchViz("showPoints", e.target.checked)}
          className="rounded"
        />
        Show data points
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.fillArea as boolean) ?? false}
          onChange={(e) => onPatchViz("fillArea", e.target.checked)}
          className="rounded"
        />
        Fill area below line
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.connectNulls as boolean) ?? false}
          onChange={(e) => onPatchViz("connectNulls", e.target.checked)}
          className="rounded"
        />
        Connect null values
      </label>
    </>
  );
}
