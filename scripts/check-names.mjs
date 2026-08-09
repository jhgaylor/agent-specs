// Guards the one mismatch that fails silently.
//
// chant derives a resource's logical name from the identifier it's exported
// under, and that logical name — not the `name` passed to the constructor —
// is what `fountainApply` upserts on and what cross-resource references
// serialize to. When the two disagree, the apply still succeeds: it just
// creates a *second* resource under the export name rather than updating the
// intended one. That's how this estate once forked into a full parallel
// camelCase copy of itself (`general-purpose-engineer` + `generalPurposeEngineer`).
//
// Nothing upstream catches it, so catch it here: parse the built manifest with
// the applier's own parser and refuse to ship a manifest whose two names
// disagree. Fix by exporting under the resource's own name:
//
//   const techLead = new Agent({ name: "tech-lead", ... });
//   export { techLead as "tech-lead" };
import { readFileSync } from "node:fs";
import { parseManifest } from "@intentius/chant-lexicon-fountain/op/activities";

const manifestPath = process.argv[2] ?? "dist/fountain.yaml";
const problems = [];

for (const resource of parseManifest(readFileSync(manifestPath, "utf8"))) {
  const declared = resource.spec.name;
  if (typeof declared !== "string" || declared === "") {
    problems.push(`  ${resource.kind} exported as \`${resource.name}\` declares no name`);
  } else if (declared !== resource.name) {
    problems.push(
      `  ${resource.kind} "${declared}" is exported as \`${resource.name}\` — ` +
        `applying this would create a second resource named "${resource.name}". ` +
        `Fix: export { ${resource.name} as "${declared}" };`,
    );
  }
}

if (problems.length > 0) {
  console.error(
    `${manifestPath}: ${problems.length} resource(s) whose export name and declared name disagree:\n` +
      problems.join("\n"),
  );
  process.exit(1);
}
