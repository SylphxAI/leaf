import { readFile } from "node:fs/promises";
import { basename, dirname, join, relative } from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";

export interface SidebarItem {
	text: string;
	link?: string;
	items?: SidebarItem[];
	collapsed?: boolean;
}

interface FileInfo {
	path: string;
	relativePath: string;
	title: string;
	order?: number;
}

/**
 * Auto-generate sidebar from file structure
 * Supports:
 * - Nested folders as groups
 * - Frontmatter title override
 * - Custom ordering via frontmatter.order
 * - Index files become group links
 */
export async function generateSidebar(
	docsDir: string,
): Promise<SidebarItem[]> {
	// Find all markdown files
	const files = await fg("**/*.{md,mdx}", {
		cwd: docsDir,
		ignore: ["node_modules", "**/node_modules"],
	});

	// Read frontmatter from all files
	const fileInfos: FileInfo[] = [];

	for (const file of files) {
		const fullPath = join(docsDir, file);
		const content = await readFile(fullPath, "utf-8");
		const { data: frontmatter } = matter(content);

		// Generate title from filename or frontmatter
		let title = frontmatter.title;
		if (!title) {
			const filename = basename(file, file.endsWith(".mdx") ? ".mdx" : ".md");
			if (filename === "index") {
				const dirName = basename(dirname(file));
				title = dirName === "." ? "Introduction" : capitalize(dirName);
			} else {
				title = capitalize(filename.replace(/-/g, " "));
			}
		}

		fileInfos.push({
			path: fullPath,
			relativePath: file,
			title,
			order: frontmatter.order ?? Number.POSITIVE_INFINITY,
		});
	}

	// Build tree structure
	const tree = buildTree(fileInfos);

	return tree;
}

function buildTree(fileInfos: FileInfo[]): SidebarItem[] {
	const root: SidebarItem[] = [];
	const dirMap = new Map<string, SidebarItem>();

	// Sort files by order, then by path
	const sortedFiles = [...fileInfos].sort((a, b) => {
		if (a.order !== b.order) {
			return a.order! - b.order!;
		}
		return a.relativePath.localeCompare(b.relativePath);
	});

	for (const file of sortedFiles) {
		const parts = file.relativePath.split("/");
		const filename = parts[parts.length - 1];
		const isIndex = filename.startsWith("index.");

		// Generate URL path
		let urlPath = `/${file.relativePath.replace(/\.mdx?$/, "")}`;
		if (urlPath.endsWith("/index")) {
			urlPath = urlPath.replace(/\/index$/, "") || "/";
		}

		const item: SidebarItem = {
			text: file.title,
			link: urlPath,
		};

		// Root level file
		if (parts.length === 1) {
			if (!isIndex || urlPath === "/") {
				root.push(item);
			}
			continue;
		}

		// Nested file - create parent groups as needed
		let currentLevel = root;
		let currentPath = "";

		for (let i = 0; i < parts.length - 1; i++) {
			currentPath += (i > 0 ? "/" : "") + parts[i];
			let group = dirMap.get(currentPath);

			if (!group) {
				group = {
					text: capitalize(parts[i].replace(/-/g, " ")),
					items: [],
				};
				dirMap.set(currentPath, group);
				currentLevel.push(group);
			}

			currentLevel = group.items!;
		}

		// Add file to its parent group
		if (isIndex) {
			// Index file becomes the group's link
			const group = dirMap.get(currentPath);
			if (group) {
				group.link = urlPath;
				group.text = file.title; // Use frontmatter title for group
			}
		} else {
			currentLevel.push(item);
		}
	}

	return root;
}

function capitalize(str: string): string {
	return str
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}
