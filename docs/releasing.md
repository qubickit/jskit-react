# Releasing

Releases are automated with `semantic-release` on the `main` branch.

## Requirements

- Conventional commit messages (used to compute the next version).
- `NPM_TOKEN` set in GitHub Actions secrets.

## Automated release (recommended)

Push to `main` and the Release workflow runs automatically when `NPM_TOKEN` is available:

- `.github/workflows/release.yml`
- Publishes to npm as `@qubic-labs/react`
- Updates `CHANGELOG.md` and tags `vX.Y.Z`

## Manual release (local)

```bash
bun install
bun run release
```

Note: local releases require `NPM_TOKEN` in the environment.
