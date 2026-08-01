# agent-specs

Personal [Fountain](https://github.com/BinaryBourbon/fountain) specs — agents, environments, vaults — kept independent of the Fountain codebase so the same manifest can be applied against any Fountain instance (local dev, hosted prod, a sprite I just spun up).

Declared as typed [chant](https://intentius.io/chant/) resources via the [fountain lexicon](https://intentius.io/chant/lexicons/fountain/) (`@intentius/chant-lexicon-fountain`) rather than hand-written YAML — real `import`/`export`, editor autocompletion, and build-time lint (dangling environment references, open networking, secret-shaped literals, etc.) before anything reaches the API.

## Layout

```
.
├── src/
│   ├── environments/      # one Environment per file
│   ├── vaults/            # one Vault per file
│   └── agents/
│       ├── teams/         # one folder per orchestrator (tech-lead, captain-picard, …)
│       └── specialists/   # one folder per discipline (engineering, growth, design, …)
├── chant.config.ts        # declares the fountain lexicon
├── scripts/apply.mjs      # applies dist/fountain.yaml via bulk POST /api/apply
└── .infisical.json        # binds this repo to the right Infisical project
```

`chant build` walks `src/`, type-checks and lints every declared `Environment` / `Vault` / `Agent`, and serializes them to `dist/fountain.yaml` (ejectable — `fountain apply -f dist/fountain.yaml` accepts it verbatim). `scripts/apply.mjs` resolves the manifest's `infisical://` secret URIs from the environment and sends it through fountain's bulk `POST /api/apply`.

## Install

```bash
npm install   # chant + the fountain lexicon
```

The `fountain` CLI itself is still needed for running conversations (`fountain run`, `fountain conv ...` — see below), not for applying this manifest:

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

Two separate credentials, for two separate tools:

- **`scripts/apply.mjs` (reconciling this manifest)** needs `FOUNTAIN_TOKEN` (and `FOUNTAIN_ENDPOINT` if not the hosted default) as environment variables — mint one via `POST /api/auth/token` or the account UI. Add `FOUNTAIN_TOKEN` to Infisical (env=`dev`) so `make apply` picks it up the same way it already does for `GITHUB_TOKEN` etc., or export it locally.
- **The `fountain` CLI (running conversations)** uses its own login, unrelated to the above:

  ```bash
  fountain auth login              # prompts for base URL + API key, writes ~/.fountain/credentials
  fountain auth whoami             # confirm
  ```

  For multi-instance setups use named profiles: `fountain auth login --profile <name>`, then `FOUNTAIN_PROFILE=<name> make run AGENT=... PROMPT=...` (or pass `--profile`).

## Apply

Secrets are pulled from Infisical (env=`dev`, root path) via the [Infisical CLI](https://infisical.com/docs/cli/overview). The `.infisical.json` in this repo binds it to the right project; sign in once and `make apply` resolves the rest.

```bash
infisical login   # one time
make apply        # → infisical run --env=dev -- npm run apply
                   #   (chant build --output dist/fountain.yaml --format json && node scripts/apply.mjs)
```

`npm run apply` is idempotent by name: create-if-new, update-by-name, and (opt-in, off by default) prune of chant-owned resources — every resource here carries the `managed-by: chant` metadata marker so ownership is unambiguous.

## Two layers of `${VAR}` substitution

Same syntax, different scopes:

1. **apply-time** — `secrets:` entries resolve from Infisical (`infisical://...`), local env, or `--var` flags. That's how this repo stays free of literal tokens.
2. **provision-time** — every other `${VAR}` (e.g. `mcp_servers` headers) resolves at sprite spawn from the environment's secrets ∪ the conversation's vault.

For `secrets:` you can also use other external resolvers if you have the relevant CLI installed:

- `op://<vault>/<item>/<field>` — 1Password CLI
- `bws://<secret-uuid>` — Bitwarden Secrets Manager CLI
- `infisical://<project?>/<env>/<path?>/<name>` — Infisical CLI (currently in use)

## Adding / editing a resource

Add or edit a `.ts` file in the matching `src/` subdirectory:

```ts
import { Environment } from "@intentius/chant-lexicon-fountain";

export const env = new Environment({
  name: "team-env",
  networking_type: "limited",
  networking_config: { allowed_hosts: ["github.com"] },
  metadata: { "managed-by": "chant" },
});
```

The filename is just for humans — the upsert key is the `name` passed to the constructor. Re-running `make apply` reconciles in place. `npx chant build` alone (no `--output`) is a fast way to lint a change without applying it.

The lexicon's own reference (fields, lint rules, secrets model, locked-sandbox posture) lives at [intentius.io/chant/lexicons/fountain](https://intentius.io/chant/lexicons/fountain/); the underlying manifest format is documented in the Fountain repo's [help pages](https://github.com/BinaryBourbon/fountain/tree/main/apps/fountain/priv/help).
