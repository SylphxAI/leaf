import solidPlugin from "vite-plugin-solid";
import type { Plugin } from "vite";
import { markdownPlugin } from "./markdown.js";
import { virtualModulesPlugin } from "./virtual-modules.js";
import { assetsPlugin } from "./assets.js";
import type { LeafConfig } from "../types.js";

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
						conditions: isProduction ? ["production", "default"] : ["development", "default"],
					},
					optimizeDeps: {
						include: ["solid-js", "solid-js/web", "@solidjs/router", "html-react-parser"],
					},
				};
			},
		},
		assetsPlugin(config),
		virtualModulesPlugin(config),
		markdownPlugin(config),
		solidPlugin(),
	];
}
