import { useMemo, useState } from "react";

import type { DesktopApi, MergeResult, SelectedPdf } from "../shared/types";

type AppProps = {
  desktop?: DesktopApi;
};

const formatBytes = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
};

export const App = ({ desktop = window.desktop }: AppProps) => {
  const [files, setFiles] = useState<SelectedPdf[]>([]);
  const [isPicking, setIsPicking] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [notice, setNotice] = useState<string>("Wählen Sie mindestens zwei PDFs aus.");
  const [savedPath, setSavedPath] = useState<string>("");
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const totalPages = useMemo(
    () => files.reduce((sum, file) => sum + file.pageCount, 0),
    [files]
  );

  const canMerge = files.length >= 2 && !isMerging;

  const addFiles = async () => {
    setIsPicking(true);
    setSavedPath("");

    try {
      const nextFiles = await desktop.pickPdfFiles();
      if (nextFiles.length === 0) {
        setNotice("Keine neue PDF-Datei ausgewählt.");
        return;
      }

      setFiles((current) => {
        const knownPaths = new Set(current.map((entry) => entry.path));
        const uniqueFiles = nextFiles.filter((entry) => !knownPaths.has(entry.path));
        return [...current, ...uniqueFiles];
      });
      setNotice("Dateien geladen. Reihenfolge per Drag & Drop anpassen.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Dateien konnten nicht geladen werden.");
    } finally {
      setIsPicking(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
    setResult(null);
    setSavedPath("");
  };

  const moveFile = (fromId: string, toId: string) => {
    setFiles((current) => {
      const fromIndex = current.findIndex((entry) => entry.id === fromId);
      const toIndex = current.findIndex((entry) => entry.id === toId);

      if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
        return current;
      }

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const mergeFiles = async () => {
    setIsMerging(true);
    setResult(null);
    setSavedPath("");

    try {
      const mergeResult = await desktop.mergePdfs({ files });
      setResult(mergeResult);
      setNotice(
        `Fertig: ${mergeResult.pageCount} Seiten lokal zusammengeführt. Jetzt speichern.`
      );
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Zusammenführen fehlgeschlagen.");
    } finally {
      setIsMerging(false);
    }
  };

  const saveResult = async () => {
    if (!result) {
      return;
    }

    const saveResult = await desktop.saveMergedPdf(result.bytes, result.fileName);

    if (saveResult.canceled) {
      setNotice("Speichern wurde abgebrochen.");
      return;
    }

    setSavedPath(saveResult.path ?? "");
    setNotice("Die zusammengeführte PDF wurde erfolgreich gespeichert.");
  };

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand-card">
          <p className="eyebrow">Windows Desktop</p>
          <h1>PDF Zusammenfügen</h1>
          <p className="brand-copy">
            Lokales PDF-Merging für vertrauliche Dokumente. Keine Uploads. Kein Konto. Kein
            Wasserzeichen.
          </p>
          <button className="ghost-button" onClick={() => desktop.openHomepage()}>
            Homepage öffnen
          </button>
        </div>

        <div className="stats-card">
          <p className="eyebrow">Warum diese App</p>
          <ul className="stat-list">
            <li>
              <strong>100% lokal</strong>
              <span>Die Verarbeitung bleibt auf Ihrem Gerät.</span>
            </li>
            <li>
              <strong>DSGVO-orientiert</strong>
              <span>Keine Upload-Strecke für sensible Unterlagen.</span>
            </li>
            <li>
              <strong>Made for Alltag</strong>
              <span>Bewerbungen, Rechnungen, Anhänge, Verträge.</span>
            </li>
          </ul>
        </div>
      </aside>

      <main className="main">
        <section className="hero-card">
          <div>
            <p className="eyebrow">pdf zusammenfügen ohne upload</p>
            <h2>Ordnen. Zusammenführen. Lokal speichern.</h2>
            <p className="hero-copy">
              Wählen Sie mehrere PDF-Dateien, ändern Sie die Reihenfolge per Drag & Drop und
              speichern Sie das Ergebnis direkt auf Ihrem Rechner.
            </p>
          </div>

          <div className="hero-actions">
            <button className="primary-button" onClick={addFiles} disabled={isPicking}>
              {isPicking ? "PDFs werden geladen ..." : "PDF-Dateien auswählen"}
            </button>
            <button
              className="secondary-button"
              onClick={mergeFiles}
              disabled={!canMerge}
              data-testid="merge-button"
            >
              {isMerging ? "Zusammenführen läuft ..." : "Jetzt zusammenführen"}
            </button>
          </div>
        </section>

        <section className="board">
          <div className="board-header">
            <div>
              <p className="eyebrow">Merge Queue</p>
              <h3>Dateiliste</h3>
            </div>
            <div className="board-metrics">
              <span>{files.length} Dateien</span>
              <span>{totalPages} Seiten</span>
            </div>
          </div>

          <div className="notice" data-testid="notice">
            {notice}
          </div>

          <div className="file-list" data-testid="file-list">
            {files.length === 0 ? (
              <div className="empty-state">
                <p>Noch keine PDFs geladen.</p>
                <span>Die Reihenfolge Ihrer Auswahl bestimmt die spätere Struktur.</span>
              </div>
            ) : (
              files.map((file, index) => (
                <article
                  key={file.id}
                  className={`file-card ${draggedId === file.id ? "dragging" : ""}`}
                  draggable
                  onDragStart={() => setDraggedId(file.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggedId) {
                      moveFile(draggedId, file.id);
                    }
                    setDraggedId(null);
                  }}
                  onDragEnd={() => setDraggedId(null)}
                >
                  <div className="file-order">{String(index + 1).padStart(2, "0")}</div>
                  <div className="file-copy">
                    <strong>{file.name}</strong>
                    <span>
                      {file.pageCount} Seiten · {formatBytes(file.size)}
                    </span>
                  </div>
                  <button className="icon-button" onClick={() => removeFile(file.id)}>
                    Entfernen
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="result-grid">
          <article className="result-card">
            <p className="eyebrow">Ausgabe</p>
            <h3>Zusammengeführte Datei</h3>
            {result ? (
              <>
                <p className="result-name">{result.fileName}</p>
                <p className="result-copy">
                  {result.pageCount} Seiten · {formatBytes(result.bytes.byteLength)} · lokal erzeugt
                </p>
                <button className="primary-button" onClick={saveResult}>
                  Ergebnis speichern
                </button>
                {savedPath ? <p className="saved-path">{savedPath}</p> : null}
              </>
            ) : (
              <p className="result-placeholder">
                Sobald mindestens zwei PDFs bereitliegen, können Sie das lokale Merge starten.
              </p>
            )}
          </article>

          <article className="tips-card">
            <p className="eyebrow">Signal an Winget & GitHub</p>
            <h3>Branding mit klarem Homepage-Link</h3>
            <ul>
              <li>PublisherUrl: `https://pdfzus.de/`</li>
              <li>PackageUrl: `https://pdfzus.de/`</li>
              <li>README, Release und App verweisen auf die Startseite</li>
            </ul>
          </article>
        </section>
      </main>
    </div>
  );
};

