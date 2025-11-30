import type { Plugin as UnifiedPlugin } from "unified";
import type { Plugin as VitePlugin } from "vite";

/**
 * Remark plugin (processes markdown AST)
 * Can be either:
 * - A plugin function
 * - A tuple of [plugin, options]
 */
export type RemarkPlugin = UnifiedPlugin | [UnifiedPlugin, ...any[]] | any; // Fallback for flexibility

/**
 * Rehype plugin (processes HTML AST)
 * Can be either:
 * - A plugin function
 * - A tuple of [plugin, options]
 */
export type RehypePlugin = UnifiedPlugin | [UnifiedPlugin, ...any[]] | any; // Fallback for flexibility

/**
 * Configuration for Leaf markdown plugins
 */
export interface LeafPluginConfig {
	/**
	 * Custom remark plugins to process markdown
	 * These run before conversion to HTML
	 */
	remarkPlugins?: RemarkPlugin[];

	/**
	 * Custom rehype plugins to process HTML
	 * These run after conversion from markdown
	 */
	rehypePlugins?: RehypePlugin[];
}

/**
 * Vite plugin configuration for Leaf
 */
export interface LeafVitePluginConfig {
	/**
	 * Additional Vite plugins
	 */
	plugins?: VitePlugin[];
}

/**
 * Note: Built-in plugins are exported from the main index.ts
 * This file focuses on plugin types and configuration
 */
