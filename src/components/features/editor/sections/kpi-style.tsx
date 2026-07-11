import type { WidgetConfig } from "@/types/dashboard";
import { Section } from "./shared";

interface StyleSectionProps {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}

export function StyleKpi({ widget, onPatchViz }: StyleSectionProps) {
  if (widget.type !== "kpi") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <Section label="Number Format">
        <select
          value={
            ((viz.format as Record<string, unknown>)?.number as string) ??
            "compact"
          }
          onChange={(e) =>
            onPatchViz("format", { number: e.target.value })
          }
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="number">Plain</option>
          <option value="compact">Compact</option>
          <option value="currency">Currency</option>
          <option value="percentage">Percentage</option>
          <option value="decimal">Decimal</option>
          <option value="abbreviated">Abbreviated</option>
        </select>
      </Section>

      <Section label="Trend Indicator">
        <select
          value={(viz.trend as string) ?? "auto"}
          onChange={(e) => onPatchViz("trend", e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="auto">Auto</option>
          <option value="up">Up (positive)</option>
          <option value="down">Down (negative)</option>
          <option value="neutral">Neutral</option>
        </select>
      </Section>
    </>
  );
}
