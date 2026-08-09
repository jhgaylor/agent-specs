import { Environment } from "@intentius/chant-lexicon-fountain";

// Environment for the `guild-implementer` worker — Guild's autonomous
// implementation agent (see jhgaylor/guild/agents/guild-implementer.yml).
//
// Mirrors `eng`: the Sprite base image provides the same Erlang/Elixir/mix/git
// toolchain that the engineering specialists used to build Guild itself, so
// the worker that ships Guild PRs needs nothing extra at the env level.
// Separate env (rather than reusing `eng`) so Guild's runtime dependencies
// can evolve without coupling to the generic engineering env.
const guildWorker = new Environment({
  name: "guild-worker",
  packages: {
    apt: [
      "jq",
    ],
  },
  networking_type: "unrestricted",
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

export { guildWorker as "guild-worker" };
