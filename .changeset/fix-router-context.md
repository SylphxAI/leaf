---
"@sylphx/leaf": patch
---

fix: remove non-existent Routes import from @solidjs/router

Remove `Routes` import and wrapper from client.tsx template, as it doesn't exist
in @solidjs/router v0.15.4. The Router component internally handles route matching
and rendering without requiring a Routes wrapper.

**Issue:**
- Runtime error: "does not provide an export named 'Routes'"
- @solidjs/router v0.15.4 doesn't export a Routes component
- Previous attempts to fix router context issues used incorrect API

**Solution:**
- Remove `Routes` from imports
- Use `<Router><Route path="*" component={App} /></Router>` pattern directly
- Router component internally uses Routes for route matching

**Impact:**
- Fixes docs dev server startup and navigation
- Compatible with @solidjs/router v0.15.4
- No breaking changes to user-facing API
