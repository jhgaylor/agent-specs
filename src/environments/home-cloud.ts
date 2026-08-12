import { Environment } from "@intentius/chant-lexicon-fountain";

// The estate-medic's world: read-only behold telemetry plus the toolchain to
// rebuild home-cloud's chant projects for a fix PR. Deliberately NO cluster
// credentials and no kubectl — the only write path out of this environment
// is a GitHub pull request.
//
// BEHOLD_PROXY_TOKEN must match the bearer token on the behold proxy
// (phase 2: scripts/proxy.mjs on the workstation; phase 3: the in-cluster
// GET-only proxy). BEHOLD_URL arrives in the dispatch prompt while the
// tunnel URL is still minted per-run; it moves in here once behold has a
// stable hostname.
const homeCloud = new Environment({
  name: "home-cloud",
  packages: {
    apt: ["jq", "make"],
  },
  networking_type: "unrestricted",
  secrets: [
    {
      key: "BEHOLD_PROXY_TOKEN",
      value: "infisical:///dev/BEHOLD_PROXY_TOKEN",
    },
  ],
  metadata: {
    "managed-by": "chant",
  },
});

export { homeCloud as "home-cloud" };
