// Reconciles `dist/fountain-plan.json` (written by `npm run build`) against
// the fountain API via chant's native applier. Requires FOUNTAIN_TOKEN
// (and optionally FOUNTAIN_ENDPOINT) in the environment — mint a token with
// `POST /api/auth/token` or the account UI. `make apply` supplies these
// through infisical the same way it already does for GITHUB_TOKEN etc.
import { fountainApply } from "@intentius/chant-lexicon-fountain";

const summary = await fountainApply({ planPath: "dist/fountain-plan.json" });

console.log(`created: ${summary.created.length}`);
for (const name of summary.created) console.log(`  + ${name}`);
console.log(`updated: ${summary.updated.length}`);
for (const name of summary.updated) console.log(`  ~ ${name}`);
if (summary.pruned.length > 0) {
  console.log(`pruned: ${summary.pruned.length}`);
  for (const name of summary.pruned) console.log(`  - ${name}`);
}
console.log(`secrets upserted: ${summary.secretsUpserted}`);
