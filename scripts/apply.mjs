// Applies `dist/fountain.yaml` (written by `npm run build`) to the fountain
// API via chant's native applier, which compiles the manifest into
// fountain's bulk `POST /api/apply` request. Requires FOUNTAIN_TOKEN (and
// optionally FOUNTAIN_ENDPOINT) in the environment — mint a token with
// `POST /api/auth/token` or the account UI. `make apply` supplies these
// through infisical the same way it already does for GITHUB_TOKEN etc.
import { readFileSync } from "node:fs";
import { fountainApply } from "@intentius/chant-lexicon-fountain";

// fountainApply sends secret values verbatim — unlike the old
// `fountain apply` CLI it does not resolve infisical:// URIs, so applying
// the manifest as-is would write the literal URI strings into fountain as
// secrets. `make apply` runs under `infisical run --env=dev`, which injects
// every referenced secret into this process's environment; substitute into
// the manifest here and pass it inline so secret values never touch disk.
// (JSON.stringify output is a valid YAML double-quoted scalar.)
const manifest = readFileSync("dist/fountain.yaml", "utf8");

// Keys we substituted, so the preflight below can validate the credentials
// we're about to write into fountain — a dead token upserts silently and
// only fails hours later inside an agent's sandbox (seen live: a revoked
// GitHub PAT in the jhgaylor vault stalled a whole incident run).
const usedKeys = new Set();

const resolved = manifest.replace(
  /"infisical:\/\/\/([^/"]+)\/([A-Za-z0-9_]+)"/g,
  (uri, envName, key) => {
    const value = process.env[key];
    if (!value) {
      throw new Error(
        `secret reference ${uri} cannot resolve: ${key} is not set in the ` +
          `environment — run via \`make apply\` so infisical injects it`,
      );
    }
    usedKeys.add(key);
    return JSON.stringify(value);
  },
);

// Preflight: any GitHub token we're about to store must actually authenticate.
// Skippable (SKIP_TOKEN_PREFLIGHT=1) for offline applies, but on by default —
// catching a revoked PAT here costs one API call; catching it in production
// costs a stalled agent and a confusing debug session.
if (process.env.SKIP_TOKEN_PREFLIGHT !== "1") {
  const githubKeys = [...usedKeys].filter((k) => k.includes("GITHUB_TOKEN"));
  for (const key of githubKeys) {
    const res = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${process.env[key]}`, "User-Agent": "agent-specs-apply" },
    }).catch((e) => {
      throw new Error(`token preflight: ${key} — network error reaching GitHub: ${e.message}`);
    });
    if (!res.ok) {
      throw new Error(
        `token preflight: ${key} failed GitHub auth (${res.status}). The value in ` +
          `infisical /dev is dead — mint a fresh PAT, \`infisical secrets set ${key}=…\`, ` +
          `then re-run. (SKIP_TOKEN_PREFLIGHT=1 to bypass.)`,
      );
    }
    const login = (await res.json()).login;
    console.log(`token preflight: ${key} → GitHub user ${login} ✓`);
  }
}

// The serializer double-quotes URI-shaped strings today; if that ever
// changes, fail here rather than uploading a literal infisical:// URI.
const leftover = resolved.match(/infisical:\/\/[^\s"']+/);
if (leftover) {
  throw new Error(`unresolved secret reference in manifest: ${leftover[0]}`);
}

// Prune deletes chant-owned resources (`managed-by: chant`) that the manifest
// no longer declares. Off unless asked for: an incomplete build would
// otherwise read as "delete everything I didn't emit". Hand-made resources
// carry no ownership marker and are never touched.
const prune = process.env.PRUNE === "1" || process.argv.includes("--prune");

const summary = await fountainApply({ manifestContent: resolved, prune });

console.log(`created: ${summary.created.length}`);
for (const name of summary.created) console.log(`  + ${name}`);
console.log(`updated: ${summary.updated.length}`);
for (const name of summary.updated) console.log(`  ~ ${name}`);
if (summary.pruned.length > 0) {
  console.log(`pruned: ${summary.pruned.length}`);
  for (const name of summary.pruned) console.log(`  - ${name}`);
}
console.log(`secrets upserted: ${summary.secretsUpserted}`);
