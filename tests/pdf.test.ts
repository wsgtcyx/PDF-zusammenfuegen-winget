import { describe, expect, it } from "vitest";
import { PDFDocument, rgb } from "pdf-lib";

import {
  createMergedFileName,
  mergePdfBuffers,
  PdfMergeError,
  readPdfPageCount
} from "../src/shared/pdf";

const createPdf = async (pages: number, width: number) => {
  const document = await PDFDocument.create();

  for (let pageIndex = 0; pageIndex < pages; pageIndex += 1) {
    const page = document.addPage([width, 400 + pageIndex * 10]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 20,
      color: rgb(0.4, 0.2, 0.1)
    });
  }

  return document.save();
};

describe("pdf core", () => {
  it("führt mehrere PDFs in der richtigen Reihenfolge zusammen", async () => {
    const first = await createPdf(2, 300);
    const second = await createPdf(3, 420);

    const merged = await mergePdfBuffers([first, second]);
    const mergedDocument = await PDFDocument.load(merged);

    expect(mergedDocument.getPageCount()).toBe(5);
    expect(mergedDocument.getPage(0).getWidth()).toBe(300);
    expect(mergedDocument.getPage(2).getWidth()).toBe(420);
  });

  it("liefert eine lesbare Fehlermeldung für kaputte PDFs", async () => {
    await expect(mergePdfBuffers([new Uint8Array([1, 2, 3]), new Uint8Array([4, 5, 6])])).rejects.toThrow(
      PdfMergeError
    );
  });

  it("liest die Seitenanzahl einer gültigen PDF", async () => {
    const pdf = await createPdf(4, 360);
    await expect(readPdfPageCount(pdf)).resolves.toBe(4);
  });

  it("erzeugt einen sinnvollen Dateinamen", () => {
    expect(createMergedFileName(["angebot.pdf", "anhang.pdf"])).toBe(
      "angebot-zusammengefuegt.pdf"
    );
  });
});

