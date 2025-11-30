import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
	createLeafPlugin,
	generateStaticSite,
	loadConfig,
	routesPlugin,
} from "@sylphx/leaf";
import { build as viteBuild } from "vite";

const root = process.cwd();
const config = await loadConfig(root);
const outDir = resolve(root, "dist");

console.log("Building client bundle...");

// Build the client-side bundle
await viteBuild({
	root,
	mode: "production",
	plugins: [routesPlugin(resolve(root, "docs")), ...createLeafPlugin(config)],
	build: {
		outDir,
		emptyOutDir: true,
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
