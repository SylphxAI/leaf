import type { Root, Element } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to add icons to external links
 * Automatically detects links starting with http:// or https://
 */
export const rehypeExternalLinks: Plugin<[], Root> = () => {
	return (tree) => {
		visit(tree, "element", (node: Element) => {
			if (node.tagName !== "a") return;

			const href = node.properties?.href as string | undefined;
			if (!href) return;

			// Check if link is external (starts with http:// or https://)
			const isExternal =
				href.startsWith("http://") || href.startsWith("https://");

			if (isExternal) {
				// Add external class
				const existingClass = (node.properties?.className as string[]) || [];
				node.properties = node.properties || {};
				node.properties.className = [...existingClass, "external-link"];

				// Add target="_blank" and rel="noopener noreferrer"
				node.properties.target = "_blank";
				node.properties.rel = "noopener noreferrer";

				// Wrap icon in span with nowrap to prevent wrapping
				node.children.push({
					type: "element",
					tagName: "span",
					properties: {
						className: ["external-link-icon-wrapper"],
						style: "white-space: nowrap; display: inline-block;",
					},
					children: [
						{
							type: "text",
							value: "\u00A0", // Non-breaking space (&nbsp;)
						} as any,
						{
							type: "element",
							tagName: "svg",
							properties: {
								className: ["external-link-icon"],
								xmlns: "http://www.w3.org/2000/svg",
								width: "16",
								height: "16",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								strokeLinecap: "round",
								strokeLinejoin: "round",
							},
							children: [
								{
									type: "element",
									tagName: "path",
									properties: {
										d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",
									},
									children: [],
								},
								{
									type: "element",
									tagName: "polyline",
									properties: {
										points: "15 3 21 3 21 9",
									},
									children: [],
								},
								{
									type: "element",
									tagName: "line",
									properties: {
										x1: "10",
										y1: "14",
										x2: "21",
										y2: "3",
									},
									children: [],
								},
							],
						} as Element,
					],
				} as Element);
			}
		});
	};
};
