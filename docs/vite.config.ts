import { defineConfig } from "vite";
import {
	createReactPressPlugin,
	loadConfig,
	routesPlugin,
} from "@sylphx/reactpress";
import { resolve } from "node:path";

const docsDir = resolve(process.cwd(), "docs");
const config = await loadConfig(process.cwd());

export default defineConfig({
	plugins: [routesPlugin(docsDir), ...createReactPressPlugin(config)],
});
