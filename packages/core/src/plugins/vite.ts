import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import type { Plugin } from "vite";
import type { ReactPressConfig } from "../types.js";

export function createReactPressPlugin(config: ReactPressConfig): Plugin[] {
	return [
		{
			name: "reactpress:config",
			config() {
				return {
					define: {
						__REACTPRESS_CONFIG__: JSON.stringify(config),
					},
				};
			},
		},
		{
			enforce: "pre",
			...mdx({
				development: true,
				remarkPlugins: [remarkGfm, ...(config.markdown?.remarkPlugins || [])],
				rehypePlugins: [
					rehypeSlug,
					rehypeHighlight,
					...(config.markdown?.rehypePlugins || []),
				],
			}),
		} as Plugin,
		...react(),
	];
}
