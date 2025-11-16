import { createSignal, For } from "solid-js";

const themes = [
  { id: 'default', name: 'Default', description: 'Modern documentation theme with clean design', icon: '🎨' },
  { id: 'blog', name: 'Blog', description: 'Article-focused theme with blog cards', icon: '📝' },
  { id: 'business', name: 'Business', description: 'Professional corporate theme', icon: '💼' },
  { id: 'minimal', name: 'Minimal', description: 'Clean and minimal theme', icon: '🎯' }
];

const previewContent = {
  title: "Sample Documentation Page",
  excerpt: "This is a preview of how different themes look with actual content. You can see the variations in typography, spacing, colors, and overall design aesthetic.",
  content: `
# Getting Started

Welcome to Leaf! This is a sample page to demonstrate different themes.

## Features

### 🚀 Fast Performance
Built with SolidJS and Vite for lightning-fast performance.

### 📱 Responsive Design
Works perfectly on desktop, tablet, and mobile devices.

### 🎨 Themeable
Choose from multiple built-in themes or create your own.

\`\`\`typescript
// Example code block
import { createApp } from '@sylphx/leaf';

const app = createApp({
  title: 'My Documentation',
  theme: 'blog'
});
\`\`\`

> **Note**: This is a blockquote showing how different themes style emphasis content.

## Comparison Table

| Feature | Default | Blog | Business | Minimal |
|---------|---------|------|----------|---------|
| Typography | Modern | Article-focused | Professional | Clean |
| Colors | Vibrant | Warm | Corporate | Neutral |
| Layout | Sidebar | Card-based | Structured | Simple |
`
};

export function ThemeShowcase() {
  const [selectedTheme, setSelectedTheme] = createSignal('default');
  const currentTheme = () => themes.find(t => t.id === selectedTheme()) || themes[0];

  return (
    <div class="space-y-8">
      {/* Theme Selector */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <For each={themes}>
          {(theme) => (
            <button
              onClick={() => setSelectedTheme(theme.id)}
              class={`p-4 rounded-lg border-2 transition-all ${
                selectedTheme() === theme.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div class="text-2xl mb-2">{theme.icon}</div>
              <div class="font-medium text-sm">{theme.name}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {theme.description}
              </div>
            </button>
          )}
        </For>
      </div>

      {/* Live Preview */}
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div class="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="ml-4 text-sm text-gray-600 dark:text-gray-400">
              Preview: {currentTheme().name} Theme
            </span>
          </div>
        </div>

        <div class="p-6" style={{ "min-height": '400px' }}>
          <div class="max-w-4xl mx-auto">
            <div class="mb-6">
              <h1 class="text-3xl font-bold mb-2">{previewContent.title}</h1>
              <p class="text-lg text-gray-600 dark:text-gray-400">{previewContent.excerpt}</p>
            </div>

            <div class="prose prose-lg max-w-none" innerHTML={previewContent.content} />
          </div>
        </div>
      </div>

      {/* Theme Info */}
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-4">Current Theme: {currentTheme().name}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">{currentTheme().description}</p>
            <p class="text-xs text-gray-500 dark:text-gray-500">Package: @sylphx/leaf-theme-{currentTheme().id}</p>
          </div>
          <div class="flex items-center justify-end">
            <button
              onClick={() => {
                // Copy theme configuration
                const config = `theme: {
  name: '@sylphx/leaf-theme-${currentTheme().id}',
  config: {
    // Theme-specific options
  }
}`;
                navigator.clipboard.writeText(config);
                alert('Theme configuration copied to clipboard!');
              }}
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Copy Config
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
