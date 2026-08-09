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
    return JSON.stringify(value);
  },
);

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
