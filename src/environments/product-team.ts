import { Environment } from "@intentius/chant-lexicon-fountain";

const productTeam = new Environment({
  name: "product-team",
  packages: {
    apt: [
      "jq",
      "ripgrep",
    ],
  },
  networking_type: "unrestricted",
  secrets: [
    {
      key: "GITHUB_TOKEN",
      value: "infisical:///dev/GITHUB_TOKEN",
    },
    {
      key: "HONEYCOMB_API_KEY",
      value: "infisical:///dev/HONEYCOMB_API_KEY",
    },
    {
      key: "POSTHOG_API_KEY",
      value: "infisical:///dev/POSTHOG_API_KEY",
    },
    {
      key: "RENDER_API_KEY",
      value: "infisical:///dev/RENDER_API_KEY",
    },
  ],
  metadata: {
    "managed-by": "chant",
  },
});

export { productTeam as "product-team" };
