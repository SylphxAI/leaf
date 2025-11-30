import { resolve } from "node:path";
import type { LeafConfig } from "../types.js";

function getDefaultHeadTags(): LeafConfig["head"] {
	return [
		// Charset and viewport
		["meta", { charset: "utf-8" }],
		[
			"meta",
			{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
		],
		["meta", { "http-equiv": "X-UA-Compatible", content: "IE=edge" }],

		// Default Open Graph meta tags
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
		["meta", { property: "og:image", content: "/og-image.svg" }],
		["meta", { property: "og:image:width", content: "1200" }],
		["meta", { property: "og:image:height", content: "630" }],
		["meta", { property: "og:site_name", content: "Leaf" }],
		["meta", { property: "og:url", content: "https://leaf.sylphx.com" }],

		// Default Twitter Card meta tags
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
		["meta", { name: "twitter:image", content: "/twitter-image.svg" }],
		["meta", { name: "twitter:site", content: "@sylphxltd" }],
		["meta", { name: "twitter:creator", content: "@sylphxltd" }],

		// Default SEO meta tags
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
		["meta", { name: "language", content: "en" }],

		// Canonical URL
		["link", { rel: "canonical", href: "https://leaf.sylphx.com" }],

		// Favicon and icons
		["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
		[
			"link",
			{ rel: "icon", href: "/favicon.png", sizes: "32x32", type: "image/png" },
		],

		// Theme color for mobile browsers
		["meta", { name: "theme-color", content: "#15803D" }],
		["meta", { name: "msapplication-TileColor", content: "#15803D" }],

		// JSON-LD structured data
		[
			"script",
			{ type: "application/ld+json" },
			JSON.stringify(
				{
					"@context": "https://schema.org",
					"@type": "SoftwareApplication",
					name: "Leaf",
					description:
						"A fast, modern documentation framework built with Preact that achieves 100% feature parity with VitePress",
					url: "https://leaf.sylphx.com",
					author: {
						"@type": "Organization",
						name: "Sylphx",
						url: "https://github.com/sylphxltd",
					},
					applicationCategory: "DeveloperApplication",
					operatingSystem: "Web",
					offers: {
						"@type": "Offer",
						price: "0",
						priceCurrency: "USD",
					},
					featureList: [
						"100% VitePress Parity",
						"Preact Powered (3KB runtime)",
						"Static Site Generation",
						"Zero Configuration",
						"Dark Mode Support",
						"Local Search",
						"Mobile Responsive",
					],
				},
				null,
				2,
			),
		],
	];
}

export async function loadConfig(root: string): Promise<LeafConfig> {
	const configPath = resolve(root, "leaf.config.ts");

	try {
		const config = await import(configPath);
		const userConfig = config.default || config;

		// Merge user config with default head tags
		return {
			...userConfig,
			head: [...getDefaultHeadTags(), ...(userConfig.head || [])],
		};
	} catch (error) {
		console.error("[loadConfig] Failed to load config:", error);
		// Return default config if not found
		return {
			title: "Leaf",
			description:
				"A modern Preact-based documentation framework with VitePress parity",
			base: "/",
			head: getDefaultHeadTags(),
			theme: {
				nav: [
					{ text: "Guide", link: "/guide" },
					{ text: "API", link: "/api" },
				],
				socialLinks: [
					{ icon: "github", link: "https://github.com/sylphxltd/leaf" },
					{
						icon: "npm",
						link: "https://www.npmjs.com/package/@sylphx/leaf-cli",
					},
				],
				editLink: {
					pattern:
						"https://github.com/sylphxltd/leaf/edit/main/docs/docs/:path",
					text: "Edit this page on GitHub",
				},
				lastUpdated: true,
			},
		};
	}
}

export function defineConfig(config: LeafConfig): LeafConfig {
	return config;
}
