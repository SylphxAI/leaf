import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to add anchor links to headings
 * Creates clickable # symbols like VitePress
 */
export const rehypeHeaderAnchors: Plugin<[], Root> = () => {
	return (tree) => {
		visit(tree, "element", (node: Element) => {
			// Process all heading tags (h1-h6)
			if (!["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) return;

			// Skip if no id (rehype-slug should have added it)
			if (!node.properties?.id) return;

			const id = String(node.properties.id);

			// Create anchor link element
			const anchor: Element = {
				type: "element",
				tagName: "a",
				properties: {
					className: ["header-anchor"],
					href: `#${id}`,
					"aria-label": `Permalink to ${node.tagName}`,
				},
				children: [{ type: "text", value: "#" }],
			};

			// Append anchor to heading children (so it appears after the text)
			node.children.push(anchor);
		});
	};
};
