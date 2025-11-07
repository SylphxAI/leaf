import type { Plugin } from "unified";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

/**
 * Parse line highlight ranges from meta string
 * Examples:
 *   {1,3-5} -> [1, 3, 4, 5]
 *   {1} -> [1]
 *   {1-3,5} -> [1, 2, 3, 5]
 */
function parseLineNumbers(meta: string): number[] {
	const match = meta.match(/\{([^}]+)\}/);
	if (!match) return [];

	const ranges = match[1].split(",");
	const lineNumbers: number[] = [];

	for (const range of ranges) {
		if (range.includes("-")) {
			const [start, end] = range.split("-").map(Number);
			for (let i = start; i <= end; i++) {
				lineNumbers.push(i);
			}
		} else {
			lineNumbers.push(Number(range));
		}
	}

	return lineNumbers;
}

/**
 * Convert AST node to plain text
 */
function nodeToText(node: any): string {
	if (node.type === "text") {
		return node.value;
	}
	if (node.type === "element" && node.children) {
		return node.children.map(nodeToText).join("");
	}
	return "";
}

/**
 * Clone AST node deeply
 */
function cloneNode(node: any): any {
	if (node.type === "text") {
		return { ...node };
	}
	if (node.type === "element") {
		return {
			...node,
			children: node.children.map(cloneNode),
			properties: { ...node.properties },
		};
	}
	return { ...node };
}

/**
 * Rehype plugin to add line highlighting to code blocks
 */
export const rehypeLineHighlight: Plugin<[], Root> = () => {
	return (tree) => {
		visit(tree, "element", (node: Element) => {
			// Find <pre><code> blocks
			if (node.tagName !== "pre") return;

			const codeElement = node.children.find(
				(child): child is Element =>
					child.type === "element" && child.tagName === "code",
			);

			if (!codeElement) return;

			// Get meta from data-meta attribute
			const meta = (codeElement.properties?.dataMeta as string) || "";
			if (!meta) return;

			// Parse line numbers from meta
			const highlightLines = parseLineNumbers(meta);
			if (highlightLines.length === 0) return;

			// Get full code text to count lines
			const fullText = nodeToText(codeElement);
			const totalLines = fullText.split("\n").length;

			// Group children by line breaks
			const lines: any[][] = [[]];
			let currentLine = 0;

			for (const child of codeElement.children) {
				if (child.type === "text") {
					const parts = child.value.split("\n");
					for (let i = 0; i < parts.length; i++) {
						if (i > 0) {
							currentLine++;
							lines[currentLine] = [];
						}
						if (parts[i]) {
							lines[currentLine].push({
								type: "text",
								value: parts[i],
							});
						}
					}
				} else {
					lines[currentLine].push(cloneNode(child));
				}
			}

			// Wrap each line
			const newChildren: Element[] = [];

			lines.forEach((lineChildren, idx) => {
				const lineNumber = idx + 1;
				const isHighlighted = highlightLines.includes(lineNumber);

				const lineElement: Element = {
					type: "element",
					tagName: "span",
					properties: {
						className: isHighlighted ? ["line", "highlight"] : ["line"],
					},
					children: lineChildren,
				};

				newChildren.push(lineElement);

				// Add newline text node except for last line
				if (idx < lines.length - 1) {
					newChildren.push({
						type: "text",
						value: "\n",
					} as any);
				}
			});

			// Replace code element children
			codeElement.children = newChildren;

			// Add has-highlight class to pre element
			if (!node.properties) node.properties = {};
			const existingClass = node.properties.className as string[] | undefined;
			node.properties.className = existingClass
				? [...existingClass, "has-line-highlight"]
				: ["has-line-highlight"];
		});
	};
};
