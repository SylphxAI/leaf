import { readFile } from "node:fs/promises";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import type { Plugin } from "vite";
import type { ReactPressConfig } from "../types.js";

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

			// Process markdown with unified
			const processor = unified()
				.use(remarkParse)
				.use(remarkGfm)
				.use(...(config.markdown?.remarkPlugins || []))
				.use(remarkRehype, { allowDangerousHtml: true })
				.use(rehypeSlug)
				.use(rehypeHighlight)
				.use(...(config.markdown?.rehypePlugins || []))
				.use(rehypeStringify, { allowDangerousHtml: true });

			const vfile = await processor.process(code);
			const html = String(vfile);

			// Generate React component that renders the HTML
			// Use React.createElement to avoid JSX parsing issues
			const component = `
import React from 'react';

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
