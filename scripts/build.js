// Genera dist/: la web estática + el dominio + la configuración + version.json.
// Es el ÚNICO artefacto que recorre el pipeline (build once, deploy many).
import { cpSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "node:fs";
import { execSync } from "node:child_process";

const DIST = "dist";
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync("public", DIST, { recursive: true });
cpSync("src", `${DIST}/src`, { recursive: true });
cpSync("config", `${DIST}/config`, { recursive: true });

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
let sha = process.env.GITHUB_SHA;
if (!sha) {
  try { sha = execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { sha = "local"; }
}
const version = {
  version: pkg.version,
  sha,
  construidoEn: new Date().toISOString(),
  ejecucion: process.env.GITHUB_RUN_NUMBER || null,
};
writeFileSync(`${DIST}/version.json`, JSON.stringify(version, null, 2) + "\n");
console.log(`dist/ generado · v${version.version} · ${sha.slice(0, 7)}`);
