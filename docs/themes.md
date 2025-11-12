# 🎨 Leaf Themes

Leaf comes with multiple built-in themes that you can switch between instantly. Each theme is designed for different use cases and aesthetics.

## 🚀 Live Theme Preview

Experience our themes in real-time with the interactive theme selector below:

\<LiveThemeSelector />

## Available Themes

### 🎨 Default Theme
Modern documentation theme with clean design and comprehensive features.

**Best for:** Technical documentation, API docs, project documentation
**Features:** Sidebar navigation, search, dark mode, code highlighting

### 📝 Blog Theme
Article-focused theme with blog cards, author info, and reading time.

**Best for:** Blogs, articles, content-heavy sites
**Features:** Blog cards, author profiles, tags, reading time estimates

### 💼 Business Theme
Professional corporate theme with clean, trustworthy design.

**Best for:** Business documentation, enterprise sites, professional docs
**Features:** Professional styling, clean typography, business-focused layout

### 🎯 Minimal Theme
Clean and minimal theme with distraction-free design.

**Best for:** Simple documentation, personal projects, minimal sites
**Features:** Ultra-clean design, focus on content, minimal distractions

## Theme Switcher

Use the theme switcher in the header to instantly preview and switch between themes. Your preference is automatically saved and will persist across visits.

\<ThemeSwitcher />

## Using Themes

### In Configuration

```ts
// leaf.config.ts
export default {
  theme: {
    name: '@sylphx/leaf-theme-blog', // Specify theme package
    config: {
      // Theme-specific configuration
      showAuthor: true,
      showReadingTime: true
    }
  }
}
```

### Programmatically

```tsx
import { themeManager } from '@sylphx/leaf/utils/theme-manager'

// Switch theme
themeManager.setCurrentTheme('blog')

// Get current theme
const currentTheme = themeManager.getCurrentTheme()

// List all themes
const themes = themeManager.getAllThemes()
```

## Creating Custom Themes

You can create your own themes by following these steps:

1. **Create a new package** with the naming convention `@sylphx/leaf-theme-[name]`
2. **Implement required components** (Layout, Header, Sidebar, etc.)
3. **Export theme configuration** from your package
4. **Register your theme** with the theme manager

### Theme Package Structure

```
my-theme/
├── package.json
├── src/
│   ├── index.ts          # Main export
│   ├── components/       # Theme components
│   ├── layouts/          # Layout components
│   ├── styles/           # CSS styles
│   └── store/            # Theme state
└── dist/                 # Build output
```

### Required Exports

```ts
// src/index.ts
export { default as Layout } from './layouts/Layout'
export { default as Header } from './components/Header'
export { default as Sidebar } from './components/Sidebar'
export { default as ThemeToggle } from './components/ThemeToggle'
// ... other components
```

## Theme Showcase

Below you can see previews of each theme in action:

\<ThemeShowcase />

---

*Themes are automatically loaded and can be switched instantly without page reload.*