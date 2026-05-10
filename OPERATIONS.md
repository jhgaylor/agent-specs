# Operations

How to actually drive the team. The agents and environments in this repo define the *capabilities*; this doc covers how a human operator uses them to do work.

If you're new to the setup, read this first, then [`README.md`](./README.md) for the manifest mechanics.

## Authentication: always pass `--vault binarybourbon`

The `the-product` environment mounts `BinaryBourbon/the-product`, but the env's baseline `GITHUB_TOKEN` is jhgaylor's (from `infisical:///dev/GITHUB_TOKEN`) — which has no write access to BinaryBourbon. Without the vault, the tech-lead can clone the repo (it's public) but cannot push branches, open PRs, or merge.

The [`vaults/binarybourbon.yml`](./vaults/binarybourbon.yml) vault overrides `GITHUB_TOKEN` per conversation with a BinaryBourbon-scoped PAT. **Pass `--vault binarybourbon` on every `aod run` into this team** — otherwise the orchestrator hits `Permission denied to jhgaylor` on its first push.

```bash
aod run tech-lead --vault binarybourbon -p "..."
```

### Vaults do not auto-inherit on spawn

This is the non-obvious part. The `--vault` flag only sets the vault on the *one* conversation you're starting. When the orchestrator spawns a specialist via the bundled `aod` skill, the spawned conversation runs with its own env's baseline secrets unless the orchestrator explicitly includes `vault_id` in the spawn body.

The tech-lead's system prompt instructs it to resolve the `binarybourbon` vault id once per conversation and pass `vault_id` on every spawn. If a specialist returns `Permission denied to jhgaylor` despite the orchestrator running with the right vault, the spawn was missing `vault_id` — push back on the orchestrator: `"check the spawn body — did you include vault_id?"`

## Pass 1 — boot + loop test

The goal of this pass is to verify the substrate works. Don't bet real product work on it until Pass 1 is green.

### 1. Apply the manifest

From this repo's root:

```bash
make apply                                # reconciles env, vault, and agent
aod env list    | grep the-product        # should appear
aod vault list  | grep binarybourbon      # should appear
aod agent list  | grep tech-lead          # should appear
```

If `make apply` errors on Infisical secret resolution, your `infisical login` session lapsed — re-run it.

### 2. No-dispatch smoke test

Use full `/workspace/the-product/...` paths in user prompts. Bare filenames get resolved against the agent's CWD (`/home/sprite/`), not the repo. Force the orchestrator to load state but not act:

```bash
aod run tech-lead --vault binarybourbon -p \
  "read /workspace/the-product/OPERATING_MODEL.md and /workspace/the-product/ROADMAP.md. summarize what you understand about your role and what you'd dispatch next. do NOT dispatch — just describe."
```

Three things to verify in the response:

1. It found the files (it quotes or paraphrases them accurately).
2. It understands the gate model (mentions G0).
3. Its proposed next move matches `ROADMAP.md` (a `customer-researcher` dispatch on `phase-0-framing`).

If any of those is wrong, the system prompt or the bus repo needs tightening before you spend money on real dispatches.

### 3. Trivial-loop test

Verify the full chain works on a throwaway task:

```bash
aod run tech-lead --vault binarybourbon -p \
  "we're loop-testing. dispatch a general-purpose-engineer to add a one-line CONTRIBUTING.md to BinaryBourbon/the-product (just a pointer to /workspace/the-product/OPERATING_MODEL.md). write the brief at /workspace/the-product/plan/loop-test/engineer-brief.md, dispatch via aod skill (remember vault_id), then stop and report the conversation id."
```

Watch from another shell:

```bash
aod conv list --status RUNNING            # tech-lead + the spawned engineer
aod conv stream <engineer-conv-id>        # tail the engineer's work
```

What you're verifying:

- A brief was written under `plan/` in the bus repo.
- The engineer cloned `BinaryBourbon/the-product` and pushed a branch.
- A PR is open against `main`.
- The tech-lead picks it up on a follow-up turn (you'll need to prompt: `aod conv prompt <tech-lead-id> -p "any specialists returned? integrate."`) and merges.

If this works, the substrate is sound. If it deadlocks, fix that before Pass 2.

## Pass 2 — first real cycle (phase 0)

### 4. Begin framing

```bash
aod run tech-lead --vault binarybourbon -p \
  "begin phase 0 per /workspace/the-product/ROADMAP.md. dispatch one customer-researcher to produce /workspace/the-product/discovery/phase-0-framing.md. stop at G0 when the PR is mergeable."
```

The researcher will clone, read the two candidate products from `ROADMAP.md`, and produce a side-by-side framing. Expect 15–40 turns of work.

### 5. Let the orchestrator integrate

When the researcher's PR is up, give the orchestrator a follow-up turn:

```bash
aod conv prompt <tech-lead-id> -p \
  "the researcher's PR is open. review against the brief's acceptance criteria. if it's good, request my approval at G0; otherwise leave review comments and re-dispatch."
```

### 6. Hit G0

The orchestrator stops and asks you to pick (or reframe). You read `discovery/phase-0-framing.md`, decide. Reply with the call:

```bash
aod conv prompt <tech-lead-id> -p \
  "G0 decision: we're going with <option>. proceed to G1 — dispatch growth-marketer to draft the press-release narrative for it."
```

That's the rhythm: orchestrator runs, hits a gate, you decide, orchestrator runs to the next gate.

## Things to watch for

- **The orchestrator is stateless across `aod run`s** except via mem0 + the bus repo. If you start a fresh `aod run tech-lead` instead of `aod conv prompt`-ing the existing one, it loses its working memory of what it just did. Resume existing conversations whenever possible.
- **Leaked sprites cost money.** Run `aod conv list` periodically. `aod conv terminate <id>` for anything done.
- **Skipped gates = catastrophe.** If the orchestrator dispatches past G0/G1/G2 without asking you, `aod conv interrupt <id>` and revise the system prompt (or push back in-conversation: `"you skipped G1. stop, summarize state, ask me."`).
- **Briefs are the quality lever.** If a specialist returns garbage, 8 times out of 10 the brief was vague. Read the brief in `plan/<slice>/<role>-brief.md` before blaming the specialist.
- **Slice creep.** If `ROADMAP.md`'s "Now" grows past 2 entries or any single slice spans multiple specialist conversations, the orchestrator is over-decomposing the wrong dimension. Push back: `"this slice is too big — split it before dispatching."`
- **First real bug will be in the system prompt, not the model.** Expect 1–2 iterations on `agents/teams/the-product/tech-lead.yml` after Pass 1 reveals what the orchestrator actually misunderstands.
- **Vault propagation is manual, not automatic.** The orchestrator must include `vault_id` in every spawn body (see Authentication above). If a specialist hits `Permission denied to jhgaylor`, the spawn was missing `vault_id`, not the parent's `--vault` flag.

## Running the project-agnostic team

The `tech-lead` agent above is hardcoded to `BinaryBourbon/the-product`. For any *other* product, use `product-tech-lead` + the `product-team` env. Same fleet of specialists, same dispatch + gate model, no manifest edit per new product.

### Seed a vault for the project (once per project)

The `product-team` env's baseline `GITHUB_TOKEN` is jhgaylor's — it can clone public repos but can't push to most. So before the first run against a new product, drop a vault file under `vaults/` that overrides `GITHUB_TOKEN` with a write-scoped PAT for that repo's owner. Mirror [`vaults/binarybourbon.yml`](./vaults/binarybourbon.yml):

```yaml
---
apiVersion: aod/v1
kind: Vault
metadata:
  name: <project-vault>
spec:
  description: <Owner>'s GitHub credentials and git identity
  secrets:
    GITHUB_TOKEN: infisical:///dev/<OWNER>_GITHUB_TOKEN
    GIT_AUTHOR_NAME: <Owner>
    GIT_AUTHOR_EMAIL: <id+owner>@users.noreply.github.com
    GIT_COMMITTER_NAME: <Owner>
    GIT_COMMITTER_EMAIL: <id+owner>@users.noreply.github.com
```

Add the matching secret in Infisical, `make apply`, confirm with `aod vault list | grep <project-vault>`.

### Invoke the orchestrator

The agent expects three things in your first prompt: `repo_url`, `vault_name`, and `operating_doc_path` (defaults to `OPERATING_MODEL.md`). It clones the repo on the first turn into `/workspace/<repo-name>` and treats it as the bus repo from there on.

```bash
aod run product-tech-lead --vault <project-vault> -p \
  "repo_url=https://github.com/<owner>/<repo>
   vault_name=<project-vault>
   operating_doc_path=OPERATING_MODEL.md

   begin phase 0 per ROADMAP.md. dispatch one customer-researcher to produce
   discovery/phase-0-framing.md. stop at G0 when the PR is mergeable."
```

The `--vault <project-vault>` flag is for the orchestrator's own pushes; the matching `vault_name` line in the prompt is what the orchestrator uses to look up the vault id and pass `vault_id` on each spawn (same constraint as the BinaryBourbon flow above).

### When to graduate to a named env

Stick with the generic env until a product is sticky enough that re-cloning every conversation feels expensive, or until you want to shorten the operator prompt. Then copy [`environments/the-product.yml`](./environments/the-product.yml), point it at the new repo, and switch the orchestrator's invocation to `--env <project>`. The agent prompt is the same — it'll detect the mount and skip the clone if the working dir already exists.

### Bus repo prerequisites

`product-tech-lead` assumes the bus repo seeds the same operating model as `the-product`: an `OPERATING_MODEL.md` describing roles + gates + brief format, a `ROADMAP.md` with Now/Next/Gated lanes, and a `decisions/` directory for ADRs. A repo that's missing those will get bounced on STEP 0 with a request to frame the product first.

## Quick reference

```bash
# Apply manifest changes
make apply

# Start a tech-lead conversation
aod run tech-lead --vault binarybourbon -p "..."

# Resume an existing conversation (preserves working memory)
aod conv prompt <conv-id> -p "..."

# Watch an agent work in real time
aod conv stream <conv-id>

# List what's running
aod conv list --status RUNNING

# Stop a runaway agent without killing the sprite
aod conv interrupt <conv-id>

# Tear down a sprite when you're done
aod conv terminate <conv-id>

# Permanently delete a conversation + sprite
aod conv delete <conv-id>
```
