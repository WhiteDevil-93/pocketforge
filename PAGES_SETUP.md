# Deploying PocketForge to GitHub Pages

This repo includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that
builds the Vite app and publishes it to GitHub Pages on every push to `main`.

## 1. Vite config — set a relative base

GitHub Pages serves a project site from a sub-path
(`https://whitedevil-93.github.io/pocketforge/`), so asset URLs must be relative.
Make sure your `vite.config.js` (or `.ts`) sets `base`:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // relative paths so assets resolve under /pocketforge/
  // ...rest of your config
})
```

> `base: './'` produces relative URLs that work regardless of the sub-path.
> Alternatively use `base: '/pocketforge/'` (must match the repo name exactly).

## 2. Enable GitHub Pages (one-time, in the repo UI)

1. Go to the repo on GitHub → **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, choose **GitHub Actions**.
3. That's it — no branch/folder selection needed when using Actions.

## 3. Deploy

Push to `main`. The workflow runs `npm ci` → `npm run build` → uploads `dist/`
→ deploys. Watch progress under the **Actions** tab. When it finishes, the live
URL appears in the workflow run summary and under Settings → Pages:

```
https://whitedevil-93.github.io/pocketforge/
```

## Notes

- The workflow assumes a standard Vite project: a `package.json` with a `build`
  script and output to `dist/`. Adjust the `path:` in the workflow if your build
  output directory differs.
- If you use a `package-lock.json`, `npm ci` works as-is. If you use pnpm or
  yarn, swap the install/build steps accordingly.
