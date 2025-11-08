import { defineConfig } from "@sylphx/leaf";

export default defineConfig({
	title: "Leaf",
	description:
		"A modern Preact-based documentation framework with VitePress parity",
	theme: {
		nav: [
			{ text: "Guide", link: "/guide" },
			{ text: "API", link: "/api" },
			{ text: "Showcase", link: "/showcase" },
			{ text: "FAQ", link: "/faq" },
			{
				text: "GitHub",
				link: "https://github.com/sylphxltd/leaf",
			},
		],
		sidebar: [
			{
				text: "Introduction",
				items: [
					{ text: "What is Leaf?", link: "/" },
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
