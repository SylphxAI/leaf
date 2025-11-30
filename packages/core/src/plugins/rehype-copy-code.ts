import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

/**
 * Rehype plugin to add copy button to code blocks
 */
export const rehypeCopyCode: Plugin<[], Root> = () => {
	return (tree) => {
		visit(tree, "element", (node: Element, index, parent) => {
			// Find <pre> blocks
			if (node.tagName !== "pre") return;
			if (!parent || index === undefined) return;

			const codeElement = node.children.find(
				(child): child is Element =>
					child.type === "element" && child.tagName === "code",
			);

			if (!codeElement) return;

			// Create copy button element with iconify-icon
			const copyButton: Element = {
				type: "element",
				tagName: "button",
				properties: {
					className: ["code-copy-btn"],
					type: "button",
					"aria-label": "Copy code",
					title: "Copy code",
				},
				children: [
					{
						type: "element",
						tagName: "iconify-icon",
						properties: {
							icon: "ph:copy",
							width: "18",
							height: "18",
						},
						children: [],
					} as Element,
				],
			};

			// Wrap pre in a div with copy button
			const wrapper: Element = {
				type: "element",
				tagName: "div",
				properties: {
					className: ["code-block-wrapper"],
				},
				children: [node, copyButton],
			};

			// Replace pre with wrapper
			parent.children[index] = wrapper;
		});
	};
};
