// Reconciles `dist/fountain-plan.json` (written by `npm run build`) against
// the fountain API via chant's native applier. Requires FOUNTAIN_TOKEN
// (and optionally FOUNTAIN_ENDPOINT) in the environment — mint a token with
// `POST /api/auth/token` or the account UI. `make apply` supplies these
// through infisical the same way it already does for GITHUB_TOKEN etc.
import { readFileSync } from "node:fs";
import { fountainApply } from "@intentius/chant-lexicon-fountain";

// fountainApply upserts secret values verbatim — unlike the old
// `fountain apply` CLI it does not resolve infisical:// URIs, so applying
// the plan as-is writes the literal URI strings into fountain as secrets.
// `make apply` runs under `infisical run --env=dev`, which injects every
// referenced secret into this process's environment; substitute here and
// pass the resolved plan inline so secret values never touch disk.
const plan = JSON.parse(readFileSync("dist/fountain-plan.json", "utf8"));
const INFISICAL_URI = /^infisical:\/\/\/([^/]+)\/(.+)$/;

for (const [name, entry] of Object.entries(plan)) {
  for (const secret of entry.spec?.secrets ?? []) {
    const match = INFISICAL_URI.exec(secret.value ?? "");
    if (!match) continue;
    const [, envName, key] = match;
    const resolved = process.env[key];
    if (!resolved) {
      throw new Error(
        `${name}: secret ${secret.key} references infisical:///${envName}/${key}, ` +
          `but ${key} is not set in the environment — run via \`make apply\` so infisical injects it`,
      );
    }
    secret.value = resolved;
  }
}

const summary = await fountainApply({ planContent: JSON.stringify(plan) });

console.log(`created: ${summary.created.length}`);
for (const name of summary.created) console.log(`  + ${name}`);
console.log(`updated: ${summary.updated.length}`);
for (const name of summary.updated) console.log(`  ~ ${name}`);
if (summary.pruned.length > 0) {
  console.log(`pruned: ${summary.pruned.length}`);
  for (const name of summary.pruned) console.log(`  - ${name}`);
}
console.log(`secrets upserted: ${summary.secretsUpserted}`);
