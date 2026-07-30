import { Environment } from "@intentius/chant-lexicon-fountain";

export const eng = new Environment({
  name: "eng",
  packages: {
    apt: [
      "jq",
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
