import type { WidgetConfig } from "@/types/dashboard";

interface StyleSectionProps {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}

export function StylePie({ widget, onPatchViz }: StyleSectionProps) {
  if (widget.type !== "pie") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.donut as boolean) ?? false}
          onChange={(e) => onPatchViz("donut", e.target.checked)}
          className="rounded"
        />
        Donut style
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.showLabels as boolean) ?? true}
          onChange={(e) => onPatchViz("showLabels", e.target.checked)}
          className="rounded"
        />
        Show labels
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.showPercentages as boolean) ?? false}
          onChange={(e) => onPatchViz("showPercentages", e.target.checked)}
          className="rounded"
        />
        Show percentages
      </label>
    </>
  );
}
