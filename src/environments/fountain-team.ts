import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

// The fountain-team-dev's world: jhgaylor/fountain-team at /workspace/fountain-team
// (Vite + React + TypeScript, bun toolchain — bun is in the sandbox base image)
// and a read-only checkout of BinaryBourbon/fountain beside it, because the
// client is built against that API and docs/api.md is the contract. Deploys
// happen on merge to main (GitHub Pages), so the deliverable is a PR.
const fountainTeam = new Environment({
  name: "fountain-team",
  packages: {
    node: "24",
    apt: ["jq", "ripgrep"],
  },
  networking_type: "unrestricted",
  repositories: [
    new Repository({
      url: "https://github.com/jhgaylor/fountain-team",
      mount_path: "/workspace/fountain-team",
      secret_key: "GITHUB_TOKEN",
    }),
    new Repository({
      url: "https://github.com/BinaryBourbon/fountain",
      mount_path: "/workspace/fountain",
      secret_key: "GITHUB_TOKEN",
    }),
  ],
  setup_script: [
    "set -e",
    "cd /workspace/fountain-team && (command -v bun >/dev/null && bun install || npm install)",
    "echo 'fountain-team-dev ready: bun test / bun run typecheck / bun run build'",
  ].join("\n"),
  secrets: [
    { key: "GITHUB_TOKEN", value: "infisical:///dev/GITHUB_TOKEN" },
  ],
  metadata: { "managed-by": "chant" },
});

export { fountainTeam as "fountain-team" };
