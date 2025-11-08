import preact from "@preact/preset-vite";
import type { Plugin } from "vite";
import { markdownPlugin } from "./markdown.js";
import { virtualModulesPlugin } from "./virtual-modules.js";
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
						alias: {
							react: "preact/compat",
							"react-dom": "preact/compat",
						},
					},
					optimizeDeps: {
						include: ["preact/compat", "preact/hooks"],
					},
				};
			},
		},
		virtualModulesPlugin(config),
		markdownPlugin(config),
		preact(),
	];
}
