import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

const threeDModels = new Environment({
  name: "3d-models",
  packages: {
    apt: [
      "openscad",
      "jq",
    ],
  },
  networking_type: "unrestricted",
  repositories: [
    new Repository({
      url: "https://github.com/jhgaylor/3d-models",
      mount_path: "/workspace/3d-models",
      secret_key: "GITHUB_TOKEN",
    }),
  ],
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

export { threeDModels as "3d-models" };
