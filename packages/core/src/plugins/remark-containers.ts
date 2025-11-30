import type { Root } from "mdast";
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

			// Check if this is a paragraph with container syntax
			if (node.type === "paragraph") {
				// Helper to extract text from first/last child
				const getFirstText = (para: any): string | null => {
					if (para.children.length === 0) return null;
					const first = para.children[0];
					return first.type === "text" ? first.value : null;
				};

				const getLastText = (para: any): string | null => {
					if (para.children.length === 0) return null;
					const last = para.children[para.children.length - 1];
					return last.type === "text" ? last.value : null;
				};

				// Check for single-paragraph container with multiple children
				// Pattern: First child starts with ":::", last child ends with ":::"
				const firstText = getFirstText(node);
				const lastText = getLastText(node);

				if (
					firstText?.trim().startsWith(":::") &&
					lastText?.trim().endsWith(":::")
				) {
					// Extract container type and title from first child
					const openMatch = firstText.match(/^:::\s*(\w+)(?:\s+([^\n]+))?/);

					if (openMatch) {
						const type = openMatch[1];

						// Skip code-group
						if (type === "code-group") {
							newChildren.push(node);
							i++;
							continue;
						}

						const title = openMatch[2]?.trim();

						// Create container with preserved markdown children
						const container: any = {
							type: "html",
							value: `<div class="custom-block custom-block-${type}"><p class="custom-block-title">${title || capitalize(type)}</p>`,
						};

						// Clone children and trim first/last text nodes
						const contentChildren = node.children.slice();

						// Trim opening ":::" from first child
						if (contentChildren[0].type === "text") {
							const trimmed = contentChildren[0].value.replace(
								/^:::\s*\w+(?:\s+[^\n]+)?\n?/,
								"",
							);
							if (trimmed) {
								contentChildren[0] = { ...contentChildren[0], value: trimmed };
							} else {
								contentChildren.shift();
							}
						}

						// Trim closing ":::" from last child
						const lastIdx = contentChildren.length - 1;
						if (lastIdx >= 0 && contentChildren[lastIdx].type === "text") {
							const trimmed = contentChildren[lastIdx].value.replace(
								/\n?:::$/,
								"",
							);
							if (trimmed) {
								contentChildren[lastIdx] = {
									...contentChildren[lastIdx],
									value: trimmed,
								};
							} else {
								contentChildren.pop();
							}
						}

						const closingDiv: any = {
							type: "html",
							value: "</div>",
						};

						newChildren.push(container);
						if (contentChildren.length > 0) {
							newChildren.push({
								type: "paragraph",
								children: contentChildren,
							});
						}
						newChildren.push(closingDiv);
						i++;
						continue;
					}
				}

				// Original single-text-child logic
				if (node.children.length === 1 && node.children[0].type === "text") {
					const text = node.children[0].value;

					// Skip code-group entirely - handled by remarkCodeGroups plugin
					if (text.trim().startsWith("::: code-group")) {
						newChildren.push(node);
						i++;
						continue;
					}

					// Check if the entire paragraph contains a container (multiline case)
					const fullMatch = text.match(
						/^:::\s*(\w+)(?:\s+([^\n]+))?\n([\s\S]*?)\n:::$/,
					);

					if (fullMatch) {
						const type = fullMatch[1]; // tip, warning, danger, details

						// Skip code-group - handled by remarkCodeGroups plugin
						if (type === "code-group") {
							newChildren.push(node);
							i++;
							continue;
						}

						const title = fullMatch[2]?.trim();
						const content = fullMatch[3];

						// Create container HTML
						const containerHtml = `<div class="custom-block custom-block-${type}"><p class="custom-block-title">${title || capitalize(type)}</p><p>${content}</p></div>`;

						newChildren.push({
							type: "html",
							value: containerHtml,
						});

						i++;
						continue;
					}

					// Check for opening marker (split across nodes case)
					// Match either "::: type" alone or "::: type title\n..." with content
					const openMatch = text.match(/^:::\s*(\w+)(?:\s+([^\n]+))?/);

					if (openMatch) {
						const type = openMatch[1]; // tip, warning, danger, details

						// Skip code-group - handled by remarkCodeGroups plugin
						if (type === "code-group") {
							// Find the closing ::: and preserve entire section
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

							// Push all nodes from opening to closing (inclusive)
							for (let j = i; j <= endIndex && j < tree.children.length; j++) {
								newChildren.push(tree.children[j]);
							}

							i = endIndex + 1;
							continue;
						}

						const title = openMatch[2]?.trim();

						// Extract any content after the opening line in this paragraph
						const firstLineEnd = text.indexOf("\n");
						const firstParaContent =
							firstLineEnd > 0 ? text.substring(firstLineEnd + 1) : "";

						// Find the closing :::
						let endIndex = i + 1;
						let foundClosing = false;

						// Check if closing is in the same paragraph
						if (firstParaContent.includes(":::")) {
							const closingPos = firstParaContent.indexOf(":::");
							const content = firstParaContent.substring(0, closingPos).trim();

							if (content) {
								const containerHtml = `<div class="custom-block custom-block-${type}"><p class="custom-block-title">${title || capitalize(type)}</p><p>${content}</p></div>`;
								newChildren.push({
									type: "html",
									value: containerHtml,
								});
								i++;
								continue;
							}
						}

						// Look for closing in subsequent nodes (can be ANY node type now, not just paragraph)
						while (endIndex < tree.children.length) {
							const child = tree.children[endIndex];
							// Check if this is a closing marker paragraph
							if (
								child.type === "paragraph" &&
								child.children.length === 1 &&
								child.children[0].type === "text" &&
								child.children[0].value.trim() === ":::"
							) {
								foundClosing = true;
								break;
							}
							endIndex++;
						}

						if (foundClosing) {
							// Extract ALL content between markers (including code blocks, lists, etc.)
							const content = tree.children.slice(i + 1, endIndex);

							// Add first paragraph content if exists
							if (firstParaContent && !firstParaContent.includes(":::")) {
								content.unshift({
									type: "paragraph",
									children: [{ type: "text", value: firstParaContent }],
								});
							}

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
