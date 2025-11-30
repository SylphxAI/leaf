import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import type { LeafConfig } from "../types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function virtualModulesPlugin(config: LeafConfig): Plugin {
	const configModuleId = "virtual:leaf/config";
	const resolvedConfigId = `\0${configModuleId}`;

	const clientModuleId = "/@leaf/client";
	const resolvedClientId = `\0${clientModuleId}`;

	return {
		name: "leaf:virtual-modules",
		resolveId(id) {
			if (id === configModuleId) {
				return resolvedConfigId;
			}
			if (id === clientModuleId) {
				// Add .tsx extension so Vite knows to process it as JSX
				return `${resolvedClientId}.tsx`;
			}
			return null;
		},
		async load(id) {
			// Provide config as a virtual module
			if (id === resolvedConfigId) {
				return `export default ${JSON.stringify(config)}`;
			}

			// Provide client entry as a virtual module
			if (id === `${resolvedClientId}.tsx`) {
				// Go up from dist/src/plugins to packages/core, then to templates
				const templatePath = resolve(
					__dirname,
					"../../../templates/client.tsx",
				);
				const clientCode = await readFile(templatePath, "utf-8");
				return {
					code: clientCode,
					map: null,
				};
			}

			return null;
		},
	};
}
