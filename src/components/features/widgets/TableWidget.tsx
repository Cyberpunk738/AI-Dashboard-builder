"use client";

import { memo, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { WidgetProps } from "@/types/dashboard";

const PAGE_SIZE = 20;

function TableWidget({ widget, data }: WidgetProps) {
  const [page, setPage] = useState(0);
  const mappings = widget.data.mappings;
  const values = (mappings.values ?? []).map((v: string | { field: string }) =>
    typeof v === "string" ? v : v.field
  );

  const fields =
    values.length > 0
      ? values
      : data.length > 0
        ? Object.keys(data[0])
        : [];

  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const pageData = useMemo(
    () => data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [data, page]
  );

  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="max-h-[280px] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              {fields.map((field) => (
                <th key={field} className="px-3 py-2 font-medium">
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => (
              <tr
                key={i}
                className="border-b last:border-0 hover:bg-muted/50"
              >
                {fields.map((field) => (
                  <td key={field} className="px-3 py-2 truncate max-w-[150px]">
                    {String(row[field] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="mt-auto flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <span>
            {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, data.length)} of{" "}
            {data.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded p-1 hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages - 1, p + 1))
              }
              disabled={page >= totalPages - 1}
              className="rounded p-1 hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(TableWidget, (prev, next) => {
  return prev.widget.id === next.widget.id && prev.data === next.data;
});
