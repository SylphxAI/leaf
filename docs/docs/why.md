---
title: Why Leaf?
order: 3
---

# Why Leaf?

Leaf brings the power of fine-grained reactivity to documentation sites while maintaining the simplicity and speed of VitePress.

## Comparison with VitePress

| Feature | Leaf | VitePress | Notes |
|---------|-----------|-----------|--------|
| **Framework** | SolidJS 1.9+ | Vue 3 | Different reactivity models |
| **Reactivity** | Fine-grained signals | Proxy-based | SolidJS more efficient |
| **Bundle Size** | Lightweight | ~75KB gzip | Minimal overhead |
| **Markdown Features** | ✅ All | ✅ All | Full parity |
| **Math Equations** | ✅ KaTeX | ✅ KaTeX | Same |
| **Mermaid Diagrams** | ✅ v11 | ✅ Native | Same |
| **Search** | ✅ MiniSearch | ✅ MiniSearch | Same |
| **Dark Mode** | ✅ + Theme switcher | ✅ | Enhanced themes |

## Key Advantages

### 1. Fine-Grained Reactivity

SolidJS provides superior reactivity without Virtual DOM overhead:

- **Direct DOM Updates**: No diffing, no reconciliation
- **Automatic Dependency Tracking**: Signals track dependencies automatically
- **Minimal Re-renders**: Only affected DOM nodes update
- **Simple Mental Model**: Predictable reactivity with signals and effects

```typescript
import { createSignal } from 'solid-js';

// Simple, efficient reactivity
export function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <button onClick={() => setCount(count() + 1)}>
      Count: {count()}
    </button>
  );
}
```

### 2. Modern Runtime

**Bun or Node.js** - Use either runtime:

- **Bun**: Faster package installation and built-in TypeScript support
- **Node.js 18+**: Stable and widely supported
- Both work equally well for production builds

### 3. Lightweight Runtime

Leaf uses **SolidJS** for minimal framework overhead:

| Package | Size (gzip) | Purpose |
|---------|-------------|---------|
| **SolidJS** | ~7KB | Fine-grained reactivity library |
| **@solidjs/router** | ~5KB | Client-side routing |
| **Total** | **~12KB** | Compare: React (~45KB), Vue 3 (~33KB) |

**No Virtual DOM** means less runtime code and faster updates.

### 4. TypeScript First

100% TypeScript with full type safety:

```typescript
import { defineConfig } from '@sylphx/leaf';

export default defineConfig({
  title: 'My Docs', // ✅ Autocomplete
  theme: {
    nav: [
      { text: 'Guide', link: '/guide' } // ✅ Type-checked
    ]
  }
  // ❌ TypeScript will catch typos and invalid config
});
```

### 5. Better DX (Developer Experience)

::: tip Hot Module Replacement
Fast HMR powered by Vite. Changes reflect in <100ms.
:::

::: tip Zero Configuration
Works out of the box with sensible defaults. Configure only what you need.
:::

::: tip Auto-Generated
Sidebar and TOC are automatically generated from your file structure and headings.
:::

## When to Use Leaf

✅ **Use Leaf if you:**
- Want fine-grained reactivity without Virtual DOM
- Prefer SolidJS's simple mental model
- Need minimal runtime overhead
- Want maximum performance
- Use Bun runtime for fast builds
- Need TypeScript-first tooling

❌ **Use VitePress if you:**
- Prefer Vue ecosystem
- Have existing VitePress site
- Need Vue-specific features
- Team is Vue-focused

## Performance Comparison

### Build Time

Fast builds with Vite and Bun:
- ~2s for 22 pages including search index generation
- Hot Module Replacement in <100ms
- Optimized with SolidJS compiler

### Bundle Size

Lightweight runtime with SolidJS:

- Leaf: Minimal overhead (~12KB framework)
- VitePress: ~75KB gzipped
- No Virtual DOM = Less runtime code

### First Load

Both achieve fast first load through SSG:
- HTML pre-rendered at build time
- No JavaScript needed for initial view
- Progressive hydration

## Real-World Example

This documentation site is built with Leaf! You're experiencing:

- ⚡ Fast page loads via SSG
- 🔍 <50ms local search (Cmd/Ctrl+K)
- 🎨 Beautiful dark mode
- 📱 Mobile responsive
- 🧮 Math equations: $E = mc^2$
- 📊 Mermaid diagrams (see above)

## Migration from VitePress

Migrating is straightforward since Leaf maintains VitePress markdown syntax:

1. **Copy markdown files** - They work as-is!
2. **Update config** - Similar structure
3. **Adjust imports** - Change `vitepress` to `@sylphx/leaf`
4. **Run build** - Done!

See [Migration Guide](/guide/migration) for details.

## Conclusion

Leaf gives you:
- 🚀 VitePress-compatible markdown
- ⚡ Fine-grained reactivity with SolidJS
- 🪶 Lightweight runtime (~12KB framework)
- 💪 Type-safe configuration
- 🎨 Beautiful theme with switcher
- ⚡ Fast builds with Bun

Ready to try it? [Get started](/getting-started) now!
