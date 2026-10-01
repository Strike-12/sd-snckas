---
name: GitHub sync history
description: Reconcile Replit workspace Git history with commits created through the authorized GitHub integration.
---

Commits created through the GitHub integration may start from the repository’s remote initial commit instead of Replit’s local Git history. Git then reports the branches as unrelated even when their overlapping files are identical.

**Why:** A direct Git CLI push can also fail with invalid-credential errors even while the authorized GitHub connection works through the integration API.

**How to apply:** Compare overlapping tree contents first. Publish the current tracked workspace through the authorized connection and preserve the pre-sync local state. Fetch the new remote commit; if its tree matches the resolved workspace, back up that resolved merge too before aligning `main` to `origin/main`. This keeps both local history states recoverable without leaving the working branch diverged.