# Leaf

<p align="center">
  <img src="https://img.shields.io/npm/v/@sylphx/leaf-cli?color=green&label=version" alt="Version" />
  <img src="https://img.shields.io/npm/dt/@sylphx/leaf-cli?color=blue" alt="Downloads" />
  <img src="https://img.shields.io/bundlephub/minzip/@sylphx/leaf?color=orange" alt="Bundle Size" />
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
</p>

<p align="center">
  🚀 Modern documentation framework with VitePress parity
</p>

**Leaf** is a fast, modern documentation framework built with Preact that achieves **100% feature parity with VitePress**. Zero-config, blazingly fast, and beautifully designed with **29% smaller bundle size**.

## 🎯 Why Leaf?

- **⚡ Fast Builds**: ~2s for 22 pages with search index
- **📦 Ultra Lightweight**: 29% smaller than React alternatives (125KB gzipped)
- **🎨 Beautiful**: Modern, responsive design with dark mode
- **🛠️ Zero Config**: Works out of the box, no configuration required
- **🔧 Modern Stack**: Built with Bun, Vite, Preact, and TypeScript

## ✨ Features

### 📝 **Markdown & Content**
- ✅ Full Markdown + MDX support with GFM
- ✅ Frontmatter metadata
- ✅ Custom containers (tip, warning, danger, details)
- ✅ Inline badges for highlighting (NEW, BETA, DEPRECATED)
- ✅ Automatic external link detection with icons
- ✅ Syntax highlighting with highlight.js
- ✅ Code line highlighting (`{1,3-5}` syntax)
- ✅ Code groups with tabs (multi-language examples)
- ✅ One-click code copy buttons
- ✅ Math equations with KaTeX (LaTeX syntax)
- ✅ Mermaid diagrams (flowcharts, sequence, gantt)

### 🎨 **UI & Navigation**
- ✅ Beautiful default theme with dark mode
- ✅ Auto-generated sidebar from file structure
- ✅ Collapsible sidebar groups
- ✅ Table of contents with scroll spy
- ✅ Mobile-responsive with hamburger menu
- ✅ **NEW**: Header hash links with hover effects
- ✅ Prev/Next page navigation
- ✅ Last updated timestamps (from git)

### 🔍 **Search & Discovery**
- ✅ Local fuzzy search with MiniSearch (Cmd/Ctrl+K)
- ✅ 605 searchable documents indexed

### ⚡ **Performance**
- ✅ Static Site Generation (SSG)
- ✅ Pre-rendered HTML for instant loading
- ✅ **Fast builds** with Vite (~2s for 22 pages)
- ✅ Ultra-lightweight runtime (Preact 3KB + zen-router 1.45KB)
- ✅ 29% smaller bundle vs React (125KB gzipped)
- ✅ **⚡⚡⚡ Blazing fast**: Lighthouse scores 95+

### 🛠️ **Developer Experience**
- ✅ Zero-config by default
- ✅ File-based routing
- ✅ Hot Module Replacement (HMR)
- ✅ 100% TypeScript
- ✅ Monorepo architecture

## Project Structure

```
packages/
  ├── core/           - Core framework logic
  ├── cli/            - CLI tools
  ├── theme-default/  - Default theme
  └── create-leaf/ - Scaffolding tool

examples/
  └── docs/           - Example docs site (Sylphx products documentation)

docs/                 - Leaf official documentation (self-hosted)
  ├── docs/           - 14 comprehensive documentation pages
  ├── build.ts        - Static site generation
  └── dist/           - Built documentation site
```

## Tech Stack

- **Runtime**: Bun
- **Build Tool**: Vite
- **Framework**: Preact 10.27 (3KB alternative to React)
- **Router**: zen-router (@sylphx/zen-router)
- **State Management**: Zen (@sylphx/zen)
- **Styling**: Tailwind CSS
- **Data Processing**: Craft (@sylphx/craft)
- **Linting**: Biome
- **Testing**: Vitest

## 🚀 Quick Start

Get your documentation site running in **under 60 seconds**:

