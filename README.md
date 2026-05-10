# aod-specs

Personal [Agent on Demand](https://github.com/ravi-hq/agent-on-demand-ex) specs — agents, environments, vaults — kept independent of the AoD codebase so the same manifest can be applied against any AoD instance (local dev, hosted prod, a sprite I just spun up).

## Layout

```
.
├── environments/      # one Environment per file
├── vaults/            # one Vault per file
├── agents/
│   ├── teams/         # one folder per orchestrator (tech-lead, product-tech-lead, …)
│   └── specialists/   # one folder per discipline (engineering, growth, design, …)
└── .infisical.json    # binds this repo to the right Infisical project
```

`aod apply` walks the directory recursively, picks up every `*.yml` / `*.yaml` doc that has both `apiVersion` and `kind`, and ignores everything else. So you can drop a CI workflow, a stray README front matter, or anything else in the tree without it being misinterpreted.

## Install

Download the `aod` CLI from the (private) [aod-ex releases](https://github.com/jhgaylor/aod-ex/releases) — requires `gh` authenticated against the repo:

```bash
gh release download v0.1.1 --repo jhgaylor/aod-ex --pattern 'aod-macos-aarch64' -O ~/.local/bin/aod --clobber && chmod +x ~/.local/bin/aod
```

## Apply

Secrets are pulled from Infisical (env=`dev`, root path) via the [Infisical CLI](https://infisical.com/docs/cli/overview). The `.infisical.json` in this repo binds it to the right project; sign in once and `./aod apply` resolves the rest.

```bash
infisical login                    # one time

# From the AoD project directory (so `./aod` is built):
AOD_BASE_URL=http://localhost:4000 AOD_TOKEN=... \
  ./aod apply /path/to/aod-specs/
```

If you need to override anything via local env or CLI flags, the `${VAR}` / `--var KEY=VAL` paths still work too. See `aod apply --help`.

## Two layers of `${VAR}` substitution

Same syntax, different scopes:

1. **apply-time** — `secrets:` map values resolve from Infisical (`infisical://...`), local env, or `--var` flags. That's how this repo stays free of literal tokens.
2. **provision-time** — every other `${VAR}` (e.g. `mcp_servers` headers) resolves at sprite spawn from the environment's secrets ∪ the conversation's vault.

For `secrets:` you can also use other external resolvers if you have the relevant CLI installed:

- `op://<vault>/<item>/<field>` — 1Password CLI
- `bws://<secret-uuid>` — Bitwarden Secrets Manager CLI
- `infisical://<project?>/<env>/<path?>/<name>` — Infisical CLI (currently in use)

## Adding / editing a resource

Drop a new `*.yml` in the matching subdirectory. The filename is just for humans — the upsert key is `metadata.name` inside the file. Re-running `aod apply` reconciles in place.

The format is documented in the AoD repo's [Manifest help page](https://github.com/ravi-hq/agent-on-demand-ex/blob/main/priv/help/manifest.md).
