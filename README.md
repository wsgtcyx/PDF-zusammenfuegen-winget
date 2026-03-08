# PDF Zusammenfügen für Windows

Desktop-App für **lokales PDF Zusammenfügen** mit Fokus auf Datenschutz, Klarheit und Geschwindigkeit. Die App verarbeitet Dateien direkt auf dem Gerät, ohne Upload, ohne Konto und ohne Wasserzeichen.

- Homepage: [https://pdfzus.de/](https://pdfzus.de/)
- Keyword-Fokus: `pdf zusammenfügen`, `pdf verbinden`, `lokal`, `DSGVO`
- Positionierung: Made in Germany, ohne Upload, für sensible Dokumente und schnelle Alltags-Workflows

## Funktionsumfang

- Mehrere PDF-Dateien in einem Schritt auswählen
- Reihenfolge per Drag & Drop ändern
- Seitenanzahl und Dateigröße je Datei anzeigen
- Ergebnis lokal zusammenführen und an frei wählbarem Ort speichern
- Direkter Link zur Startseite von pdfzus.de aus der App

## Lokale Entwicklung

```bash
pnpm install
pnpm dev
```

Die Oberfläche läuft im Vite-Dev-Server. Electron lädt im Entwicklungsmodus automatisch `http://127.0.0.1:5173`.

## Build & Qualitätssicherung

```bash
pnpm verify
```

Das führt Typprüfung, Tests und Produktions-Build aus.

## Windows-Build

```bash
pnpm dist:win
```

Der Windows-Installer wird als `PDF-Zusammenfuegen-Setup-<version>.exe` unter `release/` erzeugt.

## Winget-Manifest

Das Repository enthält einen Generator für die Winget-Manifestdateien:

```bash
pnpm winget:manifest -- \
  --version 0.1.0 \
  --installer-url https://github.com/wsgtcyx/winget-PDF-zusammenfuegen/releases/download/v0.1.0/PDF-Zusammenfuegen-Setup-0.1.0.exe \
  --installer-sha256 <SHA256>
```

Die Ausgabe landet unter `winget/manifests/`.

## Release-Fluss

1. Tag `v<version>` pushen
2. GitHub Actions baut den NSIS-Installer auf `windows-latest`
3. Die Action erzeugt `SHA256SUMS.txt`
4. Das Release lädt Installer und Prüfsumme hoch
5. Die generierten Winget-Dateien können danach in `microsoft/winget-pkgs` als PR eingereicht werden

## Hinweise zum Branding

- `PublisherUrl` und `PackageUrl` zeigen auf [https://pdfzus.de/](https://pdfzus.de/)
- README, App-Text und Winget-Metadaten bleiben bewusst deutsch
- Kontakt: `support2@pdfzus.de`

