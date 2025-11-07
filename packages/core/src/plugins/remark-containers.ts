import type { Root, Paragraph } from "mdast";
import type { Plugin } from "unified";

/**
 * Remark plugin for custom containers
 * Supports: ::: tip, ::: warning, ::: danger, ::: details
 */
export const remarkContainers: Plugin<[], Root> = () => {
	return (tree) => {
		const newChildren: any[] = [];
		let i = 0;

		while (i < tree.children.length) {
			const node = tree.children[i];

			// Check if this is an opening container marker
			if (
				node.type === "paragraph" &&
				node.children.length === 1 &&
				node.children[0].type === "text"
			) {
				const text = node.children[0].value.trim();
				const match = text.match(/^:::(\w+)(?:\s+(.+))?$/);

				if (match) {
					const type = match[1]; // tip, warning, danger, details
					const title = match[2]?.trim();

					// Find the closing :::
					let endIndex = i + 1;
					while (endIndex < tree.children.length) {
						const child = tree.children[endIndex];
						if (
							child.type === "paragraph" &&
							child.children.length === 1 &&
							child.children[0].type === "text" &&
							child.children[0].value.trim() === ":::"
						) {
							break;
						}
						endIndex++;
					}

					if (endIndex < tree.children.length) {
						// Extract content between markers
						const content = tree.children.slice(i + 1, endIndex);

						// Create container as a div (html node)
						const container: any = {
							type: "html",
							value: `<div class="custom-block custom-block-${type}"><p class="custom-block-title">${title || capitalize(type)}</p>`,
						};

						// Create closing div
						const closingDiv: any = {
							type: "html",
							value: "</div>",
						};

						newChildren.push(container);
						newChildren.push(...content);
						newChildren.push(closingDiv);
						i = endIndex + 1;
						continue;
					}
				}
			}

			newChildren.push(node);
			i++;
		}

		tree.children = newChildren;
	};
};

function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