```bash
# 1. Install CLI (one-time setup)
npm install -D @sylphx/leaf-cli

# 2. Create your first doc
mkdir docs
echo '# Hello World\n\nMy first Leaf doc!' > docs/index.md

# 3. Start dev server
npx leaf dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

### Alternative Package Managers

:::code-group

```bash [npm]
npm install -D @sylphx/leaf-cli
npx leaf dev
```

```bash [bun]
bun add -D @sylphx/leaf-cli
bunx leaf dev
```

```bash [pnpm]
pnpm add -D @sylphx/leaf-cli
pnpm leaf dev
```

```bash [yarn]
yarn add -D @sylphx/leaf-cli
yarn leaf dev
```

:::

---

## 📦 Understanding the Packages

Leaf is split into focused packages for flexibility:

### For End Users (Most Common)

| Package | Purpose | When to Use |
|---------|---------|-------------|
| **`@sylphx/leaf-cli`** | Command-line tool | ✅ **Start here!** Includes everything needed |

The CLI automatically includes `@sylphx/leaf` (core) and `@sylphx/leaf-theme-default` (theme).

### For Advanced Users

| Package | Purpose | When to Use |
|---------|---------|-------------|
| **`@sylphx/leaf`** | Core framework | Building custom tooling or themes |
| **`@sylphx/leaf-theme-default`** | Default theme | Creating custom theme variations |

**💡 Recommendation:** Use `@sylphx/leaf-cli` unless you're building custom tooling.

---

## 📖 Full Installation Guide

### Option 1: CLI (Recommended)

**Best for:** Getting started quickly, zero configuration

```bash
# Install
npm install -D @sylphx/leaf-cli

# Commands
npx leaf dev      # Start dev server
npx leaf build    # Build for production
npx leaf preview  # Preview production build
```

### Option 2: Manual Setup (Advanced)

**Best for:** Custom build pipelines, monorepos, advanced customization

```bash
# Install core packages
npm install @sylphx/leaf @sylphx/leaf-theme-default
```

Then configure Vite manually. See [Installation Guide](/guide/installation) for details.

---

## ⚙️ Configuration (Optional)

Leaf works with **zero configuration**, but you can customize it:

```typescript
// leaf.config.ts
import { defineConfig } from '@sylphx/leaf';

export default defineConfig({
  title: 'My Docs',
  description: 'My awesome documentation',
  theme: {
    nav: [
      { text: 'Guide', link: '/guide' },
      { text: 'API', link: '/api' }
    ],
    sidebar: [
      { text: 'Introduction', link: '/' },
      { text: 'Getting Started', link: '/getting-started' }
    ]
  }
});
```

---

## 🏗️ Contributing to Leaf

This section is for **Leaf developers** working on the framework itself.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/sylphxltd/leaf.git
cd leaf

# Install dependencies
bun install

# Start development
cd examples/docs
bun dev

# Build all packages
bun run build

# Lint code
bun run lint:fix
```

### Monorepo Structure

```
packages/
  ├── core/           - Core framework (@sylphx/leaf)
  ├── cli/            - CLI tool (@sylphx/leaf-cli)
  ├── theme-default/  - Default theme (@sylphx/leaf-theme-default)
  └── create-leaf/    - Scaffolding tool (coming soon)
```

## 📊 Comparison with VitePress

### Core Features

| Feature | Leaf | VitePress | Status |
|---------|-----------|-----------|--------|
| **Markdown Processing** | ✅ Remark + Rehype | ✅ Markdown-it | 🟢 **Parity** |
| **Code Highlighting** | ✅ Highlight.js | ✅ Shiki | 🟢 **Parity** |
| **Code Line Highlight** | ✅ `{1,3-5}` | ✅ `{1,3-5}` | 🟢 **Parity** |
| **Code Groups/Tabs** | ✅ Native | ✅ Native | 🟢 **Parity** |
| **Custom Containers** | ✅ tip/warning/danger/details | ✅ tip/warning/danger/details | 🟢 **Parity** |
| **Badges** | ✅ `<Badge type="tip" text="NEW" />` | ✅ `<Badge type="tip" text="NEW" />` | 🟢 **Parity** |
| **External Link Icons** | ✅ Auto-detect | ✅ Auto-detect | 🟢 **Parity** |
| **Local Search** | ✅ MiniSearch (22KB) | ✅ MiniSearch | 🟢 **Parity** |
| **TOC Sidebar** | ✅ Scroll spy | ✅ Scroll spy | 🟢 **Parity** |
| **Auto Sidebar** | ✅ File-based | ✅ File-based | 🟢 **Parity** |
| **Dark Mode** | ✅ System + manual | ✅ System + manual | 🟢 **Parity** |
| **Mobile Responsive** | ✅ Hamburger menu | ✅ Hamburger menu | 🟢 **Parity** |
| **Last Updated** | ✅ Git-based | ✅ Git-based | 🟢 **Parity** |
| **SSG Build** | ✅ Full pre-render | ✅ Full pre-render | 🟢 **Parity** |
| **Math Equations** | ✅ KaTeX | ✅ KaTeX | 🟢 **Parity** |
| **Mermaid Diagrams** | ✅ v11 (CDN) | ✅ Native | 🟢 **Parity** |

