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
│       └── specialists/   # one folder per discipline (engineering, growth, design, content, …)
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

Prune deletes chant-owned resources the manifest no longer declares; hand-made resources have no ownership marker and are never touched. It's off by default so a partial build can't read as "delete everything I didn't emit":

```bash
PRUNE=1 make apply
```

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

const env = new Environment({
  name: "team-env",
  networking_type: "limited",
  networking_config: { allowed_hosts: ["github.com"] },
  metadata: { "managed-by": "chant" },
});

export { env as "team-env" };
```

**The export name is the upsert key — always export under the resource's own name.** chant derives each resource's logical name from the exporting identifier, and that logical name (not the `name` you pass to the constructor) is what `fountainApply` sends as the upsert key and what cross-resource references serialize to. Since a fountain name like `team-env` isn't a valid JS identifier, bind the constructor to a camelCase `const` and re-export it under the literal name; importers use the matching `import { "team-env" as env } from "…"`.

Nothing upstream catches a mismatch — exporting as `export const teamEnv = …` type-checks, lints, and applies cleanly, it just creates a *second* resource named `teamEnv` alongside `team-env` instead of updating it. The whole estate diverged that way once, so `scripts/check-names.mjs` runs as part of `npm run build` and fails the build (and therefore the apply) if any resource's export name and declared name disagree.

The filename is just for humans. Re-running `make apply` reconciles in place. `npx chant build` alone (no `--output`) is a fast way to lint a change without applying it.

The lexicon's own reference (fields, lint rules, secrets model, locked-sandbox posture) lives at [intentius.io/chant/lexicons/fountain](https://intentius.io/chant/lexicons/fountain/); the underlying manifest format is documented in the Fountain repo's [help pages](https://github.com/BinaryBourbon/fountain/tree/main/apps/fountain/priv/help).

## Jake's team

`src/agents/teams/jake/team-lead.ts` is the gateway teammate — it knows the
roster below and drives it over the Fountain team API from inside its own
sandbox (every sandbox gets `FOUNTAIN_BASE_URL`/`FOUNTAIN_TOKEN`; the
`/api/team` routes accept that token). The rest of the roster:

| teammate | for | env |
|---|---|---|
| `fountain-maintainer` | BinaryBourbon/fountain — fixes, features, API, docs → PRs | `fountain-dev` (repo + Erlang/Elixir/Postgres) |
| `fountain-team-dev` | jhgaylor/fountain-team — the web client → PRs | `fountain-team` (repo + node; fountain read-only beside it) |
| `home-cloud-steward` | jhgaylor/home-cloud day-to-day → PRs for Flux | `home-cloud-local`, **on the runner** (see below) |
| `homelab-builder` | a new app for the estate → repo + onboarding PR | `homelab` |
| `estate-medic` | incidents → diagnose via behold, fix PR | `home-cloud` |
| `support-triager` | the support inbox → issues on the right repo; every 30 min | `support` |
| `pr-reviewer` | reviews PRs | `eng` |

Build the team after `make apply` (names are the upsert keys):

```bash
for n in team-lead fountain-maintainer fountain-team-dev home-cloud-steward homelab-builder estate-medic support-triager pr-reviewer; do
  id=$(curl -s "$FOUNTAIN_ENDPOINT/api/agents" -H "Authorization: Bearer $FOUNTAIN_TOKEN" | jq -r --arg n "$n" '.data[] | select(.name==$n) | .id')
  curl -s -X POST "$FOUNTAIN_ENDPOINT/api/team" -H "Authorization: Bearer $FOUNTAIN_TOKEN" -H 'content-type: application/json' -d "{\"agent_id\":\"$id\"}"
done
```

**Runner pin.** `home-cloud-steward` runs on a self-hosted runner (Jake's
machine, tailnet access). The chant lexicon does not type `sandbox_provider`
yet, so it is set over the API after apply and survives later applies:

```bash
curl -X PUT "$FOUNTAIN_ENDPOINT/api/agents/<home-cloud-steward id>" -H "Authorization: Bearer $FOUNTAIN_TOKEN" \
  -H 'content-type: application/json' -d '{"sandbox_provider":"runner"}'
```

Its env mounts the repo under `/home/sprite/home-cloud` — on a runner
`/home/sprite` maps to the sandbox directory; a bare `/workspace/...` is an
absolute path that does not exist on a Mac.

The triager's routine: `POST /api/team/<support-triager id>/schedules`
`{"name":"Triage the support inbox","cron":"*/30 * * * *","prompt":"Run your triage pass over the support inbox now. If there is nothing open and untriaged, reply with one line saying so."}`.

