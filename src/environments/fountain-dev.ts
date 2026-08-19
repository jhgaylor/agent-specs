import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

// The fountain-maintainer's world: BinaryBourbon/fountain mounted at
// /workspace/fountain with a working Elixir toolchain and a local Postgres,
// so the agent can compile, run the suite, and `mix precommit` before it
// opens a PR. The repo pins OTP 28 / Elixir 1.19.2 via mise; Debian's apt
// packages are a release behind, which is fine for running the suite
// locally — CI on the PR is the real gate, and the agent is told to treat it
// that way. Git is the only write path: no prod credentials, no kubeconfig.
const fountainDev = new Environment({
  name: "fountain-dev",
  packages: {
    apt: ["jq", "ripgrep", "make", "erlang", "elixir", "postgresql", "postgresql-contrib", "inotify-tools", "golang-go"],
  },
  networking_type: "unrestricted",
  repositories: [
    new Repository({
      url: "https://github.com/BinaryBourbon/fountain",
      mount_path: "/workspace/fountain",
      secret_key: "GITHUB_TOKEN",
    }),
  ],
  env_vars: {
    DATABASE_URL: "postgres://postgres:postgres@localhost:5432/fountain_dev",
    MASTER_SECRETS_KEY: "dev-only-master-key-not-a-secret-0000000000000000",
    MIX_ENV: "dev",
  },
  setup_script: [
    "set -e",
    "sudo service postgresql start || sudo pg_ctlcluster --skip-systemctl-redirect 17 main start || true",
    "sudo -u postgres psql -tc \"ALTER USER postgres PASSWORD 'postgres'\" >/dev/null 2>&1 || true",
    "cd /workspace/fountain",
    "mix local.hex --force >/dev/null && mix local.rebar --force >/dev/null",
    "mix deps.get >/dev/null 2>&1 || true",
    "echo 'fountain-dev: toolchain ready; run `mix setup` then `mix test` in /workspace/fountain'",
  ].join("\n"),
  secrets: [
    { key: "GITHUB_TOKEN", value: "infisical:///dev/GITHUB_TOKEN" },
  ],
  metadata: { "managed-by": "chant" },
});

export { fountainDev as "fountain-dev" };
