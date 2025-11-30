import { join } from "node:path";
import type { Plugin } from "vite";
import solidPlugin from "vite-plugin-solid";
import { generateSearchIndex } from "../build/search.js";
import type { LeafConfig } from "../types.js";
import { generateRoutes } from "../utils/routes.js";
import { assetsPlugin } from "./assets.js";
import { markdownPlugin } from "./markdown.js";
import { virtualModulesPlugin } from "./virtual-modules.js";

export function createLeafPlugin(config: LeafConfig): Plugin[] {
	return [
		{
			name: "leaf:config",
			config(_, { mode }) {
				const isProduction = mode === "production";
				return {
					define: {
						__LEAF_CONFIG__: JSON.stringify(config),
						"process.env.NODE_ENV": JSON.stringify(mode),
						__DEV__: !isProduction,
					},
					resolve: {
						conditions: isProduction
							? ["production", "default"]
							: ["development", "default"],
					},
					optimizeDeps: {
						include: ["solid-js", "solid-js/web", "@solidjs/router"],
					},
				};
			},
		},
		{
			name: "leaf:search-index-dev",
			async configureServer(server) {
				// Generate search index on server start
				const routes = await generateRoutes(process.cwd());
				const publicDir = join(process.cwd(), "public");
				await generateSearchIndex(routes, publicDir);

				// Watch for markdown file changes and regenerate search index
				server.watcher.on("change", async (file) => {
					if (file.endsWith(".md")) {
						console.log("Regenerating search index...");
						const routes = await generateRoutes(process.cwd());
						await generateSearchIndex(routes, publicDir);
					}
				});
			},
		},
		assetsPlugin(config),
		virtualModulesPlugin(config),
		markdownPlugin(config),
		solidPlugin({
			include: ["**/*.{ts,tsx,js,jsx}", "**/*.md.tsx"],
		}),
	];
}
