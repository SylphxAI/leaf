import { readFile } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { Root, Heading, Text } from "mdast";
import matter from "gray-matter";
import { type Route } from "../utils/routes.js";

export interface SearchDocument {
	id: string;
	title: string;
	text: string;
	path: string;
	section?: string;
}

/**
 * Extract text content from markdown AST
 */
function extractText(node: any): string {
	if (node.type === "text") {
		return node.value;
	}
	if (node.children) {
		return node.children.map(extractText).join(" ");
	}
	return "";
}

/**
 * Generate search index from routes
 */
export async function generateSearchIndex(
	routes: Route[],
	outDir: string,
): Promise<void> {
	const documents: SearchDocument[] = [];

	for (const route of routes) {
		const fileContent = await readFile(route.component, "utf-8");
		const { data: frontmatter, content: markdown } = matter(fileContent);

		// Parse markdown to AST
		const tree = (await unified()
			.use(remarkParse)
			.use(remarkGfm)
			.parse(markdown)) as Root;

		// Extract page title
		let pageTitle = frontmatter.title || "Untitled";
		let currentSection = "";
		const sections: { heading: string; text: string[] }[] = [];
		let currentText: string[] = [];

		// Traverse AST to extract headings and content
		visit(tree, (node) => {
			if (node.type === "heading") {
				// Save previous section
				if (currentSection || currentText.length > 0) {
					sections.push({
						heading: currentSection,
						text: currentText,
					});
					currentText = [];
				}

				const headingNode = node as Heading;
				const headingText = extractText(headingNode);

				if (headingNode.depth === 1 && !frontmatter.title) {
					pageTitle = headingText;
				} else {
					currentSection = headingText;
				}
			} else if (node.type === "paragraph" || node.type === "listItem") {
				const text = extractText(node);
				if (text.trim()) {
					currentText.push(text.trim());
				}
			}
		});

		// Save last section
		if (currentSection || currentText.length > 0) {
			sections.push({
				heading: currentSection,
				text: currentText,
			});
		}

		// Create search documents
		// 1. Page-level document (title + first paragraph)
		const firstParagraph = sections[0]?.text[0] || "";
		documents.push({
			id: route.path,
			title: pageTitle,
			text: firstParagraph,
			path: route.path,
		});

		// 2. Section-level documents
		sections.forEach((section, idx) => {
			if (section.heading) {
				documents.push({
					id: `${route.path}#${idx}`,
					title: `${pageTitle} > ${section.heading}`,
					text: section.text.join(" "),
					path: route.path,
					section: section.heading,
				});
			}
		});
	}

	// Write search index
	const indexPath = join(outDir, "search-index.json");
	await writeFile(indexPath, JSON.stringify(documents, null, 2), "utf-8");

	console.log(`✓ Generated search index with ${documents.length} documents`);
}
