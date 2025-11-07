import { resolve } from "node:path";
import { createLeafPlugin, loadConfig } from "@sylphx/leaf";
import { createServer } from "vite";

export async function dev(root: string = process.cwd()): Promise<void> {
	const config = await loadConfig(root);

	const server = await createServer({
		root,
		plugins: createLeafPlugin(config),
		server: {
			port: 5173,
			open: true,
		},
	});

	await server.listen();

	server.printUrls();
	server.bindCLIShortcuts({ print: true });
}
