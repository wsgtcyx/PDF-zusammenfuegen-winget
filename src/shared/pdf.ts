import { PDFDocument } from "pdf-lib";

export class PdfMergeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfMergeError";
  }
}

const toUint8Array = (input: Uint8Array | ArrayBuffer) =>
  input instanceof Uint8Array ? input : new Uint8Array(input);

export const readPdfPageCount = async (input: Uint8Array | ArrayBuffer) => {
  try {
    const document = await PDFDocument.load(toUint8Array(input), {
      ignoreEncryption: true
    });

    return document.getPageCount();
  } catch {
    throw new PdfMergeError("Die PDF-Datei konnte nicht gelesen werden.");
  }
};

export const mergePdfBuffers = async (inputs: Array<Uint8Array | ArrayBuffer>) => {
  if (inputs.length < 2) {
    throw new PdfMergeError("Bitte mindestens zwei PDF-Dateien auswählen.");
  }

  const mergedDocument = await PDFDocument.create();

  for (const input of inputs) {
    let sourceDocument: PDFDocument;

    try {
      sourceDocument = await PDFDocument.load(toUint8Array(input), {
        ignoreEncryption: true
      });
    } catch {
      throw new PdfMergeError("Mindestens eine PDF-Datei ist beschädigt oder ungültig.");
    }

    const pageIndices = sourceDocument
      .getPages()
      .map((_, index) => index);
    const copiedPages = await mergedDocument.copyPages(sourceDocument, pageIndices);

    copiedPages.forEach((page) => mergedDocument.addPage(page));
  }

  return mergedDocument.save();
};

export const createMergedFileName = (fileNames: string[]) => {
  const firstBaseName = fileNames[0]?.replace(/\.pdf$/i, "") || "merge";
  return `${firstBaseName}-zusammengefuegt.pdf`;
};

