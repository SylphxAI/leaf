import { defineConfig } from "@sylphx/leaf";

export default defineConfig({
	title: "Leaf",
	description:
		"A modern Preact-based documentation framework with VitePress parity",
	head: [
		// Open Graph meta tags
		["meta", { property: "og:type", content: "website" }],
		[
			"meta",
			{
				property: "og:title",
				content: "Leaf - Modern Documentation Framework",
			},
		],
		[
			"meta",
			{
				property: "og:description",
				content:
					"A fast, modern documentation framework built with Preact that achieves 100% feature parity with VitePress",
			},
		],
		[
			"meta",
			{ property: "og:image", content: "https://leaf.sylphx.com/og-image.png" },
		],
		["meta", { property: "og:url", content: "https://leaf.sylphx.com" }],
		["meta", { property: "og:site_name", content: "Leaf" }],

		// Twitter Card meta tags
		["meta", { name: "twitter:card", content: "summary_large_image" }],
		[
			"meta",
			{
				name: "twitter:title",
				content: "Leaf - Modern Documentation Framework",
			},
		],
		[
			"meta",
			{
				name: "twitter:description",
				content:
					"A fast, modern documentation framework built with Preact that achieves 100% feature parity with VitePress",
			},
		],
		[
			"meta",
			{
				name: "twitter:image",
				content: "https://leaf.sylphx.com/twitter-image.png",
			},
		],
		["meta", { name: "twitter:site", content: "@sylphxltd" }],

		// Additional SEO meta tags
		[
			"meta",
			{
				name: "keywords",
				content:
					"documentation framework, preact, vite, markdown, docs, static site generator, vitepress alternative",
			},
		],
		["meta", { name: "author", content: "Sylphx" }],
		["meta", { name: "robots", content: "index, follow" }],
		["link", { rel: "canonical", href: "https://leaf.sylphx.com" }],
	],
	theme: {
		editLink: {
			pattern: "https://github.com/sylphxltd/leaf/edit/main/docs/docs/:path",
			text: "Edit this page on GitHub",
		},
		lastUpdated: true,
		nav: [
			{ text: "Guide", link: "/guide" },
			{ text: "API", link: "/api" },
			{ text: "Showcase", link: "/showcase" },
			{ text: "FAQ", link: "/faq" },
		],
		socialLinks: [
			{ icon: "npm", link: "https://www.npmjs.com/package/@sylphx/leaf" },
			{ icon: "github", link: "https://github.com/sylphxltd/leaf" },
		],
		sidebar: [
			{
				text: "Introduction",
				items: [
					{ text: "Why Leaf?", link: "/why" },
					{ text: "Getting Started", link: "/getting-started" },
				],
			},
			{
				text: "Guide",
				items: [
					{ text: "Installation", link: "/guide/installation" },
					{ text: "Configuration", link: "/guide/configuration" },
					{ text: "Markdown", link: "/guide/markdown" },
					{ text: "Theming", link: "/guide/theming" },
					{ text: "Deployment", link: "/guide/deployment" },
					{ text: "Migration from VitePress", link: "/guide/migration" },
					{ text: "Advanced Features", link: "/guide/advanced" },
				],
			},
			{
				text: "Features",
				items: [
					{ text: "Code Highlighting", link: "/features/code-highlighting" },
					{ text: "Math Equations", link: "/features/math" },
					{ text: "Mermaid Diagrams", link: "/features/mermaid" },
					{ text: "Search", link: "/features/search" },
				],
			},
			{
				text: "API Reference",
				items: [
					{ text: "Config", link: "/api/config" },
					{ text: "Markdown Plugins", link: "/api/markdown-plugins" },
					{ text: "Theming API", link: "/api/theming" },
				],
			},
			{
				text: "Resources",
				items: [
					{ text: "Showcase", link: "/showcase" },
					{ text: "FAQ", link: "/faq" },
					{ text: "Examples", link: "/examples" },
				],
			},
		],
	},
});
