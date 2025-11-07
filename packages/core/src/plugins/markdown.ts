import { readFile } from "node:fs/promises";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Plugin } from "vite";
import type { ReactPressConfig } from "../types.js";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import { remarkContainers } from "./remark-containers.js";
import { remarkCodeGroups } from "./remark-code-groups.js";
import { remarkCodeMeta } from "./remark-code-meta.js";
import { remarkBadge } from "./remark-badge.js";
import { rehypeLineHighlight } from "./rehype-line-highlight.js";
import { rehypeExternalLinks } from "./rehype-external-links.js";

interface TocItem {
	text: string;
	id: string;
	level: number;
}

export function markdownPlugin(config: ReactPressConfig): Plugin {
	return {
		name: "reactpress:markdown",
		enforce: "pre",

		async load(id: string) {
			// Only process .md and .mdx files
			if (!id.endsWith(".md") && !id.endsWith(".mdx")) {
				return null;
			}

			// Read the markdown file
			const code = await readFile(id, "utf-8");

			// Extract TOC
			const toc: TocItem[] = [];

			// Plugin to extract headings for TOC
			function extractToc() {
				return (tree: Root) => {
					visit(tree, "heading", (node) => {
						if (node.depth >= 2 && node.depth <= 3) {
							const text = node.children
								.filter((child) => child.type === "text")
								.map((child: any) => child.value)
								.join("");

							// Generate ID from text (same logic as rehype-slug)
							const id = text
								.toLowerCase()
								.replace(/\s+/g, "-")
								.replace(/[^\w-]/g, "");

							toc.push({
								text,
								id,
								level: node.depth,
							});
						}
					});
				};
			}

			// Process markdown with unified
			const processor = unified()
				.use(remarkParse)
				.use(remarkGfm)
				.use(remarkMath) // Process math equations
				.use(remarkBadge) // Process badges in markdown text
				.use(remarkCodeGroups) // Must run before remarkContainers
				.use(remarkContainers)
				.use(remarkCodeMeta)
				.use(extractToc)
				.use(...(config.markdown?.remarkPlugins || []))
				.use(remarkRehype, { allowDangerousHtml: true })
				.use(rehypeSlug)
				.use(rehypeKatex) // Render math equations with KaTeX
				.use(rehypeHighlight)
				.use(rehypeLineHighlight)
				.use(rehypeExternalLinks) // Add external link icons
				.use(...(config.markdown?.rehypePlugins || []))
				.use(rehypeStringify, { allowDangerousHtml: true });

			const vfile = await processor.process(code);
			const html = String(vfile);

			// Generate React component that renders the HTML and exports TOC
			// Use React.createElement to avoid JSX parsing issues
			const component = `
import React from 'react';

export const toc = ${JSON.stringify(toc)};

export default function MarkdownContent() {
  return React.createElement('div', {
    className: 'markdown-content',
    dangerouslySetInnerHTML: { __html: ${JSON.stringify(html)} }
  });
}
`;

			return {
				code: component,
				map: null,
			};
		},
	};
}
