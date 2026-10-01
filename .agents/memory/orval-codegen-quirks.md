---
name: Orval codegen quirks
description: Naming and validation lessons for this workspace's OpenAPI-to-Zod and React Query generation.
---

Avoid naming an OpenAPI response component the same as an operation-generated response export. Orval can emit a Zod response constant and a TypeScript response interface with the same name; the package barrel's star exports then conflict.

**Why:** A schema/operation naming collision stopped the API Zod package from building after code generation.

**How to apply:** Use a distinct reusable component name (for example, a resource-oriented redirect schema), regenerate with Orval, then build the generated packages and typecheck the API server.

In this workspace, a filtered pnpm codegen command can generate files successfully and still exit non-zero in its trailing `pnpm -w` step because the repository has no `pnpm-workspace.yaml`.

**Why:** The root declares npm workspaces, while the codegen script invokes pnpm's workspace-root mode.

**How to apply:** If Orval output was generated before the failure, validate the generated packages directly with `tsc -b` and then run the API-server typecheck rather than rerunning the failing wrapper unchanged.