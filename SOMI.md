# Somi fork notes (`somi-co/blocksuite`)

## Ownership

`somi-co/blocksuite` is the **maintenance trunk** for Somi’s BlockSuite pin.

- Standalone [toeverything/blocksuite](https://github.com/toeverything/blocksuite) last shipped ~`v0.22.4` / sync commits in mid-2025; active editor work lives inside the AFFiNE monorepo now.
- Do **not** wait on upstream PRs or assume merge-back to `toeverything/blocksuite`. Patch product and security fixes here, version as `0.19.5-somi.N`, publish, bump Somi Main.
- `main` on this fork may diverge / conflict with GitHub’s default; **`somi/0.19.5` is the source of truth** for packages Somi installs.

## Branches

| Branch        | Role                                                                                   |
| ------------- | -------------------------------------------------------------------------------------- |
| `main`        | Historical / upstream-shaped default. Not the publish line.                            |
| `somi/0.19.5` | **Maintenance trunk** for the `0.19.5` pin. Publish tooling and Somi deltas land here. |

## Versions

- Base pin: upstream tag `v0.19.5` (what Somi Main originally depended on).
- Somi publish versions use a preid: `0.19.5-somi.0`, `0.19.5-somi.1`, …
- Git tags for publishes: `v0.19.5-somi.0` (optional; `workflow_dispatch` works without a tag).
- Optional later: re-base onto a newer AFFiNE-extracted BlockSuite only if product needs it — not required for day-to-day fixes.

## Publish (GitHub Packages)

Source package names stay `@blocksuite/*` in git (keeps import paths stable inside the fork).

At publish time, CI runs `scripts/somi/remap-for-gh-packages.mjs` and publishes:

- `@blocksuite/foo` → `@somi-co/blocksuite-foo` on `https://npm.pkg.github.com`

At remap time, `publishConfig.exports` / `main` / `types` are promoted onto the package root
so `npm publish` tarballs resolve `dist/` like upstream Yarn publishes (plain npm does not
apply those fields automatically).

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
2. Point recipients at this repository (and the exact tag / branch) as Source Code Form — currently `https://github.com/somi-co/blocksuite` branch `somi/0.19.5`.
3. Prefer Somi product integrations as **new files** (not in-place edits of Covered Software). Modified upstream files must remain MPL-2.0 and be available here.

Somi Main documents attribution in `THIRD_PARTY_NOTICES`.

## Fork deltas (MPL Modifications)

Product-needed source changes on `somi/0.19.5` (beyond publish remap):

| Version         | Change                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `0.19.5-somi.2` | Fix `CheckBoxCkeckSolidIcon` → `CheckBoxCheckSolidIcon` (matches `@blocksuite/icons`; removes need for Somi Vite rewrite) |
| `0.19.5-somi.3` | Optional `EdgelessFileIngestProvider` DI hook in `addImages` / `addAttachments` (Somi media ingest without Vite alias)    |

When adding a delta: patch on `somi/0.19.5` → tag `v0.19.5-somi.N` → publish workflow → bump Somi Main pin → note in Somi `THIRD_PARTY_NOTICES` (MPL Modifications). No upstream PR required.
