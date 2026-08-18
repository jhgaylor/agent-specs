import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

// Phoenix/LiveView on Elixir 1.19 + Erlang/OTP 28. Debian's `elixir` package is
// several majors behind, so the toolchain comes from mise at the versions the
// repo's own Dockerfile pins. `mix test` needs a live Postgres, hence the
// server package and the cluster start below.
export const jobban = new Environment({
  name: "jobban",
  packages: {
    apt: [
      "jq",
      "curl",
      "git",
      "build-essential",
      "postgresql",
    ],
  },
  setup_script: `curl -fsSL https://mise.run | sh
export PATH="$HOME/.local/bin:$PATH"
mise use -g -y erlang@28.1.1 elixir@1.19.5
eval "$(mise activate bash --shims)"
service postgresql start
su postgres -c "psql -c \\"ALTER USER postgres PASSWORD 'postgres';\\""
cd /workspace/jobban && mix local.hex --force && mix local.rebar --force && mix deps.get`,
  networking_type: "unrestricted",
  repositories: [
    new Repository({
      url: "https://github.com/jhgaylor/jobban",
      mount_path: "/workspace/jobban",
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
