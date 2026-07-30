import { Vault } from "@intentius/chant-lexicon-fountain";

export const alice = new Vault({
  name: "alice",
  description: "Alice's GitHub credentials (currently the same as the env baseline)",
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
