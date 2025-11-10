# @sylphx/leaf-cli

> 🚀 Command-line interface for Leaf documentation framework

Zero-config documentation tool that includes everything you need to build beautiful docs.

## Quick Start

```bash
# 1. Install
npm install -D @sylphx/leaf-cli

# 2. Create a doc
mkdir docs
echo '# Hello World' > docs/index.md

# 3. Start dev server
npx leaf dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

## Installation

Choose your preferred package manager:

```bash
# npm
npm install -D @sylphx/leaf-cli

# bun
bun add -D @sylphx/leaf-cli

# pnpm
pnpm add -D @sylphx/leaf-cli

# yarn
yarn add -D @sylphx/leaf-cli
```

**What's included:**
- `@sylphx/leaf` - Core framework
- `@sylphx/leaf-theme-default` - Default theme
- All CLI commands

## Commands

### Development Server

Start dev server with hot reload:

```bash
npx leaf dev [options]

Options:
  --port <port>    Specify port (default: 5173)
  --host <host>    Specify host (default: localhost)
  --open           Open browser automatically
```

### Build for Production

Generate static HTML files:

```bash
npx leaf build [options]

Options:
  --outDir <dir>   Output directory (default: dist)
```

### Preview Production Build

Test your production build locally:

```bash
npx leaf preview [options]

Options:
  --port <port>    Specify port (default: 4173)
```

## Configuration (Optional)

Create `leaf.config.ts` in your project root:

```typescript
import { defineConfig } from '@sylphx/leaf';

export default defineConfig({
  title: 'My Documentation',
  description: 'My awesome docs',
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

Leaf works with **zero configuration** - config is completely optional!

## Project Structure

```
my-docs/
├── docs/              # Your markdown files
│   ├── index.md
│   ├── guide/
│   └── api/
├── leaf.config.ts     # Optional configuration
└── package.json
```

## Features

- ⚡ **Fast Development** - Hot reload with Vite
- 📦 **Zero Config** - Works out of the box
- 🎨 **Beautiful Theme** - Responsive design with dark mode
- 🔍 **Local Search** - Built-in fuzzy search (Cmd/Ctrl+K)
- 📝 **Full Markdown** - GFM, code highlighting, math, diagrams
- 📱 **Mobile Friendly** - Responsive design
- 🌙 **Dark Mode** - System preference detection

## Usage with Different Package Managers

### npm
```bash
npx leaf dev
npx leaf build
npx leaf preview
```

### bun
```bash
bunx leaf dev
bunx leaf build
bunx leaf preview
```

### pnpm
```bash
pnpm leaf dev
pnpm leaf build
pnpm leaf preview
```

### yarn
```bash
yarn leaf dev
yarn leaf build
yarn leaf preview
```

## Troubleshooting

### Command not found

Make sure you installed the CLI:

```bash
npm install -D @sylphx/leaf-cli
```

Then use `npx` to run:

```bash
npx leaf dev
```

### Port already in use

Specify a different port:

```bash
npx leaf dev --port 3000
```

### Module not found

Clear cache and reinstall:

```bash
rm -rf node_modules
npm install
```

## Documentation

- 📖 [Full Documentation](https://github.com/sylphxltd/leaf)
- 🚀 [Getting Started Guide](https://github.com/sylphxltd/leaf/tree/main/docs)
- 🐛 [Report Issues](https://github.com/sylphxltd/leaf/issues)

## License

MIT © [Sylphx](https://github.com/sylphxltd)