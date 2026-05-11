# agent-specs

Personal [Fountain](https://github.com/BinaryBourbon/fountain) specs — agents, environments, vaults — kept independent of the Fountain codebase so the same manifest can be applied against any Fountain instance (local dev, hosted prod, a sprite I just spun up).

## Layout

```
.
├── environments/      # one Environment per file
├── vaults/            # one Vault per file
├── agents/
│   ├── teams/         # one folder per orchestrator (tech-lead, captain-picard, …)
│   └── specialists/   # one folder per discipline (engineering, growth, design, …)
└── .infisical.json    # binds this repo to the right Infisical project
```

`fountain apply` walks the directory recursively, picks up every `*.yml` / `*.yaml` doc that has both `apiVersion` and `kind`, and ignores everything else. So you can drop a CI workflow, a stray README front matter, or anything else in the tree without it being misinterpreted.

## Install

Download the `fountain` CLI from the [latest release](https://github.com/BinaryBourbon/fountain/releases) (requires `gh`):

```bash
make install   # downloads fountain-darwin-arm64 to ~/.local/bin/fountain
```

Or grab a binary directly:

```bash
curl -L -o ~/.local/bin/fountain \
  https://github.com/BinaryBourbon/fountain/releases/latest/download/fountain-darwin-arm64
chmod +x ~/.local/bin/fountain
```

Linux + amd64 variants are attached to the same release.

## Authenticate

Point the CLI at your Fountain instance once:

```bash
fountain auth login              # prompts for base URL + API key, writes ~/.fountain/credentials
fountain auth whoami             # confirm
```

For multi-instance setups use named profiles: `fountain auth login --profile <name>`, then `FOUNTAIN_PROFILE=<name> make apply` (or pass `--profile`).

## Apply

Secrets are pulled from Infisical (env=`dev`, root path) via the [Infisical CLI](https://infisical.com/docs/cli/overview). The `.infisical.json` in this repo binds it to the right project; sign in once and `make apply` resolves the rest.

```bash
infisical login   # one time
make apply        # → infisical run --env=dev -- fountain apply -f .
```

If you need to override anything via local env or CLI flags, the `${VAR}` / `--var KEY=VAL` paths still work too. See `fountain apply --help`.

## Two layers of `${VAR}` substitution

Same syntax, different scopes:

1. **apply-time** — `secrets:` map values resolve from Infisical (`infisical://...`), local env, or `--var` flags. That's how this repo stays free of literal tokens.
2. **provision-time** — every other `${VAR}` (e.g. `mcp_servers` headers) resolves at sprite spawn from the environment's secrets ∪ the conversation's vault.

For `secrets:` you can also use other external resolvers if you have the relevant CLI installed:

- `op://<vault>/<item>/<field>` — 1Password CLI
- `bws://<secret-uuid>` — Bitwarden Secrets Manager CLI
- `infisical://<project?>/<env>/<path?>/<name>` — Infisical CLI (currently in use)

## Adding / editing a resource

Drop a new `*.yml` in the matching subdirectory. The filename is just for humans — the upsert key is `metadata.name` inside the file. Re-running `make apply` reconciles in place.

The manifest format is documented in the Fountain repo's [help pages](https://github.com/BinaryBourbon/fountain/tree/main/apps/fountain/priv/help).