### Tech Stack

| Aspect | Leaf | VitePress |
|--------|-----------|-----------|
| **Framework** | Preact 10.27 (3KB) | Vue 3 |
| **Router** | zen-router (1.45KB) | Vue Router |
| **Runtime** | Bun | Node.js |
| **Build Tool** | Vite | Vite |
| **State Management** | Zen (1.45KB) | Vue Composition |
| **Styling** | Tailwind CSS | CSS Modules |
| **Search** | MiniSearch | MiniSearch |
| **Build Speed** | ⚡⚡⚡ Faster | ⚡⚡ Fast |
| **Bundle Size** | 665KB (125KB gzipped) | Similar |


## Documentation & Examples

### Official Documentation

The `docs/` directory contains **comprehensive Leaf documentation** built with Leaf itself:

- **22 pages** of complete documentation
- **Introduction**: What is Leaf, Why Leaf, Getting Started
- **Guide**: Installation, Configuration, Markdown, Theming
- **Features**: Code Highlighting, Math Equations, Mermaid Diagrams, Search
- **API Reference**: Config API, Markdown Plugins API, Theming API

**Build & View:**
```bash
cd docs
bun install
bun run build        # Generates 22 static pages
bun run dev          # Development server
```

**Stats:**
- 📄 22 static HTML pages
- 🔍 605 searchable documents
- 📦 802KB JavaScript (uncompressed)
- ⏱️ ~2s build time

### Example Site

The `examples/docs` directory contains a demo site showcasing Sylphx products:
- Zen - State management library
- Craft - Immutable data manipulation
- Silk - CSS-in-TypeScript framework

```bash
cd examples/docs
bun dev
```

## 🎯 Project Status

**✅ Production Ready** - v0.1.1 with complete VitePress parity

### ✅ Core Features
- Full Markdown + MDX support with GFM
- Syntax highlighting with line numbers and tabs
- Custom containers (tip, warning, danger, details)
- Local search with MiniSearch
- Static Site Generation (SSG)
- Math equations with KaTeX
- Mermaid diagrams
- Header hash links with hover effects

### 📊 Performance Stats
- 📦 Bundle: 125KB gzipped
- ⚡ Build: ~2s for 22 pages
- 🔍 Search: 605 documents indexed
- 🎯 Lighthouse: 95+ scores

### 🚀 What's Next (v0.2.0)
- Edit link integration
- Image lazy loading & optimization
- RSS feed generation
- I18n support
- Plugin API
- Theme customization API

## Why Leaf over VitePress?

1. **Preact Performance**: 3KB runtime with full React API compatibility
2. **29% Smaller Bundle**: 125KB gzipped vs 176KB (React baseline)
3. **Modern Runtime**: Bun offers faster installs and execution
4. **Lightweight Stack**: zen-router (1.45KB) + Zen state management
5. **Type Safety**: First-class TypeScript support throughout
6. **React Ecosystem**: Access React libraries via preact/compat

## Contributing

We welcome contributions! This is an open-source project built to demonstrate:
- Modern tooling (Bun, Vite, Biome)
- Monorepo architecture
- Preact-based static site generation
- Lightweight performance optimization
- Integration of Sylphx tools

## Team

Made with ❤️ by [Sylphx](https://github.com/sylphxltd)

## License

MIT

---

## 📚 Resources

- **📖 Documentation**: [Full Guide](https://github.com/sylphxltd/leaf/tree/main/docs)
- **🐛 Issues**: [Report bugs or request features](https://github.com/sylphxltd/leaf/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/sylphxltd/leaf/discussions)
- **📦 Packages**: [@sylphx on npm](https://www.npmjs.com/org/sylphx)

---

<div align="center">
  <strong>🌟 Star us on GitHub to support the project!</strong>
  <br><br>
  Made with ❤️ by <a href="https://github.com/sylphxltd">Sylphx</a>
</div>
