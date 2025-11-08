import type { Plugin } from "vite";
import type { LeafConfig } from "../types.js";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function virtualModulesPlugin(config: LeafConfig): Plugin {
	const configModuleId = "virtual:leaf/config";
	const resolvedConfigId = "\0" + configModuleId;

	const clientModuleId = "/@leaf/client";
	const resolvedClientId = "\0" + clientModuleId;

	return {
		name: "leaf:virtual-modules",
		resolveId(id) {
			if (id === configModuleId) {
				return resolvedConfigId;
			}
			if (id === clientModuleId) {
				return resolvedClientId;
			}
			return null;
		},
		async load(id) {
			// Provide config as a virtual module
			if (id === resolvedConfigId) {
				return `export default ${JSON.stringify(config)}`;
			}

			// Provide client entry as a virtual module
			if (id === resolvedClientId) {
				// Go up from dist/src/plugins to packages/core, then to templates
				const templatePath = resolve(__dirname, "../../../templates/client.tsx");
				const clientCode = await readFile(templatePath, "utf-8");
				return clientCode;
			}

			return null;
		},
	};
}
