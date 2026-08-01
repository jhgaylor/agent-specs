// Applies `dist/fountain.yaml` (written by `npm run build`) to the fountain
// API via the bulk `POST /api/apply` endpoint. Requires FOUNTAIN_TOKEN (and
// optionally FOUNTAIN_ENDPOINT) in the environment — mint a token with
// `POST /api/auth/token` or the account UI. `make apply` supplies these
// through infisical the same way it already does for GITHUB_TOKEN etc.
//
// Two deviations from just calling the lexicon's fountainApply:
//
// 1. Secret resolution: fountainApply sends secret values verbatim — unlike
//    the old `fountain apply` CLI it does not resolve infisical:// URIs.
//    `make apply` runs under `infisical run --env=dev`, which injects every
//    referenced secret into this process's environment; we substitute here
//    so secret values never touch disk.
//
// 2. We build and POST the /api/apply body ourselves instead of calling
//    fountainApply({manifestContent}): as of 0.33.1 the lexicon's
//    parseManifest chokes on the serializer's own output (chant's parseYAML
//    can't parse list items written as a bare `-` on its own line, so every
//    resource arrives with an empty name and the server 422s). Switch back
//    to fountainApply once that round-trip is fixed upstream.
import { readFileSync } from "node:fs";
import { parseAllDocuments } from "yaml";
import { DEFAULT_FOUNTAIN_BASE_URL } from "@intentius/chant-lexicon-fountain";

const KINDS = new Set(["Environment", "Vault", "Agent"]);
const INFISICAL_URI = /^infisical:\/\/\/([^/]+)\/(.+)$/;

function resolveSecretValue(value) {
  const match = INFISICAL_URI.exec(value ?? "");
  if (!match) return value;
  const [, envName, key] = match;
  const resolved = process.env[key];
  if (!resolved) {
    throw new Error(
      `secret reference infisical:///${envName}/${key} cannot resolve: ${key} is ` +
        `not set in the environment — run via \`make apply\` so infisical injects it`,
    );
  }
  return resolved;
}

const manifest = readFileSync("dist/fountain.yaml", "utf8");
const resources = parseAllDocuments(manifest)
  .map((doc) => doc.toJS())
  .filter((doc) => doc && KINDS.has(doc.kind))
  .map((doc) => {
    const { secrets, ...spec } = doc.spec ?? {};
    if (Array.isArray(secrets)) {
      // Authored shape is an ordered {key, value}[]; the wire wants a
      // {KEY: value} map. Resolve infisical:// URIs along the way.
      spec.secrets = Object.fromEntries(
        secrets.filter((s) => s?.key).map((s) => [s.key, resolveSecretValue(s.value)]),
      );
    }
    return { kind: doc.kind, name: doc.metadata?.name ?? "", spec };
  });

const base = process.env.FOUNTAIN_ENDPOINT || DEFAULT_FOUNTAIN_BASE_URL;
const res = await fetch(`${base}/api/apply`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.FOUNTAIN_TOKEN ?? ""}`,
  },
  body: JSON.stringify({ resources }),
});
if (res.status !== 200) {
  throw new Error(`POST /api/apply failed (${res.status}): ${(await res.text()).slice(0, 2000)}`);
}

const { data } = await res.json();
const summary = { created: [], updated: [], secretsUpserted: 0 };
const failures = [];
for (const r of data?.results ?? []) {
  const label = `${r.kind}/${r.name}`;
  if (r.action === "created") summary.created.push(label);
  else if (r.action === "updated") summary.updated.push(label);
  else failures.push(`${label}: ${JSON.stringify(r.errors)}`);
  for (const s of r.secrets ?? []) {
    if (s.action === "upserted") summary.secretsUpserted += 1;
    else failures.push(`${label} secret "${s.key}": ${JSON.stringify(s.errors)}`);
  }
}
if (failures.length > 0) {
  throw new Error(`${failures.length} failure(s):\n  ${failures.join("\n  ")}`);
}

console.log(`created: ${summary.created.length}`);
for (const name of summary.created) console.log(`  + ${name}`);
console.log(`updated: ${summary.updated.length}`);
for (const name of summary.updated) console.log(`  ~ ${name}`);
console.log(`secrets upserted: ${summary.secretsUpserted}`);
