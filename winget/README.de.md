# Winget-Einreichung

Die eigentlichen Winget-Dateien werden erst nach einem echten GitHub Release mit finalem Installer-Hash erzeugt.

## Generator

```bash
pnpm winget:manifest -- \
  --version 0.1.1 \
  --installer-url https://github.com/wsgtcyx/PDF-zusammenfuegen-winget/releases/download/v0.1.1/PDF-Zusammenfuegen-Setup-0.1.1.exe \
  --installer-sha256 <SHA256>
```

## Zielstruktur

Die Dateien landen unter:

```text
winget/manifests/p/pdfzus/PDFZusammenfuegen/<version>/
```

## Geplante Metadaten

- `PackageIdentifier`: `pdfzus.PDFZusammenfuegen`
- `Publisher`: `pdfzus`
- `PackageName`: `PDF Zusammenfügen`
- `PublisherUrl`: `https://pdfzus.de/`
- `PackageUrl`: `https://pdfzus.de/`
- Sprache: `de-DE`

## PR gegen microsoft/winget-pkgs

Nach dem Release:

1. Fork von `microsoft/winget-pkgs` anlegen
2. generierte Dateien in die passende Manifest-Struktur kopieren
3. `winget validate` lokal ausführen
4. PR mit genau einem Paket und genau einer Version einreichen
