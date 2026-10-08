# @starter/result

A vendored copy of [better-result](https://github.com/dmmulroy/better-result) by [Dillon Mulroy](https://github.com/dmmulroy), released under the MIT license in [LICENSE](LICENSE). Read the [better-result documentation](https://better-result.dev) for the API.

| Upstream | Value                                      |
| -------- | ------------------------------------------ |
| Version  | 3.0.1                                      |
| Commit   | `4a654fa6dacb8bf75a6283772bba0c81afcfa64a` |

`src/` is unchanged from upstream, including the Vitest and fast-check tests. Prettier and Oxlint skip it so a later update stays a plain copy. `pnpm test:unit` runs its runtime tests and `src/*.test-d.ts` type tests; `pnpm typecheck` checks it with `tsconfig.json` in this folder.

## Update

1. Clone `https://github.com/dmmulroy/better-result` and check out the release tag.
2. Replace `src/` and `LICENSE` with the upstream files.
3. Update the version and commit above, and `version` in `package.json`.
4. Run `pnpm typecheck && pnpm test:unit`.
