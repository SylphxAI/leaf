import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { createLeafPlugin, loadConfig, routesPlugin } from "@sylphx/leaf";
import { createServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function dev(root: string = process.cwd()): Promise<void> {
	const config = await loadConfig(root);
	const docsDir = resolve(root, config.docsDir || "docs");

	// Path to built-in HTML template
	const templatePath = resolve(
		__dirname,
		"../../../core/templates/index.html"
	);

	const server = await createServer({
		root,
		plugins: [
			routesPlugin(docsDir),
			...createLeafPlugin(config),
			{
				name: "leaf:dev-html",
				configureServer(server) {
					return () => {
						server.middlewares.use(async (req, res, next) => {
							// Serve built-in HTML template for all requests
							if (req.url === "/" || req.url === "/index.html") {
								try {
									const { readFile } = await import("node:fs/promises");
									const html = await readFile(templatePath, "utf-8");
									const transformed = await server.transformIndexHtml(
										req.url,
										html
									);
									res.setHeader("Content-Type", "text/html");
									res.end(transformed);
									return;
								} catch (e) {
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
