import { preview as vitePreview } from "vite";

export async function preview(root: string = process.cwd()): Promise<void> {
	const server = await vitePreview({
		root,
		preview: {
			port: 4173,
			open: true,
		},
	});

	server.printUrls();
}
