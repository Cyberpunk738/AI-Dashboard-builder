import type { WidgetConfig } from "@/types/dashboard";
import { Section } from "./shared";

interface StyleSectionProps {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}

export function StyleArea({ widget, onPatchViz }: StyleSectionProps) {
  if (widget.type !== "area") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.stacked as boolean) ?? false}
          onChange={(e) => onPatchViz("stacked", e.target.checked)}
          className="rounded"
        />
        Stacked areas
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
      <Section label="Fill Opacity">
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={(viz.fillOpacity as number) ?? 0.5}
          onChange={(e) => onPatchViz("fillOpacity", parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="text-xs text-muted-foreground">
          {((viz.fillOpacity as number) ?? 0.5).toFixed(1)}
        </span>
      </Section>
    </>
  );
}
