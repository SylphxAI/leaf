import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createLeafPlugin, loadConfig, routesPlugin } from "@sylphx/leaf";
import { createServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function dev(root: string = process.cwd()): Promise<void> {
	const config = await loadConfig(root);
	const docsDir = resolve(root, config.docsDir || "docs");

	// Paths to built-in templates
	const builtInHtmlPath = resolve(
		__dirname,
		"../../../core/templates/index.html",
	);
	const builtInClientPath = resolve(
		__dirname,
		"../../../core/templates/client.tsx",
	);

	// Create .leaf temp directory for dev artifacts
	const leafTempDir = join(root, ".leaf");
	await mkdir(leafTempDir, { recursive: true });

	// Copy client template to .leaf directory so Vite can process it
	const tempClientPath = join(leafTempDir, "client.tsx");
	const clientTemplate = await readFile(builtInClientPath, "utf-8");
	await writeFile(tempClientPath, clientTemplate, "utf-8");

	const server = await createServer({
		root,
		plugins: [
			routesPlugin(docsDir, config),
			...createLeafPlugin(config),
			{
				name: "leaf:dev-html",
				configureServer(server) {
					return () => {
						server.middlewares.use(async (req, res, next) => {
							// Serve built-in HTML template for all requests
							if (req.url === "/" || req.url === "/index.html") {
								try {
									const html = await readFile(builtInHtmlPath, "utf-8");
									const transformed = await server.transformIndexHtml(
										req.url,
										html,
									);
									res.setHeader("Content-Type", "text/html");
									res.end(transformed);
									return;
								} catch (_e) {
									// Fall through to default handling
								}
							}
							next();
						});
					};
				},
			},
		],
		server: {
			port: 5173,
			open: true,
		},
	});

	await server.listen();

	server.printUrls();
	server.bindCLIShortcuts({ print: true });
}
