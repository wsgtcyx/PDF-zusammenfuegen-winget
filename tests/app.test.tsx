import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../src/renderer/App";
import type { DesktopApi, MergeResult, SelectedPdf } from "../src/shared/types";

const selectedFiles: SelectedPdf[] = [
  {
    id: "1",
    name: "anschreiben.pdf",
    path: "/tmp/anschreiben.pdf",
    size: 120_000,
    pageCount: 1
  },
  {
    id: "2",
    name: "lebenslauf.pdf",
    path: "/tmp/lebenslauf.pdf",
    size: 220_000,
    pageCount: 2
  }
];

const mergeResult: MergeResult = {
  fileName: "bewerbung-zusammengefuegt.pdf",
  bytes: new Uint8Array([1, 2, 3, 4]),
  pageCount: 3
};

const createDesktopMock = (): DesktopApi => ({
  pickPdfFiles: vi.fn().mockResolvedValue(selectedFiles),
  mergePdfs: vi.fn().mockResolvedValue(mergeResult),
  saveMergedPdf: vi.fn().mockResolvedValue({
    canceled: false,
    path: "C:\\Users\\andy\\Documents\\bewerbung-zusammengefuegt.pdf"
  }),
  openHomepage: vi.fn()
});

describe("App", () => {
  it("deaktiviert den Merge-Button ohne mindestens zwei Dateien", () => {
    const desktop = createDesktopMock();
    render(<App desktop={desktop} />);

    expect(screen.getByTestId("merge-button")).toBeDisabled();
  });

  it("lädt Dateien, aktiviert Merge und speichert das Ergebnis", async () => {
    const desktop = createDesktopMock();
    render(<App desktop={desktop} />);

    fireEvent.click(screen.getByText("PDF-Dateien auswählen"));

    await waitFor(() => {
      expect(screen.getByText("anschreiben.pdf")).toBeInTheDocument();
      expect(screen.getByTestId("merge-button")).toBeEnabled();
    });

    fireEvent.click(screen.getByTestId("merge-button"));

    await waitFor(() => {
      expect(screen.getByText("bewerbung-zusammengefuegt.pdf")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Ergebnis speichern"));

    await waitFor(() => {
      expect(
        screen.getByText("C:\\Users\\andy\\Documents\\bewerbung-zusammengefuegt.pdf")
      ).toBeInTheDocument();
    });
  });
});

