---
"@sylphx/leaf": patch
---

fix: restructure routing to work with @solidjs/router v0.15.4

Completely restructure client.tsx template to properly integrate with @solidjs/router v0.15.4's
context system. Instead of using a single App component with manual route matching, create
proper Route components for each route and use a RouteWrapper component that's rendered by
the router.

**Issue:**
- useLocation() throwing "can be only used inside a Route" error
- Router context not properly available to components
- Previous architecture incompatible with how @solidjs/router v0.15.4 provides context
- Manual route matching fighting against router's design

**Solution:**
- Create Route components for each route in solidRoutes array using For
- Implement RouteWrapper component as the route component
- RouteWrapper uses useLocation() and renders Layout with route data
- Router now properly matches routes and provides context to components
- Remove manual route matching logic (findMatchingRoute)

**Impact:**
- Fixes all router context errors
- Navigation and routing work correctly
- Header and other components can now use useLocation()
- More idiomatic @solidjs/router usage
- No breaking changes to user-facing API
