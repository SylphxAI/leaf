import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import type { LeafConfig } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function assetsPlugin(_config: LeafConfig): Plugin {
	return {
		name: "leaf:assets",
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				// Serve default OG images
				if (req.url === "/og-image.svg" || req.url === "/twitter-image.svg") {
					try {
						const themeDefaultPath = resolve(
							__dirname,
							"../../../theme-default/src/assets",
						);
						const imagePath = join(themeDefaultPath, req.url!.replace("/", ""));
						const imageBuffer = await readFile(imagePath);
						res.setHeader("Content-Type", "image/svg+xml");
						res.end(imageBuffer);
						return;
					} catch (_error) {
						next();
					}
				}
				next();
			});
		},
		writeBundle(options, _bundle) {
			// Copy assets during build - using writeBundle instead of generateBundle
			if (this.meta.watchMode) return; // Skip in dev mode

			const themeDefaultAssetsPath = resolve(
				__dirname,
				"../../../theme-default/src/assets",
			);

			// Copy OG images
			const assets = ["og-image.svg", "twitter-image.svg"];

			assets.forEach(async (asset) => {
				try {
					const sourcePath = join(themeDefaultAssetsPath, asset);
					const _targetPath = join(options.dir || "dist", asset);
					const imageBuffer = await readFile(sourcePath);

					// Emit the file using Vite's API
					this.emitFile({
						type: "asset",
						fileName: asset,
						source: imageBuffer,
					});

					console.log(`✓ Emitted ${asset}`);
				} catch (error) {
					console.warn(`Warning: Could not emit ${asset}:`, error);
				}
			});
		},
	};
}
