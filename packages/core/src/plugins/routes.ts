import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";
import fg from "fast-glob";
import matter from "gray-matter";

export interface RouteData {
	path: string;
	filePath: string;
	title?: string;
	description?: string;
	frontmatter: Record<string, unknown>;
}

export function routesPlugin(docsDir: string): Plugin {
	const VIRTUAL_MODULE_ID = "virtual:reactpress/routes";
	const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

	async function generateRoutesModule(): Promise<string> {
		const files = await fg("**/*.{md,mdx}", {
			cwd: docsDir,
			ignore: ["node_modules", "**/node_modules"],
		});

		const routes: RouteData[] = [];

		for (const file of files) {
			const fullPath = resolve(docsDir, file);
			const content = await readFile(fullPath, "utf-8");
			const { data: frontmatter } = matter(content);

			// Convert file path to URL path
			let urlPath = `/${file.replace(/\.mdx?$/, "")}`;

			// Convert index.md to /
			if (urlPath.endsWith("/index")) {
				urlPath = urlPath.replace(/\/index$/, "") || "/";
			}

			routes.push({
				path: urlPath,
				filePath: fullPath,
				title: frontmatter.title as string | undefined,
				description: frontmatter.description as string | undefined,
				frontmatter,
			});
		}

		// Generate module code with dynamic imports
		// Import both default and named exports (toc, docFooter)
		const imports = routes
			.map(
				(route, index) =>
					`import Route${index}, { toc as toc${index}, docFooter as docFooter${index} } from "${route.filePath.replace(/\\/g, "/")}";`,
			)
			.join("\n");

		const routesList = routes
			.map(
				(route, index) => `  {
    path: "${route.path}",
    component: Route${index},
    toc: toc${index},
    docFooter: docFooter${index},
    data: ${JSON.stringify({
			title: route.title,
			description: route.description,
			frontmatter: route.frontmatter,
		})}
  }`,
			)
			.join(",\n");

		return `${imports}

export const routes = [
${routesList}
];
`;
	}

	return {
		name: "leaf:routes",
		resolveId(id) {
			if (id === VIRTUAL_MODULE_ID) {
				return RESOLVED_VIRTUAL_MODULE_ID;
			}
		},
		async load(id) {
			if (id === RESOLVED_VIRTUAL_MODULE_ID) {
				return await generateRoutesModule();
			}
		},
		async handleHotUpdate({ file, server }) {
			// Reload routes when markdown files change
			if (file.startsWith(docsDir) && /\.(md|mdx)$/.test(file)) {
				const module = server.moduleGraph.getModuleById(
					RESOLVED_VIRTUAL_MODULE_ID,
				);
				if (module) {
					server.moduleGraph.invalidateModule(module);
					server.ws.send({
						type: "full-reload",
					});
				}
			}
		},
	};
}
