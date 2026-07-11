import type { WidgetConfig } from "@/types/dashboard";
import { Section } from "./shared";

interface StyleSectionProps {
  widget: WidgetConfig;
  onPatchViz: (key: string, value: unknown) => void;
}

export function StyleTable({ widget, onPatchViz }: StyleSectionProps) {
  if (widget.type !== "table") return null;
  const viz = widget.visualization as Record<string, unknown>;

  return (
    <>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.pagination as boolean) ?? true}
          onChange={(e) => onPatchViz("pagination", e.target.checked)}
          className="rounded"
        />
        Enable pagination
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={(viz.showSearch as boolean) ?? false}
          onChange={(e) => onPatchViz("showSearch", e.target.checked)}
          className="rounded"
        />
        Show search
      </label>
      {viz.pagination !== false && (
        <Section label="Page Size">
          <input
            type="number"
            min={5}
            max={100}
            value={(viz.pageSize as number) ?? 20}
            onChange={(e) =>
              onPatchViz("pageSize", parseInt(e.target.value, 10) || 20)
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </Section>
      )}
    </>
  );
}
