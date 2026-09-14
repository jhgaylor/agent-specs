import { Environment } from "@intentius/chant-lexicon-fountain";

// The support-triager's world: GitHub only. It reads the private inbox
// BinaryBourbon/fountain-support-issues and files/links issues on the
// product repos (fountain, fountain-team, home-cloud). No checkouts — the
// triager reasons from the report, the repos' issue trackers and, when it
// needs code, the GitHub MCP's file reads. The token is jhgaylor's, which is
// a collaborator on the inbox and has write on the three product repos.
const support = new Environment({
  name: "support",
  packages: {
    apt: ["jq", "gh"],
  },
  networking_type: "unrestricted",
  env_vars: {
    SUPPORT_INBOX_REPO: "BinaryBourbon/fountain-support-issues",
  },
  secrets: [
    { key: "GITHUB_TOKEN", value: "infisical:///dev/GITHUB_TOKEN" },
    { key: "GH_TOKEN", value: "infisical:///dev/GITHUB_TOKEN" },
  ],
  metadata: { "managed-by": "chant" },
});

export { support as "support" };
