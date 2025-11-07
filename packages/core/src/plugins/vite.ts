import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { markdownPlugin } from "./markdown.js";
import type { ReactPressConfig } from "../types.js";

export function createReactPressPlugin(config: ReactPressConfig): Plugin[] {
	return [
		{
			name: "reactpress:config",
			config() {
				return {
					define: {
						__REACTPRESS_CONFIG__: JSON.stringify(config),
					},
				};
			},
		},
		markdownPlugin(config),
		...react({
			jsxRuntime: "automatic",
		}),
	];
}
