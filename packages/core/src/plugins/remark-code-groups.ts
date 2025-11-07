import type { Root } from "mdast";
import type { Plugin } from "unified";

/**
 * Remark plugin for code groups
 * Syntax: ::: code-group ... :::
 */
export const remarkCodeGroups: Plugin<[], Root> = () => {
	return (tree) => {
		const newChildren: any[] = [];
		let i = 0;

		while (i < tree.children.length) {
			const node = tree.children[i];

			// Check for code-group container
			if (
				node.type === "paragraph" &&
				node.children.length === 1 &&
				node.children[0].type === "text"
			) {
				const text = node.children[0].value.trim();

				// Match ::: code-group with optional trailing content
				if (text.match(/^:::\s*code-group/)) {
					// Find closing :::
					let endIndex = i + 1;
					const codeBlocks: any[] = [];

					while (endIndex < tree.children.length) {
						const child = tree.children[endIndex];

						// Check for closing marker
						if (
							child.type === "paragraph" &&
							child.children.length === 1 &&
							child.children[0].type === "text" &&
							child.children[0].value.trim() === ":::"
						) {
							break;
						}

						// Collect code blocks
						if (child.type === "code") {
							codeBlocks.push(child);
						}

						endIndex++;
					}

					if (endIndex < tree.children.length && codeBlocks.length > 0) {
						// Create code-group container
						const codeGroupData = codeBlocks.map((block) => {
							// Extract tab label from meta (e.g., "[config.js]")
							const meta = block.meta || "";
							const labelMatch = meta.match(/\[([^\]]+)\]/);
							const label = labelMatch ? labelMatch[1] : block.lang || "Code";

							return {
								label,
								language: block.lang || "",
								code: block.value,
								meta: meta.replace(/\[[^\]]+\]/, "").trim(),
							};
						});

						// Create a custom HTML node with embedded data
						const codeGroupNode: any = {
							type: "html",
							value: `<div class="code-group" data-code-group='${JSON.stringify(codeGroupData).replace(/'/g, "&#39;")}'></div>`,
						};

						newChildren.push(codeGroupNode);
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
