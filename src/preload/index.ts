import { contextBridge, ipcRenderer } from "electron";

import { IPC_CHANNELS } from "../shared/ipc";
import type { DesktopApi, MergeRequest } from "../shared/types";

const desktopApi: DesktopApi = {
  pickPdfFiles: () => ipcRenderer.invoke(IPC_CHANNELS.pickPdfFiles),
  mergePdfs: (input: MergeRequest) => ipcRenderer.invoke(IPC_CHANNELS.mergePdfs, input),
  saveMergedPdf: (bytes, suggestedName) =>
    ipcRenderer.invoke(IPC_CHANNELS.saveMergedPdf, bytes, suggestedName),
  openHomepage: () => ipcRenderer.send(IPC_CHANNELS.openHomepage)
};

contextBridge.exposeInMainWorld("desktop", desktopApi);

