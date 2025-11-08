import react from "@vitejs/plugin-react";
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
					esbuild: {
						jsx: "automatic",
						jsxDev: false,
						jsxImportSource: "react",
					},
					resolve: {
						conditions: isProduction ? ["production", "default"] : ["development", "default"],
					},
					optimizeDeps: {
						esbuildOptions: {
							jsx: "automatic",
							jsxDev: false,
							define: {
								"process.env.NODE_ENV": JSON.stringify(mode),
							},
						},
					},
				};
			},
		},
		virtualModulesPlugin(config),
		markdownPlugin(config),
		react({
			jsxRuntime: "automatic",
		}),
	];
}
