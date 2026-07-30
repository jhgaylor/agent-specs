import { Environment } from "@intentius/chant-lexicon-fountain";

export const plain = new Environment({
  name: "plain",
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
