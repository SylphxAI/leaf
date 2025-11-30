import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
	createLeafPlugin,
	generateStaticSite,
	loadConfig,
	routesPlugin,
} from "@sylphx/leaf";
import { build as viteBuild } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function build(root: string = process.cwd()): Promise<void> {
	const config = await loadConfig(root);
	const docsDir = resolve(root, config.docsDir || "docs");
	const outDir = resolve(root, "dist");

	console.log("Building client bundle...");

	// Paths to built-in templates
	const builtInHtmlPath = resolve(
		__dirname,
		"../../../core/templates/index.html",
	);
	const builtInClientPath = resolve(
		__dirname,
		"../../../core/templates/client.tsx",
	);

	// Read built-in templates
	const builtInHtml = await readFile(builtInHtmlPath, "utf-8");
	const builtInClient = await readFile(builtInClientPath, "utf-8");

	// Create .leaf temp directory in project root for build artifacts
	// This keeps temp files organized and easy to gitignore
	const leafTempDir = join(root, ".leaf");
	await mkdir(leafTempDir, { recursive: true });

	// Write to temporary locations for Vite to process
	const tempHtmlPath = join(leafTempDir, "index.html");
	const tempClientPath = join(leafTempDir, "client.tsx");
	await writeFile(tempHtmlPath, builtInHtml, "utf-8");
	await writeFile(tempClientPath, builtInClient, "utf-8");

	try {
		// Build the client-side bundle
		await viteBuild({
			root,
			plugins: [routesPlugin(docsDir, config), ...createLeafPlugin(config)],
			build: {
				outDir,
				emptyOutDir: true,
				rollupOptions: {
					input: {
						index: tempHtmlPath,
					},
					output: {
						entryFileNames: "assets/[name]-[hash].js",
						chunkFileNames: "assets/[name]-[hash].js",
						assetFileNames: "assets/[name]-[hash].[ext]",
					},
				},
			},
		});

		console.log("✓ Client bundle built");

		// Vite preserves input directory structure, so it outputs to dist/.leaf/index.html
		// Move it to dist/index.html for proper site structure
		const { rename: renameFile, rm } = await import("node:fs/promises");
		const generatedHtmlPath = join(outDir, ".leaf", "index.html");
		const finalHtmlPath = join(outDir, "index.html");
		await renameFile(generatedHtmlPath, finalHtmlPath);

		// Clean up empty .leaf directory in dist
		const distLeafDir = join(outDir, ".leaf");
		await rm(distLeafDir, { recursive: true, force: true });

		// Read the generated HTML template
		const template = await readFile(finalHtmlPath, "utf-8");

		// Generate static HTML for all routes
		await generateStaticSite({
			root,
			outDir,
			template,
			clientBundle: "/assets/main.js",
		});

		console.log("\n✓ Build completed successfully!");
	} finally {
		// Clean up .leaf temp directory
		try {
			const { rm } = await import("node:fs/promises");
			await rm(leafTempDir, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	}
}
