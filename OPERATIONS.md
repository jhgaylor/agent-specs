# Operations

How to actually drive the team. The agents and environments in this repo define the *capabilities*; this doc covers how a human operator uses them to do work.

If you're new to the setup, read this first, then [`README.md`](./README.md) for the manifest mechanics.

## Authentication: always pass `--vault binarybourbon`

The `the-product` environment mounts `BinaryBourbon/the-product`, but the env's baseline `GITHUB_TOKEN` is jhgaylor's (from `infisical:///dev/GITHUB_TOKEN`) — which has no write access to BinaryBourbon. Without the vault, the tech-lead can clone the repo (it's public) but cannot push branches, open PRs, or merge.

The [`vaults/binarybourbon.yml`](./vaults/binarybourbon.yml) vault overrides `GITHUB_TOKEN` per conversation with a BinaryBourbon-scoped PAT. **Pass `--vault binarybourbon` on every `aod run` into this team** — otherwise the orchestrator (and the specialists it spawns through the bundled `aod` skill, which inherits the calling conversation's vault) will hit `Permission denied to jhgaylor`.

```bash
aod run tech-lead --vault binarybourbon -p "..."
```

If you forget once, you'll see it immediately: the orchestrator's first `git push` fails. Re-run with the vault.

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

Force the orchestrator to load state but not act:

```bash
aod run tech-lead --vault binarybourbon -p \
  "read OPERATING_MODEL.md and ROADMAP.md. summarize what you understand about your role and what you'd dispatch next. do NOT dispatch — just describe."
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
  "we're loop-testing. dispatch a general-purpose-engineer to add a one-line CONTRIBUTING.md to BinaryBourbon/the-product (just a pointer to OPERATING_MODEL.md). write the brief, dispatch via aod skill, then stop and report the conversation id."
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
  "begin phase 0 per ROADMAP.md. dispatch one customer-researcher to produce discovery/phase-0-framing.md. stop at G0 when the PR is mergeable."
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
- **First real bug will be in the system prompt, not the model.** Expect 1–2 iterations on `agents/tech-lead.yml` after Pass 1 reveals what the orchestrator actually misunderstands.
- **Vault inheritance is load-bearing.** When the tech-lead spawns a specialist via the bundled `aod` skill, the spawned conversation inherits the vault. If you forgot `--vault binarybourbon` on the parent run, every child fails the same way.

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
