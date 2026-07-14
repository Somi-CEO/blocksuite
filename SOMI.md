# Somi fork notes (`Somi-CEO/blocksuite`)

## Branches

| Branch | Role |
|--------|------|
| `main` | Upstream-style default (may lag). Prefer versioned Somi branches for publish. |
| `somi/0.19.5` | Working branch for the `0.19.5` pin used by Somi Main. Publish tooling and Somi deltas land here. |

## Versions

- Track upstream release tags when doing drop-in replacements (e.g. `v0.19.5`).
- Somi publish versions use a preid: `0.19.5-somi.0`, `0.19.5-somi.1`, …
- Git tags for publishes: `v0.19.5-somi.0` (optional; `workflow_dispatch` works without a tag).

## Publish (GitHub Packages)

Source package names stay `@blocksuite/*` in git (upstream sync stays easy).

At publish time, CI runs `scripts/somi/remap-for-gh-packages.mjs` and publishes:

- `@blocksuite/foo` → `@somi-ceo/blocksuite-foo` on `https://npm.pkg.github.com`

Workflow: `.github/workflows/publish-gh-packages.yml`

Trigger: push tag `v0.19.5-somi.N` (workflows live on `somi/0.19.5`; `workflow_dispatch` from the Actions UI needs the workflow file on the default branch too).

Packages often publish as **private** on GitHub Packages even with `--access public`. Somi Main installs with `GH_PACKAGES_TOKEN` (same as Univer). Use `.github/workflows/set-packages-public.yml` / grant-access workflows when org package settings allow.

External packages that stay on public npm (not remapped):

- `@blocksuite/icons`
- `@toeverything/theme`

## License / source offer (MPL-2.0)

Upstream BlockSuite is **MPL-2.0** (see `LICENSE`). File-level copyleft applies to Covered Software.

When Somi distributes Executable Form of BlockSuite (e.g. board canvas bundles):

1. Retain MPL notices / copyright in Source Code Form.
2. Point recipients at this repository (and the exact tag / branch) as Source Code Form — currently `https://github.com/Somi-CEO/blocksuite` branch `somi/0.19.5`.
3. Prefer Somi product integrations as **new files** (not in-place edits of Covered Software). Modified upstream files must remain MPL-2.0 and be available here.

Somi Main documents attribution in `THIRD_PARTY_NOTICES`.
