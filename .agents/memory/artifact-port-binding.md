---
name: Artifact port binding
description: Keep managed Vite artifact workflows aligned with Replit-injected service ports.
---

Managed artifact services provide `PORT` and `BASE_PATH` through their artifact configuration. Package scripts must not hardcode a shared development port; use the injected value with strict binding so each preview reaches its configured router port.

**Why:** Multiple artifact workflows can start together. A hardcoded port makes one server silently move to another port, leaving the preview router waiting on the configured port and appearing to start forever.

**How to apply:** For Vite package scripts, use a shell fallback such as `${PORT:-3000}` for local development and `--strictPort`; verify the workflow log matches the artifact’s configured `localPort`.