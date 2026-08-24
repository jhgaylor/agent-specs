import { Environment, Repository } from "@intentius/chant-lexicon-fountain";

// The fountain-maintainer's world: BinaryBourbon/fountain mounted at
// /workspace/fountain with a working Elixir toolchain and a local Postgres,
// so the agent can compile, run the suite, and `mix precommit` before it
// opens a PR. The repo pins OTP 28 / Elixir 1.19.2 via mise; Debian's apt
// packages are a release behind, which satisfies the umbrella's own
// `elixir: "~> 1.18"` and is fine for running the suite locally — CI on the
// PR is the real gate, and the agent is told to treat it that way. mise is
// not an option here: its erlang backend builds OTP from source with kerl,
// and fountain gives a setup_script 120 seconds.
//
// `erlang-nox`, never `erlang`. The bare metapackage pulls all of OTP,
// which on a headless sandbox meant 322 packages: GTK 3, wxWidgets (webview
// included), Mesa with the Vulkan drivers, Wayland, X11, fonts and an icon
// theme for erlang-wx/erlang-observer, plus a full OpenJDK JRE for
// erlang-jinterface and emacsen-common for erlang-mode. Four minutes of
// install, against a hardcoded 300s package-stage timeout it kept losing to.
// Git is the only write path: no prod credentials, no kubeconfig.
const fountainDev = new Environment({
  name: "fountain-dev",
  packages: {
    apt: ["jq", "ripgrep", "make", "erlang-nox", "elixir", "postgresql", "postgresql-contrib", "inotify-tools", "golang-go"],
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
    // The major moves with Debian (18 at the time of writing, 17 before it),
    // so ask pg_lsclusters rather than naming it.
    "sudo service postgresql start || sudo pg_ctlcluster --skip-systemctl-redirect $(pg_lsclusters -h | awk 'NR==1{print $1, $2}') start || true",
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
