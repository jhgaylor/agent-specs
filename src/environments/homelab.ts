import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

// The homelab-builder's world: jhgaylor/home-cloud (the k3s estate's GitOps
// repo) mounted at /workspace/home-cloud, node 24 for the chant builds the
// control plane and in-repo apps need, python3 for the odd script. The
// deliverable is always git — a new app repo under BinaryBourbon plus a PR
// against home-cloud — so, like estate-medic's `home-cloud` env, this holds
// NO cluster credentials and no kubectl. Flux does the applying.
//
// The GITHUB_TOKEN here is BinaryBourbon's (not the jhgaylor default the
// other envs carry): the agent creates the app repo under that account and
// BinaryBourbon has write on jhgaylor/home-cloud, so no --vault is required
// to run this agent. The git identity entries mirror src/vaults/binarybourbon.ts
// (same keys, carried as env secrets like BEHOLD_URL is in home-cloud) so
// commits are attributed identically with or without the vault attached.
const homelab = new Environment({
  name: "homelab",
  packages: {
    node: "24",
    apt: ["jq", "make", "python3", "ripgrep"],
  },
  networking_type: "unrestricted",
  repositories: [
    new Repository({
      url: "https://github.com/jhgaylor/home-cloud",
      mount_path: "/workspace/home-cloud",
      secret_key: "GITHUB_TOKEN",
    }),
  ],
  secrets: [
    {
      key: "GITHUB_TOKEN",
      value: "infisical:///dev/BINARY_BOURBON_GITHUB_TOKEN",
    },
    { key: "GIT_AUTHOR_NAME", value: "BinaryBourbon" },
    { key: "GIT_AUTHOR_EMAIL", value: "214316198+BinaryBourbon@users.noreply.github.com" },
    { key: "GIT_COMMITTER_NAME", value: "BinaryBourbon" },
    { key: "GIT_COMMITTER_EMAIL", value: "214316198+BinaryBourbon@users.noreply.github.com" },
  ],
  metadata: {
    "managed-by": "chant",
  },
});

export { homelab };
