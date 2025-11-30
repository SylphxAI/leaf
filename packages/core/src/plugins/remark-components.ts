import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Remark plugin to detect custom components in HTML blocks
 * Runs before rehype conversion to catch components before HTML normalization
 */
export interface ComponentPlaceholder {
	id: string;
	name: string;
	props: Record<string, any>;
}

export function remarkComponents(): Plugin<[], Root> {
	return (tree, file) => {
		const components: ComponentPlaceholder[] = [];
		let componentId = 0;

		visit(tree, "html", (node) => {
			// Match self-closing or opening tags that start with uppercase
			// e.g., <Cards attr="value" /> or <Cards attr="value">
			const componentRegex = /<([A-Z][A-Za-z0-9]*)\s+([^>]*?)\s*\/?>/g;
			let match;

			while ((match = componentRegex.exec(node.value)) !== null) {
				const tagName = match[1];
				const attrsString = match[2];
				const id = `__LEAF_COMPONENT_${componentId++}__`;

				// Parse attributes
				const props: Record<string, any> = {};
				const attrRegex = /([a-zA-Z][a-zA-Z0-9-_]*)=(['"])(.*?)\2/g;
				let attrMatch;

				while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
					const attrName = attrMatch[1];
					const attrValue = attrMatch[3];

					// Try to parse as JSON
					try {
						props[attrName] = JSON.parse(attrValue);
					} catch {
						// Not valid JSON, check if it's a number
						const num = Number(attrValue);
						if (!Number.isNaN(num) && attrValue.trim() !== "") {
							props[attrName] = num;
						} else if (attrValue === "true" || attrValue === "false") {
							props[attrName] = attrValue === "true";
						} else {
							props[attrName] = attrValue;
						}
					}
				}

				// Store component info
				components.push({
					id,
					name: tagName,
					props,
				});

				// Replace the component tag with a placeholder div
				node.value = node.value.replace(
					match[0],
					`<div data-leaf-component="${id}"></div>`,
				);
			}
		});

		// Store components data in file
		file.data.components = components;
	};
}
