import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

const theProduct = new Environment({
  name: "the-product",
  packages: {
    apt: [
      "jq",
      "ripgrep",
    ],
  },
  networking_type: "unrestricted",
  repositories: [
    new Repository({
      url: "https://github.com/BinaryBourbon/the-product",
      mount_path: "/workspace/the-product",
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

export { theProduct as "the-product" };
