import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

// The team-lead's world: the Fountain API (FOUNTAIN_BASE_URL + FOUNTAIN_TOKEN
// are injected into every sandbox by Fountain itself — the team routes accept
// that token), jq to read it, gh to look things up, and a read-only checkout
// of jhgaylor/agent-specs so the lead can read any teammate's actual spec
// instead of remembering it. It holds no repo write tokens on purpose: the
// lead delegates; it does not ship.
const teamOps = new Environment({
  name: "team-ops",
  packages: {
    apt: ["jq", "ripgrep", "gh"],
  },
  networking_type: "unrestricted",
  repositories: [
    new Repository({
      url: "https://github.com/jhgaylor/agent-specs",
      mount_path: "/workspace/agent-specs",
      secret_key: "GITHUB_TOKEN",
    }),
  ],
  secrets: [
    { key: "GITHUB_TOKEN", value: "infisical:///dev/GITHUB_TOKEN" },
    { key: "GH_TOKEN", value: "infisical:///dev/GITHUB_TOKEN" },
  ],
  metadata: { "managed-by": "chant" },
});

export { teamOps as "team-ops" };
