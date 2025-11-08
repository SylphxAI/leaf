import {
	createLeafPlugin,
	generateStaticSite,
	loadConfig,
	routesPlugin,
} from "@sylphx/leaf";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build as viteBuild } from "vite";

const root = process.cwd();
const config = await loadConfig(root);
const outDir = resolve(root, "dist");

// FORCE production environment
process.env.NODE_ENV = "production";

console.log("Building Leaf documentation...");

// Build the client-side bundle
await viteBuild({
	root,
	mode: "production",
	plugins: [
		routesPlugin(resolve(root, "docs")),
		...createLeafPlugin(config),
	],
	define: {
		"process.env.NODE_ENV": JSON.stringify("production"),
		__DEV__: false,
	},
	build: {
		outDir,
		emptyOutDir: true,
		minify: "esbuild",
	},
});

console.log("✓ Client bundle built");

// Read the generated HTML template
const templatePath = resolve(outDir, "index.html");
const template = await readFile(templatePath, "utf-8");

// Generate static HTML for all routes
await generateStaticSite({
	root,
	outDir,
	template,
	clientBundle: "/assets/main.js",
});

console.log("\n✓ Build completed successfully!");
console.log(`\nOutput: ${outDir}`);
