import { Environment } from "@intentius/chant-lexicon-fountain";

// The estate-medic's world: read-only behold telemetry plus the toolchain to
// rebuild home-cloud's chant projects for a fix PR. Deliberately NO cluster
// credentials and no kubectl — the only write path out of this environment
// is a GitHub pull request.
//
// BEHOLD_PROXY_TOKEN must match the bearer token on the in-cluster GET-only
// proxy (apps/behold in home-cloud). BEHOLD_URL is now the stable public
// hostname of that proxy — the per-run cloudflared quick tunnel is retired,
// so the dispatch prompt no longer mints a URL. The agent reads BEHOLD_URL
// straight from its environment.
const homeCloud = new Environment({
  name: "home-cloud",
  packages: {
    apt: ["jq", "make"],
  },
  networking_type: "unrestricted",
  secrets: [
    // The token estate-medic opens its fix PR with (and its github MCP needs at
    // provision — a missing key fails the sandbox outright). Carried here so
    // the agent runs as a teammate without a vault; a vault still wins on
    // collision for anyone who wants a different identity.
    {
      key: "GITHUB_TOKEN",
      value: "infisical:///dev/GITHUB_TOKEN",
    },
    {
      key: "BEHOLD_PROXY_TOKEN",
      value: "infisical:///dev/BEHOLD_PROXY_TOKEN",
    },
    {
      key: "BEHOLD_URL",
      value: "https://behold-agent.inevitable.fyi",
    },
  ],
  metadata: {
    "managed-by": "chant",
  },
});

export { homeCloud as "home-cloud" };
