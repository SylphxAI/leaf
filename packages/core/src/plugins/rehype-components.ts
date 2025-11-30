import type { Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to extract custom components from HTML
 * Converts component tags like <Cards> into placeholders with component data
 */
export interface ComponentPlaceholder {
	id: string;
	name: string;
	props: Record<string, any>;
}

export function rehypeComponents(): Plugin<[], Root> {
	return (tree, file) => {
		const components: ComponentPlaceholder[] = [];
		let componentId = 0;

		visit(tree, "element", (node, index, parent) => {
			// Check if this is a custom component (starts with uppercase)
			if (node.tagName && /^[A-Z]/.test(node.tagName)) {
				const id = `__LEAF_COMPONENT_${componentId++}__`;

				// Extract props from attributes
				const props: Record<string, any> = {};
				if (node.properties) {
					for (const [key, value] of Object.entries(node.properties)) {
						// Convert data- attributes to regular prop names
						const propName = key.startsWith("data-")
							? key.replace(/^data-/, "")
							: key;

						// Try to parse all attribute values as JSON (for arrays, objects, numbers, booleans)
						// If parsing fails, use the string value
						if (typeof value === "string") {
							try {
								props[propName] = JSON.parse(value);
							} catch {
								// Not valid JSON, check if it's a number
								const num = Number(value);
								if (!Number.isNaN(num) && value.trim() !== "") {
									props[propName] = num;
								} else if (value === "true" || value === "false") {
									props[propName] = value === "true";
								} else {
									props[propName] = value;
								}
							}
						} else {
							props[propName] = value;
						}
					}
				}

				// Store component info
				components.push({
					id,
					name: node.tagName,
					props,
				});

				// Replace node with placeholder
				if (parent && index !== null) {
					parent.children[index] = {
						type: "element",
						tagName: "div",
						properties: {
							"data-leaf-component": id,
						},
						children: [],
					};
				}
			}
		});

		// Store components data in file
		file.data.components = components;
	};
}
