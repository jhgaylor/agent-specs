import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

export const fountain = new Environment({
  name: "fountain",
  packages: {
    apt: [
      "jq",
    ],
  },
  networking_type: "unrestricted",
  repositories: [
    new Repository({
      url: "https://github.com/BinaryBourbon/fountain",
      mount_path: "/workspace/fountain",
      secret_key: "GITHUB_TOKEN",
    }),
  ],
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
