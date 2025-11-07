import {
	createLeafPlugin,
	generateStaticSite,
	loadConfig,
	routesPlugin,
} from "@sylphx/leaf";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build as viteBuild } from "vite";

export async function build(root: string = process.cwd()): Promise<void> {
	const config = await loadConfig(root);
	const outDir = resolve(root, "dist");

	console.log("Building client bundle...");

	// Build the client-side bundle
	await viteBuild({
		root,
		plugins: [
			routesPlugin(resolve(root, "docs")),
			...createLeafPlugin(config),
		],
		build: {
			outDir,
			emptyOutDir: true,
			rollupOptions: {
				input: {
					main: resolve(root, "index.html"),
				},
			},
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
}
