import { defineConfig } from "@sylphx/leaf";

export default defineConfig({
	title: "My Documentation",
	description: "A modern Preact-based documentation site built with Leaf",
	theme: {
		nav: [
			{ text: "Guide", link: "/guide" },
			{ text: "Examples", link: "/examples" },
		],
		sidebar: [
			{
				text: "Getting Started",
				items: [
					{ text: "Introduction", link: "/" },
					{ text: "Installation", link: "/guide/installation" },
				],
			},
		],
	},
});
