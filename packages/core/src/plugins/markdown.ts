import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import type { Plugin } from "vite";
import type { LeafConfig } from "../types.js";
import { createMarkdownProcessor } from "../markdown/processor.js";
import type { ComponentPlaceholder } from "./rehype-components.js";

export function markdownPlugin(config: LeafConfig): Plugin {
	return {
		name: "leaf:markdown",
		enforce: "pre",

		resolveId(source: string) {
			// Transform .md imports to .md.tsx so SolidJS plugin processes them
			if (source.endsWith(".md")) {
				return source + ".tsx";
			}
			return null;
		},

		async load(id: string) {
			// Only process .md.tsx files (virtual modules created from .md)
			if (!id.endsWith(".md.tsx")) {
				return null;
			}

			// Remove the .tsx extension to get the actual .md file path
			const mdPath = id.slice(0, -4);

			// Read the markdown file from the original path
			const rawCode = await readFile(mdPath, "utf-8");

			// Parse frontmatter and extract content
			const { content: code } = matter(rawCode);

			// Create unified processor with TOC extraction
			const { processor, getToc } = createMarkdownProcessor({
				config,
				extractToc: true,
			});

			const vfile = await processor.process(code);
			const html = String(vfile);
			const toc = getToc();
			const components = (vfile.data.components as ComponentPlaceholder[]) || [];


			// Generate component imports if any components were detected
			const hasComponents = components.length > 0;
			const uniqueComponents = Array.from(
				new Set(components.map((c) => c.name)),
			);

			// TEMPORARY: Disable components in markdown - innerHTML + component mounting doesn't work in SolidJS
			// TODO: Implement proper HTML-to-SolidJS conversion or use a different approach
			let componentImports = '';
			let componentMapping = "";
			let htmlContent = JSON.stringify(html);
			let renderFunction = `
  const htmlContent = ${htmlContent};
  return <div class="markdown-content" innerHTML={htmlContent} />;`;

			// Check if Cards component is used
			if (components.length > 0 && components.some(c => c.name === 'Cards')) {
				componentImports = `import { Cards } from "@sylphx/leaf-theme-default";`;

				const cardsComponents = components.filter(c => c.name === 'Cards');

				// Remove Cards placeholders from HTML
				let modifiedHtml = html;
				for (const comp of cardsComponents) {
					modifiedHtml = modifiedHtml.replace(
						new RegExp(`<div data-leaf-component="${comp.id}"></div>`, 'g'),
						`__CARDS_${comp.id}__`
					);
				}
				htmlContent = JSON.stringify(modifiedHtml);

				// Generate render function with Cards components
				const cardsRenderers = cardsComponents.map(comp => {
					const cardsData = comp.props.cards || [];
					const columns = comp.props.columns || 2;
					return `<Cards cards={${JSON.stringify(cardsData)}} columns={${columns}} />`;
				}).join('\n      ');

				renderFunction = `
  let htmlContent = ${htmlContent};
  ${cardsComponents.map((comp, idx) => `
  htmlContent = htmlContent.replace('__CARDS_${comp.id}__', '<!--CARDS_PLACEHOLDER_${idx}-->');`).join('')}

  const parts = htmlContent.split(/<!--CARDS_PLACEHOLDER_\\d+-->/);

  return (
    <>
      <div class="markdown-content" innerHTML={parts[0]} />
      ${cardsComponents.map((comp, idx) => `
      <Cards cards={${JSON.stringify(comp.props.cards || [])}} columns={${comp.props.columns || 2}} />
      {parts[${idx + 1}] && <div class="markdown-content" innerHTML={parts[${idx + 1}]} />}`).join('\n      ')}
    </>
  );`;
			}

			// Generate SolidJS component that renders the HTML and exports TOC
			const component = `
import { template as _$template } from "solid-js/web";
import { createComponent as _$createComponent } from "solid-js/web";
${componentImports}
// Build-time TOC as fallback
const buildTimeToc = ${JSON.stringify(toc)};

// Try to read preloaded data from SSG (preferred)
let runtimeToc = buildTimeToc;
let preloadedLastModified = null;

if (typeof window !== 'undefined') {
  const preloadScript = document.getElementById('__LEAF_PRELOAD__');
  if (preloadScript) {
    try {
      const preloadData = JSON.parse(preloadScript.textContent || '{}');
      if (preloadData.toc && preloadData.toc.length > 0) {
        runtimeToc = preloadData.toc;
      }
      preloadedLastModified = preloadData.lastModified;
    } catch (e) {
      // Ignore preload errors, use build-time TOC
    }
  }
}

// Export runtime TOC (preloaded from SSG, or build-time fallback)
export const toc = runtimeToc;
${componentMapping}
export default function MarkdownContent() {${renderFunction}}
`;

			return {
				code: component,
				map: null,
			};
		},
	};
}
