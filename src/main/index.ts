import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { IPC_CHANNELS } from "../shared/ipc";
import {
  createMergedFileName,
  mergePdfBuffers,
  PdfMergeError,
  readPdfPageCount
} from "../shared/pdf";
import type { MergeRequest, MergeResult, SaveResult, SelectedPdf } from "../shared/types";

const HOMEPAGE_URL = "https://pdfzus.de/";

const isDev = !app.isPackaged;

const createMainWindow = async () => {
  const window = new BrowserWindow({
    width: 1420,
    height: 940,
    minWidth: 1120,
    minHeight: 760,
    backgroundColor: "#f5eee2",
    title: "PDF Zusammenfügen",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.argv.includes("--smoke-test")) {
    window.once("ready-to-show", () => {
      console.log("smoke-test-ok");
      app.exit(0);
    });
  }

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await window.loadURL(process.env.VITE_DEV_SERVER_URL);
    return window;
  }

  await window.loadFile(path.join(__dirname, "../../dist/index.html"));
  return window;
};

const toSelectedPdf = async (filePath: string): Promise<SelectedPdf> => {
  const [fileStat, bytes] = await Promise.all([stat(filePath), readFile(filePath)]);
  const pageCount = await readPdfPageCount(bytes);

  return {
    id: randomUUID(),
    name: path.basename(filePath),
    path: filePath,
    size: fileStat.size,
    pageCount
  };
};

const registerIpcHandlers = () => {
  ipcMain.handle(IPC_CHANNELS.pickPdfFiles, async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [{ name: "PDF", extensions: ["pdf"] }]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return [];
    }

    return Promise.all(result.filePaths.map((filePath) => toSelectedPdf(filePath)));
  });

  ipcMain.handle(
    IPC_CHANNELS.mergePdfs,
    async (_event, input: MergeRequest): Promise<MergeResult> => {
      const files = input.files ?? [];

      if (files.length < 2) {
        throw new PdfMergeError("Bitte mindestens zwei PDF-Dateien auswählen.");
      }

      const buffers = await Promise.all(files.map((file) => readFile(file.path)));
      const bytes = await mergePdfBuffers(buffers);
      const pageCount = await readPdfPageCount(bytes);

      return {
        fileName: createMergedFileName(files.map((file) => file.name)),
        bytes,
        pageCount
      };
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.saveMergedPdf,
    async (_event, bytes: Uint8Array, suggestedName: string): Promise<SaveResult> => {
      const result = await dialog.showSaveDialog({
        defaultPath: suggestedName,
        filters: [{ name: "PDF", extensions: ["pdf"] }]
      });

      if (result.canceled || !result.filePath) {
        return { canceled: true };
      }

      await mkdir(path.dirname(result.filePath), { recursive: true });
      await writeFile(result.filePath, bytes);

      return {
        canceled: false,
        path: result.filePath
      };
    }
  );

  ipcMain.on(IPC_CHANNELS.openHomepage, () => {
    void shell.openExternal(HOMEPAGE_URL);
  });
};

app.whenReady().then(async () => {
  registerIpcHandlers();
  await createMainWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

