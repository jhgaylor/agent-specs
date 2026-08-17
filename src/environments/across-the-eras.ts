import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

// The show-curator's world: the across-the-eras repo mounted at
// /workspace/across-the-eras, node 24 (the repo's validators + MCP tests need
// it) and python3 (the repo's scripts/ and the TVmaze fetchers). Networking is
// unrestricted because the only data source is api.tvmaze.com and the deliverable
// is a GitHub PR; the env holds nothing worth exfiltrating beyond GITHUB_TOKEN.
const acrossTheEras = new Environment({
  name: "across-the-eras",
  packages: {
    node: "24",
    apt: ["python3", "jq"],
  },
  networking_type: "unrestricted",
  repositories: [
    new Repository({
      url: "https://github.com/jhgaylor/across-the-eras",
      mount_path: "/workspace/across-the-eras",
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

export { acrossTheEras as "across-the-eras" };
