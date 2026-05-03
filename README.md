# aod-specs

Personal [Agent on Demand](https://github.com/ravi-hq/agent-on-demand-ex) specs — agents, environments, vaults — kept independent of the AoD codebase so the same manifest can be applied against any AoD instance (local dev, hosted prod, a sprite I just spun up).

## Apply

From the AoD project directory (so `./aod` is built):

```bash
GH_PAT=ghp_... HONEYCOMB_TOKEN=... POSTHOG_TOKEN=... \
RENDER_TOKEN=... ALICE_GH_PAT=ghp_... \
  AOD_BASE_URL=http://localhost:4000 AOD_TOKEN=... \
  ./aod apply -f /path/to/aod-specs/aod.yml
```

Or pass values inline with `--var KEY=VAL` flags. See `aod apply --help` for details on the substitution layers.

## Two layers of `${VAR}` substitution

Same syntax, different scopes:

1. **apply-time** — `secrets:` map values resolve from local env / `--var` flags. That's how this file stays free of literal tokens.
2. **provision-time** — every other `${VAR}` (e.g. `mcp_servers` headers) resolves at sprite spawn from the environment's secrets ∪ the conversation's vault.

For `secrets:` you can also use external resolvers if you have the relevant CLI installed:

- `op://<vault>/<item>/<field>` — 1Password CLI
- `bws://<secret-uuid>` — Bitwarden Secrets Manager CLI
- `infisical://<project?>/<env>/<path?>/<name>` — Infisical CLI

## Layout

- `aod.yml` — the manifest. Multi-document YAML with `Environment`, `Vault`, and `Agent` resources. Reconciled by name (`metadata.name` is the upsert key).

That's it. The format is documented in the AoD repo's [Manifest help page](https://github.com/ravi-hq/agent-on-demand-ex/blob/main/priv/help/manifest.md).
