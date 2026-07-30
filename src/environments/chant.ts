import { Environment } from "@intentius/chant-lexicon-fountain";

export const chant = new Environment({
  name: "chant",
  packages: {
    apt: [
      "jq",
    ],
  },
  setup_script: "npm install -g @intentius/chant-lexicon-k8s",
  networking_type: "unrestricted",
  secrets: [
    {
      key: "GITHUB_TOKEN",
      value: "infisical:///dev/GITHUB_TOKEN",
    },
  ],
  metadata: {
    "managed-by": "chant",
  },
});
