---
title: Theming
description: Customize the look and feel of your Leaf site
---

# Theming

Leaf provides a flexible theming system with built-in dark mode support and full customization capabilities.

## Default Theme

Leaf comes with a beautiful default theme that works out of the box:

```typescript
import "@sylphx/leaf-theme-default/style.css";
```

The default theme includes:

- **Responsive design** - Works on all screen sizes
- **Dark mode** - Automatic theme switching
- **Smooth animations** - Polished UI transitions
- **Accessible** - WCAG 2.1 AA compliant

## Hero Page Layout

Create stunning landing pages with the hero layout, perfect for homepages and marketing pages.

### Basic Hero Page

Add `layout: home` to your frontmatter:

```markdown
---
title: My Awesome Project
layout: home

hero:
  name: Project Name
  text: Modern Documentation Framework
  tagline: Built for developers who want the best.
  actions:
    - text: Get Started
      link: /guide
      theme: brand
    - text: View on GitHub
      link: https://github.com/username/repo
      theme: alt
---
```

### Hero Configuration

The hero section supports:

**name** (optional)
Badge text displayed above the main heading.

**text** (required)
Main heading text with gradient styling.

**tagline** (optional)
Subtitle text displayed below the main heading.

**actions** (optional)
Array of action buttons.

**image** (optional)
Hero image displayed on the right side (like VitePress). Perfect for showcasing screenshots, product mockups, or diagrams.

```yaml
hero:
  image:
    src: /hero.png
    alt: Product screenshot
```

The hero uses a responsive 2-column grid layout:
- **Desktop**: Image appears on the right side
- **Mobile**: Image appears below the hero content

### Features Grid

Add a features grid below the hero:

```yaml
features:
  - icon: lucide:zap
    title: Fast
    details: Lightning-fast build times with Vite and SolidJS.
  - icon: lucide:shield
    title: Type-Safe
    details: Full TypeScript support out of the box.
  - icon: lucide:rocket
    title: Modern
    details: Latest web technologies and best practices.
```

**Feature Options:**

- `icon` - Iconify icon name (e.g., `lucide:star`, `mdi:rocket`)
- `title` - Feature heading
- `details` - Feature description
- `link` (optional) - Make the feature card clickable

### Complete Example

```markdown
---
title: My Project
layout: home

hero:
  name: Beta v0.1
  text: Build Amazing Docs
  tagline: Fast, modern, and developer-friendly documentation framework.
  image:
    src: /hero-image.png
    alt: Dashboard screenshot
  actions:
    - text: Quick Start
      link: /getting-started
      theme: brand
    - text: Learn More
      link: /guide
      theme: alt

features:
  - icon: lucide:zap
    title: ⚡ Fast Development
    details: Sub-100ms HMR with Vite. Build in seconds.
  - icon: lucide:package
    title: 📦 Batteries Included
    details: TypeScript, MDX, search, dark mode—all built-in.
  - icon: lucide:heart
    title: 💙 Developer Experience
    details: Hot reload, type safety, and great documentation.
---

## Additional Content

You can add regular markdown content below the hero and features.
This content appears after the features grid.
```

### Styling Hero Pages

Customize hero styling with CSS variables:

```css
:root {
  /* Hero gradient colors */
  --hero-gradient-from: #3b82f6;
  --hero-gradient-to: #8b5cf6;

  /* Feature card styles */
  --feature-border: var(--color-border);
  --feature-bg-hover: var(--color-bg-elevated);
}
```

## Dark Mode

Dark mode is automatically enabled. Users can toggle between light and dark themes using the theme switcher in the header.

The theme preference is:
1. Stored in localStorage
2. Respects system preferences on first visit
3. Persists across sessions

### Customizing Dark Mode Colors

You can customize dark mode colors using CSS variables:

```css
:root[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-bg-elevated: #242424;
  --color-text: #e5e5e5;
  --color-text-secondary: #a3a3a3;
  --color-border: #404040;
  --color-primary: #3b82f6;
}
```

## CSS Variables

The default theme uses CSS custom properties (variables) for theming:

### Colors

