import type { ParseResult } from "./csv";

interface TextItem {
  str: string;
  transform: number[];
}

export async function parsePDFBankStatement(file: File): Promise<ParseResult> {
  const pdfjsLib = await import("pdfjs-dist");
  
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const rawLines: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items as TextItem[];

    // Group items by Y coordinate (rows)
    const lineMap = new Map<number, TextItem[]>();

    for (const item of items) {
      if (!item.str || !item.str.trim()) continue;
      // Y-coord is item.transform[5] rounded to nearest 3px for line grouping
      const y = Math.round((item.transform[5] || 0) / 3) * 3;
      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      lineMap.get(y)!.push(item);
    }

    // Sort Y coordinates top to bottom (descending Y in PDF coordinates)
    const sortedY = Array.from(lineMap.keys()).sort((a, b) => b - a);

    for (const y of sortedY) {
      const lineItems = lineMap.get(y)!;
      // Sort items left to right (ascending X: item.transform[4])
      lineItems.sort((a, b) => (a.transform[4] || 0) - (b.transform[4] || 0));
      const lineText = lineItems.map((it) => it.str.trim()).join("  ");
      if (lineText) {
        rawLines.push(lineText);
      }
    }
  }

  // Regex patterns for transaction line matching
  const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{0,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/i;
  const amountRegex = /(?:[$£€]\s*)?-?\d{1,3}(?:,\d{3})*(?:\.\d{2})\b(?:\s*(?:CR|DR))?/gi;

  const rows: Record<string, unknown>[] = [];

  for (const line of rawLines) {
    const dateMatch = line.match(dateRegex);
    if (!dateMatch) continue;

    const dateStr = dateMatch[0];
    const amounts = Array.from(line.matchAll(amountRegex)).map((m) => m[0]);

    if (amounts.length === 0) continue;

    // Remove date and amounts from line to extract description
    let descStr = line.replace(dateRegex, "");
    for (const amt of amounts) {
      descStr = descStr.replace(amt, "");
    }
    descStr = descStr.replace(/\s+/g, " ").trim();

    if (!descStr) descStr = "Bank Transaction";

    // Clean numeric amounts
    const parseAmt = (str: string): number => {
      const isNegative = str.includes("-") || str.toUpperCase().includes("DR");
      const numStr = str.replace(/[$£€,\sCRDR-]/gi, "");
      const val = parseFloat(numStr);
      if (isNaN(val)) return 0;
      return isNegative ? -val : val;
    };

    let amount = 0;
    let debit = 0;
    let credit = 0;
    let balance: number | undefined = undefined;

    if (amounts.length === 1) {
      amount = parseAmt(amounts[0]);
      if (amount < 0) debit = Math.abs(amount);
      else credit = amount;
    } else if (amounts.length === 2) {
      const val1 = parseAmt(amounts[0]);
      const val2 = parseAmt(amounts[1]);
      amount = val1;
      balance = val2;
      if (val1 < 0) debit = Math.abs(val1);
      else credit = val1;
    } else if (amounts.length >= 3) {
      const val1 = parseAmt(amounts[0]);
      const val2 = parseAmt(amounts[1]);
      const val3 = parseAmt(amounts[amounts.length - 1]);
      debit = Math.abs(val1);
      credit = val2;
      amount = credit > 0 ? credit : -debit;
      balance = val3;
    }

    rows.push({
      Date: dateStr,
      Description: descStr,
      Amount: amount,
      Debit: debit,
      Credit: credit,
      Balance: balance,
    });
  }

  // Fallback if no specific structured transactions matched: parse line-by-line fallback
  if (rows.length === 0 && rawLines.length > 0) {
    rawLines.forEach((line, idx) => {
      rows.push({
        LineNumber: idx + 1,
        Content: line,
      });
    });
    return {
      columns: ["LineNumber", "Content"],
      rows,
      errors: [],
    };
  }

  return {
    columns: ["Date", "Description", "Amount", "Debit", "Credit", "Balance"],
    rows,
    errors: [],
  };
}
