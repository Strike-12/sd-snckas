---
name: Reference extraction fallback
description: How to ground website rebuilds when automated brand extraction is unavailable in the current workspace mode.
---

For authorized website rebuilds, a screenshot plus fetched homepage HTML is sufficient to ground the first pass when automated brand extraction is unavailable. Download the small set of source assets needed for the visible page into the app before frontend implementation.

**Why:** Automated brand extraction may require a paid mode that is not available in every workspace session, while the visual capture and page fetch remain available.

**How to apply:** Use the reference screenshot for visual comparison, the fetched HTML for exact copy and asset URLs, and keep a local asset folder so the preview does not depend on remote image loading.