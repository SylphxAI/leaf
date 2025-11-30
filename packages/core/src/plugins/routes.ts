import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import type { Plugin } from "vite";
import type { LeafConfig } from "../types.js";
import type { SidebarItem } from "../utils/navigation.js";
import { getPrevNext } from "../utils/navigation.js";

export interface RouteData {
	path: string;
	filePath: string;
	title?: string;
	description?: string;
	frontmatter: Record<string, unknown>;
}

export interface DocFooterData {
	prev?: {
		text: string;
		link: string;
	};
	next?: {
		text: string;
		link: string;
	};
	editLink?: {
		pattern: string;
		text?: string;
	};
	lastUpdated?: boolean;
}

/**
 * Get appropriate sidebar for a given path from object format
 * Matches VitePress behavior: finds the longest matching base path
 */
function getSidebarForPath(
	currentPath: string,
	sidebarObject: Record<string, SidebarItem[]>,
): SidebarItem[] {
	// Sort keys by length (longest first) to match most specific path
	const sortedKeys = Object.keys(sidebarObject).sort(
		(a, b) => b.length - a.length,
	);

	// Find the first matching base path
	for (const basePath of sortedKeys) {
		// Normalize base path (remove trailing slash)
		const normalizedBase = basePath.replace(/\/$/, "");

		// Check if current path starts with this base path
		if (
			currentPath === normalizedBase ||
			currentPath.startsWith(`${normalizedBase}/`)
		) {
			return sidebarObject[basePath];
		}
	}

	// No match found, return empty array
	return [];
}

export function routesPlugin(docsDir: string, config?: LeafConfig): Plugin {
	const VIRTUAL_MODULE_ID = "virtual:leaf/routes";
	const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

	// Track known markdown files for smart HMR
	let knownFiles = new Set<string>();

	async function generateRoutesModule(): Promise<string> {
		const files = await fg("**/*.md", {
			cwd: docsDir,
			ignore: ["node_modules", "**/node_modules"],
		});

		// Update known files for HMR detection
		knownFiles = new Set(files.map((f) => resolve(docsDir, f)));

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

		// Get sidebar from config (handle both array and object formats)
		const sidebar: SidebarItem[] = config?.theme?.sidebar
			? Array.isArray(config.theme.sidebar)
				? config.theme.sidebar
				: getSidebarForPath(route.path, config.theme.sidebar)
			: [];

		// Generate docFooter for each route
		const docFooters = routes.map((route) => {
			const docFooter: DocFooterData = {};

			// Calculate prev/next navigation from sidebar
			const { prev, next } = getPrevNext(route.path, sidebar);
			if (prev) docFooter.prev = prev;
			if (next) docFooter.next = next;

			// Add edit link if configured
			if (config?.theme?.editLink) {
				const relativePath = relative(docsDir, route.filePath);
				const editUrl = config.theme.editLink.pattern.replace(
					":path",
					relativePath,
				);
				docFooter.editLink = {
					pattern: editUrl,
					text: config.theme.editLink.text,
				};
			}

			// Add lastUpdated flag if configured
			if (config?.theme?.lastUpdated) {
				docFooter.lastUpdated = true;
			}

			return docFooter;
		});

		// Generate module code with dynamic imports
		// Import default and toc exports (docFooter now generated here)
		const imports = routes
			.map(
				(route, index) =>
					`import Route${index}, { toc as toc${index} } from "${route.filePath.replace(/\\/g, "/")}";`,
			)
			.join("\n");

		const routesList = routes
			.map(
				(route, index) => `  {
    path: "${route.path}",
    component: Route${index},
    toc: toc${index},
    docFooter: ${JSON.stringify(docFooters[index])},
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
			// Only handle markdown files in docs directory
			if (!file.startsWith(docsDir) || !/\.md$/.test(file)) {
				return;
			}

			// Check if this is a new or deleted file (route structure change)
			const wasKnown = knownFiles.has(file);
			const exists = existsSync(file);

			// New file added or existing file deleted → full reload
			if ((!wasKnown && exists) || (wasKnown && !exists)) {
				const module = server.moduleGraph.getModuleById(
					RESOLVED_VIRTUAL_MODULE_ID,
				);
				if (module) {
					server.moduleGraph.invalidateModule(module);
					server.ws.send({
						type: "full-reload",
					});
				}
				return;
			}

			// Content-only change → let Vite's default HMR handle it
			// The markdown module will be hot-updated automatically
			// No need for full reload or manual intervention
		},
	};
}
