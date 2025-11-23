---
"@sylphx/leaf": patch
---

fix: correct Router setup to provide proper context

Change Router setup from `<Router root={App} />` to `<Router><App /></Router>`
to ensure router primitives like useLocation() work correctly in child components.

**Issue:**
- Components using useLocation() were throwing "can be only used inside a Route" error
- Router context was not being properly provided to child components

**Solution:**
- Use standard Router wrapper pattern instead of `root` prop
- Ensures all child components have access to router context

**Impact:**
- Fixes navigation and routing in all Leaf-based documentation sites
- No breaking changes to API or configuration
