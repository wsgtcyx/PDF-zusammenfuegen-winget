import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , installerPath] = process.argv;

if (!installerPath) {
  console.error("Verwendung: node scripts/write-sha256.mjs <installer-path>");
  process.exit(1);
}

const fileBuffer = await readFile(installerPath);
const hash = createHash("sha256").update(fileBuffer).digest("hex").toUpperCase();
const outputPath = path.join(path.dirname(installerPath), "SHA256SUMS.txt");
const fileName = path.basename(installerPath);

await writeFile(outputPath, `${hash}  ${fileName}\n`, "utf8");
console.log(outputPath);

