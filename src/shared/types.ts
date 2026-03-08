export type SelectedPdf = {
  id: string;
  name: string;
  path: string;
  size: number;
  pageCount: number;
};

export type MergeRequest = {
  files: SelectedPdf[];
};

export type MergeResult = {
  fileName: string;
  bytes: Uint8Array;
  pageCount: number;
};

export type SaveResult = {
  canceled: boolean;
  path?: string;
};

export type DesktopApi = {
  pickPdfFiles: () => Promise<SelectedPdf[]>;
  mergePdfs: (input: MergeRequest) => Promise<MergeResult>;
  saveMergedPdf: (bytes: Uint8Array, suggestedName: string) => Promise<SaveResult>;
  openHomepage: () => void;
};

