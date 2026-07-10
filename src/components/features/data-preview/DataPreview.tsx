"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Table2 } from "lucide-react";
import { useDataStore } from "@/stores/data-store";
import { cn } from "@/lib/utils";

export function DataPreview() {
  const dataset = useDataStore((s) => s.dataset);
  const [isOpen, setIsOpen] = useState(true);

  if (!dataset) return null;

  return (
    <div className="border-b bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-6 py-2 text-sm font-medium hover:bg-muted/50"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        <Table2 className="h-4 w-4 text-muted-foreground" />
        <span>{dataset.fileName}</span>
        <span className="text-muted-foreground">
          &middot; {dataset.rowCount} rows &middot;{" "}
          {dataset.columns.length} columns
        </span>
      </button>

      {isOpen && (
        <div className="max-h-48 overflow-auto border-t">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-muted/50">
                {dataset.columns.map((col) => (
                  <th
                    key={col.name}
                    className="whitespace-nowrap px-3 py-2 font-medium"
                  >
                    <div className="flex items-center gap-1">
                      {col.name}
                      <span
                        className={cn(
                          "rounded px-1 py-0.5 text-[10px]",
                          col.type === "number" &&
                            "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
                          col.type === "string" &&
                            "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                          col.type === "date" &&
                            "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
                          col.type === "boolean" &&
                            "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                        )}
                      >
                        {col.type}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataset.rows.slice(0, 5).map((row, i) => (
                <tr key={i} className="border-t hover:bg-muted/30">
                  {dataset.columns.map((col) => (
                    <td
                      key={col.name}
                      className="max-w-[200px] truncate px-3 py-2"
                    >
                      {String(row[col.name] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