```css
:root {
  /* Backgrounds */
  --color-bg: #ffffff;
  --color-bg-elevated: #f9fafb;
  --color-bg-muted: #f3f4f6;

  /* Text */
  --color-text: #1f2937;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;

  /* Borders */
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;

  /* Brand */
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;

  /* Semantic */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
}
```

### Typography

```css
:root {
  --font-family-base: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-mono: "Fira Code", Menlo, Monaco, Consolas, "Courier New", monospace;

  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
}
```

### Spacing

```css
:root {
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
}
```

### Layout

```css
:root {
  --header-height: 64px;
  --sidebar-width: 280px;
  --content-max-width: 1280px;
  --toc-width: 240px;

  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
}
```

## Custom Styling

### Override CSS Variables

Create a custom CSS file and override variables:

```css
/* custom.css */
:root {
  --color-primary: #8b5cf6;  /* Purple instead of blue */
  --font-family-base: "Poppins", sans-serif;
  --border-radius-md: 0.75rem;
}
```

Import it after the theme CSS:

```typescript
import "@sylphx/leaf-theme-default/style.css";
import "./custom.css";
```

### Custom Component Styles

Target specific components with CSS:

```css
/* Customize the header */
.leaf-header {
  border-bottom: 2px solid var(--color-primary);
}

/* Customize code blocks */
.doc-content pre {
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Customize sidebar */
.sidebar {
  background: linear-gradient(to bottom, var(--color-bg), var(--color-bg-muted));
}
```

## Creating a Custom Theme

To create a completely custom theme:

### 1. Create Theme Package

```
my-theme/
├── src/
│   ├── Layout.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── TOC.tsx
│   └── styles/
│       └── index.css
└── package.json
```

### 2. Implement Layout Component

```typescript
// src/Layout.tsx
import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { TOC } from "./components/TOC";

export function Layout({ config }) {
  return (
    <div className="layout">
      <Header nav={config.theme.nav} />
      <Sidebar items={config.theme.sidebar} />
      <main className="content">
        <Outlet />
      </main>
      <TOC />
    </div>
  );
}
```

### 3. Style Your Theme

```css
/* src/styles/index.css */
.layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar content toc";
  grid-template-columns: 280px 1fr 240px;
  grid-template-rows: 64px 1fr;
  min-height: 100vh;
}

.header {
  grid-area: header;
  /* Your header styles */
}

.sidebar {
  grid-area: sidebar;
  /* Your sidebar styles */
}

.content {
  grid-area: content;
  /* Your content styles */
}

.toc {
  grid-area: toc;
  /* Your TOC styles */
}
```

### 4. Use Your Theme

```typescript
import { Layout } from "my-custom-theme";
import "my-custom-theme/style.css";

// Use in your main.tsx
<Route path="/" element={<Layout config={config} />}>
  {/* routes */}
</Route>
```

## Responsive Design

The default theme is fully responsive. Customize breakpoints:

```css
/* Mobile */
@media (max-width: 768px) {
  :root {
    --sidebar-width: 0;
    --toc-width: 0;
  }

  .sidebar,
  .toc {
    position: fixed;
    /* Mobile drawer styles */
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  :root {
    --toc-width: 0;
  }
}
```

## Typography Customization

### Custom Fonts

Import custom fonts:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-family-base: "Inter", sans-serif;
}
```

### Font Weights

```css
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}

h1, h2, h3 {
  font-weight: var(--font-weight-bold);
}
```

## Animation

Customize transitions and animations:

```css
:root {
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}

.sidebar-link {
  transition: all var(--transition-base);
}

.sidebar-link:hover {
  color: var(--color-primary);
  transform: translateX(4px);
}
```

## Component Variants

Create component variants using CSS:

```css
/* Primary button variant */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: background var(--transition-base);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

/* Outline button variant */
.btn-outline {
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
```

## Best Practices

1. **Use CSS Variables** - They make theming much easier
2. **Respect System Preferences** - Support dark mode
3. **Mobile First** - Design for mobile, enhance for desktop
4. **Accessibility** - Maintain color contrast ratios
5. **Performance** - Minimize CSS bundle size
6. **Consistency** - Use a design system

## Next Steps

- [API Reference](/api/theming)
- [View Example Themes](https://github.com/sylphxltd/leaf/tree/main/examples/themes)
