import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

// The home-cloud-steward's world when it runs on one of Jake's own machines
// (a Fountain self-hosted runner, ADR 0022): the same repo and git identity
// as `homelab`, but NO apt packages — a runner is a directory on a Mac, the
// daemon does not translate apt to brew, and the machine already has node,
// jq, git and gh. What the runner buys is the tailnet: the agent can reach
// the cluster's Tailscale-only services (behold, Longhorn UI, Infisical,
// the Traefik dashboard) that a cloud sandbox cannot — read-only, to look.
// The posture is unchanged: git is the only apply path, Flux applies, a
// human merges; and trusted mode is what it says (no VM between the agent
// and the machine), so this env carries nothing it would be a disaster to
// leak beyond what `homelab` already does.
//
// The agent that uses it is pinned to the runner with
// `sandbox_provider: "runner"` — set over the API after apply
// (PUT /api/agents/:id) because the chant lexicon does not type the field
// yet; a manifest apply leaves it alone.
const homeCloudLocal = new Environment({
  name: "home-cloud-local",
  networking_type: "unrestricted",
  repositories: [
    new Repository({
      url: "https://github.com/jhgaylor/home-cloud",
      // Under the home dir, not /workspace: on a runner `/home/sprite` maps to
      // the sandbox directory on the machine; a bare `/workspace/...` is an
      // absolute path on a Mac that does not exist and cannot be created.
      mount_path: "/home/sprite/home-cloud",
      secret_key: "GITHUB_TOKEN",
    }),
  ],
  secrets: [
    { key: "GITHUB_TOKEN", value: "infisical:///dev/BINARY_BOURBON_GITHUB_TOKEN" },
    { key: "GH_TOKEN", value: "infisical:///dev/BINARY_BOURBON_GITHUB_TOKEN" },
    { key: "GIT_AUTHOR_NAME", value: "BinaryBourbon" },
    { key: "GIT_AUTHOR_EMAIL", value: "214316198+BinaryBourbon@users.noreply.github.com" },
    { key: "GIT_COMMITTER_NAME", value: "BinaryBourbon" },
    { key: "GIT_COMMITTER_EMAIL", value: "214316198+BinaryBourbon@users.noreply.github.com" },
    { key: "BEHOLD_URL", value: "https://behold-agent.inevitable.fyi" },
    { key: "BEHOLD_PROXY_TOKEN", value: "infisical:///dev/BEHOLD_PROXY_TOKEN" },
  ],
  metadata: { "managed-by": "chant" },
});

export { homeCloudLocal as "home-cloud-local" };
