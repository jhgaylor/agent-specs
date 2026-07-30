import { Vault } from "@intentius/chant-lexicon-fountain";

export const jhgaylor = new Vault({
  name: "jhgaylor",
  description: "jhgaylor's GitHub credentials and git identity",
  secrets: [
    {
      key: "GITHUB_TOKEN",
      value: "infisical:///dev/JHGAYLOR_GITHUB_TOKEN",
    },
    {
      key: "GIT_AUTHOR_NAME",
      value: "jhgaylor",
    },
    {
      key: "GIT_AUTHOR_EMAIL",
      value: "1731794+jhgaylor@users.noreply.github.com",
    },
    {
      key: "GIT_COMMITTER_NAME",
      value: "jhgaylor",
    },
    {
      key: "GIT_COMMITTER_EMAIL",
      value: "1731794+jhgaylor@users.noreply.github.com",
    },
  ],
  metadata: {
    "managed-by": "chant",
  },
});
