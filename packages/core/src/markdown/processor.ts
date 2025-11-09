import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import type { Processor } from "unified";
import type { LeafConfig } from "../types.js";
import { remarkContainers } from "../plugins/remark-containers.js";
import { remarkCodeGroups } from "../plugins/remark-code-groups.js";
import { remarkCodeMeta } from "../plugins/remark-code-meta.js";
import { remarkBadge } from "../plugins/remark-badge.js";
import { rehypeLineHighlight } from "../plugins/rehype-line-highlight.js";
import { rehypeExternalLinks } from "../plugins/rehype-external-links.js";
import { rehypeMermaid } from "../plugins/rehype-mermaid.js";
import { rehypeCopyCode } from "../plugins/rehype-copy-code.js";
import { rehypeHeaderAnchors } from "../plugins/rehype-header-anchors.js";

export interface TocItem {
	text: string;
	id: string;
	level: number;
}

export interface ProcessorOptions {
	config: LeafConfig;
	extractToc?: boolean;
}

export interface ProcessorResult {
	processor: Processor;
	getToc: () => TocItem[];
}

/**
 * Creates a unified markdown processor with consistent plugin pipeline.
 * This ensures dev and build use identical markdown processing.
 */
export function createMarkdownProcessor(
	options: ProcessorOptions,
): ProcessorResult {
	const { config, extractToc: shouldExtractToc = false } = options;
	const toc: TocItem[] = [];

	// Plugin to extract headings for TOC
	function extractTocPlugin() {
		return (tree: Root) => {
			visit(tree, "heading", (node) => {
				if (node.depth >= 2 && node.depth <= 3) {
					const text = node.children
						.filter((child) => child.type === "text")
						.map((child: any) => child.value)
						.join("");

					// Skip headings with no text (e.g., only contain links)
					if (!text || text.trim() === "") {
						return;
					}

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

	// Build unified processor with consistent plugin pipeline
	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkMath)
		.use(remarkBadge)
		.use(remarkCodeGroups)
		.use(remarkContainers)
		.use(remarkCodeMeta)
		// Only add TOC extraction if requested
		.use(shouldExtractToc ? extractTocPlugin : () => {})
		// Add custom remark plugins from config
		.use(...(config.markdown?.remarkPlugins || []))
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeSlug)
		.use(rehypeHeaderAnchors)
		.use(rehypeKatex)
		.use(rehypeMermaid)
		.use(rehypeHighlight)
		.use(rehypeLineHighlight)
		.use(rehypeCopyCode)
		.use(rehypeExternalLinks)
		// Add custom rehype plugins from config
		.use(...(config.markdown?.rehypePlugins || []))
		.use(rehypeStringify, { allowDangerousHtml: true });

	return {
		processor,
		getToc: () => toc,
	};
}
