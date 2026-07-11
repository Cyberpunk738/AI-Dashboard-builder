import type { WidgetConfig } from "@/types/dashboard";
import { Section } from "./shared";

interface StyleSectionProps {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}

export function StyleBar({ widget, onPatchViz }: StyleSectionProps) {
  if (widget.type !== "bar") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <Section label="Bar Variant">
        <select
          value={(viz.variant as string) ?? "grouped"}
          onChange={(e) => onPatchViz("variant", e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="grouped">Grouped</option>
          <option value="stacked">Stacked</option>
          <option value="stacked_percent">Stacked %</option>
        </select>
      </Section>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.horizontal as boolean) ?? false}
          onChange={(e) => onPatchViz("horizontal", e.target.checked)}
          className="rounded"
        />
        Horizontal orientation
      </label>

      <Section label="Border Radius">
        <input
          type="number"
          min={0}
          value={(viz.borderRadius as number) ?? 0}
          onChange={(e) =>
            onPatchViz("borderRadius", parseInt(e.target.value, 10) || 0)
          }
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </Section>
    </>
  );
}
