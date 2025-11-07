import type { Plugin } from "unified";
import type { Root, Code } from "mdast";
import { visit } from "unist-util-visit";

/**
 * Remark plugin to preserve code fence meta as data attribute
 */
export const remarkCodeMeta: Plugin<[], Root> = () => {
	return (tree) => {
		visit(tree, "code", (node: Code) => {
			if (node.meta) {
				// Store meta in node data so it's preserved through rehype
				if (!node.data) node.data = {};
				node.data.hProperties = {
					...(node.data.hProperties || {}),
					dataMeta: node.meta,
				};
			}
		});
	};
};
