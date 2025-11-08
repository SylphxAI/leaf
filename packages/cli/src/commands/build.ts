import {
	createLeafPlugin,
	generateStaticSite,
	loadConfig,
	routesPlugin,
} from "@sylphx/leaf";
import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { build as viteBuild } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function build(root: string = process.cwd()): Promise<void> {
	const config = await loadConfig(root);
	const docsDir = resolve(root, config.docsDir || "docs");
	const outDir = resolve(root, "dist");

	console.log("Building client bundle...");

	// Path to built-in HTML template
	const builtInTemplatePath = resolve(
		__dirname,
		"../../../core/templates/index.html"
	);

	// Read built-in template
	const builtInTemplate = await readFile(builtInTemplatePath, "utf-8");

	// Write to a temporary location for Vite to process
	const tempHtmlPath = resolve(root, ".leaf-temp-index.html");
	await writeFile(tempHtmlPath, builtInTemplate, "utf-8");

	try {
		// Build the client-side bundle
		await viteBuild({
			root,
			plugins: [routesPlugin(docsDir), ...createLeafPlugin(config)],
			build: {
				outDir,
				emptyOutDir: true,
				rollupOptions: {
					input: {
						main: tempHtmlPath,
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
	} finally {
		// Clean up temporary file
		try {
			const { unlink } = await import("node:fs/promises");
			await unlink(tempHtmlPath);
		} catch {
			// Ignore errors
		}
	}
}
