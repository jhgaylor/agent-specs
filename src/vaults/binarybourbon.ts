import { Vault } from "@intentius/chant-lexicon-fountain";

export const binarybourbon = new Vault({
  name: "binarybourbon",
  description: "Binary Bourbons's GitHub credentials and git identity",
  secrets: [
    {
      key: "GITHUB_TOKEN",
      value: "infisical:///dev/BINARY_BOURBON_GITHUB_TOKEN",
    },
    {
      key: "GIT_AUTHOR_NAME",
      value: "BinaryBourbon",
    },
    {
      key: "GIT_AUTHOR_EMAIL",
      value: "214316198+BinaryBourbon@users.noreply.github.com",
    },
    {
      key: "GIT_COMMITTER_NAME",
      value: "BinaryBourbon",
    },
    {
      key: "GIT_COMMITTER_EMAIL",
      value: "214316198+BinaryBourbon@users.noreply.github.com",
    },
  ],
  metadata: {
    "managed-by": "chant",
  },
});
