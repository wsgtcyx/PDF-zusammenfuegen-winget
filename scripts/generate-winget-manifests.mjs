import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  args.set(process.argv[index], process.argv[index + 1]);
}

const version = args.get("--version");
const installerUrl = args.get("--installer-url");
const installerSha256 = args.get("--installer-sha256");
const packageIdentifier = args.get("--package-identifier") || "pdfzus.PDFZusammenfuegen";
const outputDir =
  args.get("--out-dir") ||
  path.join(process.cwd(), "winget", "manifests", "p", "pdfzus", "PDFZusammenfuegen", version ?? "");

if (!version || !installerUrl || !installerSha256) {
  console.error(
    "Verwendung: node scripts/generate-winget-manifests.mjs --version <v> --installer-url <url> --installer-sha256 <hash>"
  );
  process.exit(1);
}

const packageJson = JSON.parse(
  await readFile(path.join(process.cwd(), "package.json"), "utf8")
);

const publisher = "pdfzus";
const packageName = "PDF Zusammenfügen";
const manifestVersion = "1.10.0";
const createdBy = "# Created by pdfzus winget manifest generator";

await mkdir(outputDir, { recursive: true });

const baseName = packageIdentifier.split(".").slice(-1)[0];

const versionManifest = `${createdBy}
# yaml-language-server: $schema=https://aka.ms/winget-manifest.version.${manifestVersion}.schema.json

PackageIdentifier: ${packageIdentifier}
PackageVersion: ${version}
DefaultLocale: de-DE
ManifestType: version
ManifestVersion: ${manifestVersion}
`;

const localeManifest = `${createdBy}
# yaml-language-server: $schema=https://aka.ms/winget-manifest.defaultLocale.${manifestVersion}.schema.json

PackageIdentifier: ${packageIdentifier}
PackageVersion: ${version}
PackageLocale: de-DE
Publisher: ${publisher}
PublisherUrl: https://pdfzus.de/
PublisherSupportUrl: https://pdfzus.de/
PrivacyUrl: https://pdfzus.de/privacy-policy
Author: pdfzus
PackageName: ${packageName}
PackageUrl: https://pdfzus.de/
License: ${packageJson.license}
ShortDescription: Lokales Tool zum PDF Zusammenfügen ohne Upload, ohne Konto und ohne Wasserzeichen.
Description: PDF Zusammenfügen fuer Windows verbindet mehrere PDF-Dateien direkt auf dem Geraet. Die App ist auf Datenschutz, DSGVO-orientierte Workflows und einen schnellen lokalen Export ausgelegt.
Moniker: pdfzus
Tags:
  - pdf
  - pdf-zusammenfuegen
  - pdf-verbinden
  - merge
  - lokal
  - dsgvo
  - ohne-upload
ReleaseNotes: Erste Desktop-Version fuer lokales PDF Zusammenfuegen unter Windows.
ReleaseNotesUrl: https://github.com/wsgtcyx/PDF-zusammenfuegen-winget/releases/tag/v${version}
ManifestType: defaultLocale
ManifestVersion: ${manifestVersion}
`;

const installerManifest = `${createdBy}
# yaml-language-server: $schema=https://aka.ms/winget-manifest.installer.${manifestVersion}.schema.json

PackageIdentifier: ${packageIdentifier}
PackageVersion: ${version}
InstallerType: nullsoft
Scope: user
InstallModes:
  - interactive
  - silent
  - silentWithProgress
UpgradeBehavior: install
ReleaseDate: ${new Date().toISOString().slice(0, 10)}
Installers:
  - Architecture: x64
    InstallerUrl: ${installerUrl}
    InstallerSha256: ${installerSha256.toUpperCase()}
ManifestType: installer
ManifestVersion: ${manifestVersion}
`;

await writeFile(
  path.join(outputDir, `${packageIdentifier}.yaml`),
  versionManifest,
  "utf8"
);
await writeFile(
  path.join(outputDir, `${packageIdentifier}.locale.de-DE.yaml`),
  localeManifest,
  "utf8"
);
await writeFile(
  path.join(outputDir, `${packageIdentifier}.installer.yaml`),
  installerManifest,
  "utf8"
);

console.log(`Winget-Manifeste geschrieben: ${outputDir}`);
console.log(`Basisname: ${baseName}`);
