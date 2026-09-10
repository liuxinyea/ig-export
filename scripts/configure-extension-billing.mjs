// Generates public extension configuration; never copies server credentials.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../extension/", import.meta.url);
const url = new URL(process.env.EXTENSION_BILLING_ORIGIN || "https://igexport.auraflame.tech");
if (url.protocol !== "https:" && !(url.hostname === "localhost" && url.protocol === "http:")) throw new Error("Use HTTPS (or localhost for development).");
const configFile = new URL("license-config.js", root);
const previous = await readFile(configFile, "utf8");
const previousOrigin = previous.match(/BILLING_ORIGIN = "([^"]+)"/)?.[1];
const manifestFile = new URL("manifest.json", root);
const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
manifest.optional_host_permissions = manifest.optional_host_permissions.filter((host) => host !== `${previousOrigin}/*`);
manifest.optional_host_permissions.push(`${url.origin}/*`);
await writeFile(configFile, `// Public configuration only. Never put Dodo API credentials in the extension.\nexport const BILLING_ORIGIN = ${JSON.stringify(url.origin)};\n`);
await writeFile(manifestFile, JSON.stringify(manifest, null, 2) + "\n");
console.info(`Configured ${fileURLToPath(configFile)} for ${url.origin}`);
