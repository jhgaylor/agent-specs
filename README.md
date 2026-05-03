# aod-specs

Personal [Agent on Demand](https://github.com/ravi-hq/agent-on-demand-ex) specs — agents, environments, vaults — kept independent of the AoD codebase so the same manifest can be applied against any AoD instance (local dev, hosted prod, a sprite I just spun up).

## Apply

Secrets are pulled from Infisical (env=`dev`, root path) via the [Infisical CLI](https://infisical.com/docs/cli/overview). The `.infisical.json` in this repo binds it to the right project; sign in once and `./aod apply` resolves the rest.

```bash
infisical login                    # one time

# From the AoD project directory (so `./aod` is built):
AOD_BASE_URL=http://localhost:4000 AOD_TOKEN=... \
  ./aod apply -f /path/to/aod-specs/aod.yml
```

If you need to override anything via local env or CLI flags, the `${VAR}` / `--var KEY=VAL` paths still work too. See `aod apply --help`.

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
