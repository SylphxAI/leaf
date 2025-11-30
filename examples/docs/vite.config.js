import { resolve } from "node:path";
import { createLeafPlugin, routesPlugin } from "@sylphx/leaf";
import { defineConfig } from "vite";

const docsDir = resolve(process.cwd(), "docs");

export default defineConfig({
	plugins: [
		routesPlugin(docsDir),
		...createLeafPlugin({
			title: "Sylphx Documentation",
			description: "Documentation for Sylphx tools",
			base: "/",
		}),
	],
	resolve: {
		dedupe: ["solid-js", "solid-js/web"],
	},
});
