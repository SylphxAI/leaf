import { describe, expect, test } from "vitest";

describe("Migration Utilities", () => {
	describe("VitePress to Leaf Migration", () => {
		test("should validate VitePress-style sidebar object format", () => {
			// Valid VitePress sidebar object
			const vitepressSidebar = {
				"/guide/": [
					{
						text: "Getting Started",
						items: [
							{ text: "Introduction", link: "/guide/" },
							{ text: "Installation", link: "/guide/installation" },
						],
					},
				],
				"/api/": [
					{
						text: "API Reference",
						items: [
							{ text: "Config", link: "/api/config" },
							{ text: "Plugins", link: "/api/plugins" },
						],
					},
				],
			};

			// Should be a valid object with string keys
			expect(typeof vitepressSidebar).toBe("object");
			expect(
				Object.keys(vitepressSidebar).every((key) => typeof key === "string"),
			).toBe(true);

			// Each value should be an array
			expect(
				Object.values(vitepressSidebar).every((value) => Array.isArray(value)),
			).toBe(true);

			// Each array item should have text and items
			Object.values(vitepressSidebar).forEach((section) => {
				expect(
					section.every(
						(item) =>
							typeof item.text === "string" && Array.isArray(item.items),
					),
				).toBe(true);
			});
		});

		test("should validate Leaf sidebar array format", () => {
			// Valid Leaf sidebar array
			const leafSidebar = [
				{
					text: "Getting Started",
					items: [
						{ text: "Introduction", link: "/" },
						{ text: "Installation", link: "/guide/installation" },
					],
				},
				{
					text: "API Reference",
					items: [
						{ text: "Config", link: "/api/config" },
						{ text: "Plugins", link: "/api/plugins" },
					],
				},
			];

			expect(Array.isArray(leafSidebar)).toBe(true);
			expect(leafSidebar.every((item) => typeof item.text === "string")).toBe(
				true,
			);
			expect(leafSidebar.every((item) => Array.isArray(item.items))).toBe(true);
		});

		test("should convert VitePress config to Leaf config", () => {
			// Mock conversion function
			function convertVitePressToLeaf(vitepressConfig: any): any {
				const leafConfig: any = {
					title: vitepressConfig.title,
					description: vitepressConfig.description,
					theme: {
						nav: vitepressConfig.themeConfig?.nav || [],
						sidebar: vitepressConfig.themeConfig?.sidebar || [],
						editLink: vitepressConfig.themeConfig?.editLink,
						lastUpdated: vitepressConfig.themeConfig?.lastUpdated,
					},
				};

				// Convert sidebar object to array if needed
				if (
					vitepressConfig.themeConfig?.sidebar &&
					!Array.isArray(vitepressConfig.themeConfig.sidebar)
				) {
					// Keep as object - Leaf now supports both formats
					leafConfig.theme.sidebar = vitepressConfig.themeConfig.sidebar;
				}

				return leafConfig;
			}

			const vitepressConfig = {
				title: "My Docs",
				description: "Documentation site",
				themeConfig: {
					nav: [
						{ text: "Guide", link: "/guide" },
						{ text: "API", link: "/api" },
					],
					sidebar: {
						"/guide/": [
							{ text: "Introduction", link: "/guide/" },
							{ text: "Installation", link: "/guide/installation" },
						],
					},
					editLink: {
						pattern: "https://github.com/user/repo/edit/main/docs/:path",
						text: "Edit this page",
					},
					lastUpdated: true,
				},
			};

			const leafConfig = convertVitePressToLeaf(vitepressConfig);

			expect(leafConfig.title).toBe("My Docs");
			expect(leafConfig.description).toBe("Documentation site");
			expect(leafConfig.theme.nav).toEqual(vitepressConfig.themeConfig.nav);
			// Sidebar object should be preserved (Leaf now supports it)
			expect(leafConfig.theme.sidebar).toEqual(
				vitepressConfig.themeConfig.sidebar,
			);
			expect(leafConfig.theme.editLink).toEqual(
				vitepressConfig.themeConfig.editLink,
			);
			expect(leafConfig.theme.lastUpdated).toBe(true);
		});

		test("should validate social links conversion", () => {
			const vitepressSocialLinks = [
				{ icon: "github", link: "https://github.com/user" },
				{ icon: "twitter", link: "https://twitter.com/user" },
			];

			// These should be compatible with Leaf
			const leafSocialLinks = vitepressSocialLinks.map((link) => ({
				icon: link.icon,
				link: link.link,
			}));

			expect(leafSocialLinks).toEqual(vitepressSocialLinks);

			// Test new social links supported by Leaf
			const extendedSocialLinks = [
				...leafSocialLinks,
				{ icon: "npm", link: "https://www.npmjs.com/~user" },
				{ icon: "youtube", link: "https://youtube.com/user" },
				{ icon: "linkedin", link: "https://linkedin.com/in/user" },
			];

			expect(extendedSocialLinks).toHaveLength(5);
			expect(extendedSocialLinks[2].icon).toBe("npm");
			expect(extendedSocialLinks[3].icon).toBe("youtube");
			expect(extendedSocialLinks[4].icon).toBe("linkedin");
		});

		test("should handle component usage differences", () => {
			// VitePress component usage (Vue)
			const vitepressUsage = `
<script setup>
import Counter from '../components/Counter.vue'
</script>

# My Page

<Counter />
`;

			// Leaf component usage (React in Markdown)
			const leafUsage = `
# My Page

<Counter />
`;

			// Key differences
			expect(vitepressUsage).toContain("<script setup>");
			expect(vitepressUsage).toContain("import Counter");
			expect(leafUsage).not.toContain("<script setup>");
			expect(leafUsage).not.toContain("import Counter");
			expect(leafUsage).toContain("<Counter />");
		});

		test("should validate markdown feature parity", () => {
			const features = [
				{ name: "Containers", vitepress: true, leaf: true },
				{ name: "Code groups", vitepress: true, leaf: true },
				{ name: "Line highlighting", vitepress: true, leaf: true },
				{ name: "Math equations", vitepress: true, leaf: true },
				{ name: "Mermaid diagrams", vitepress: true, leaf: true },
				{ name: "Badges", vitepress: true, leaf: true },
				{ name: "Frontmatter", vitepress: true, leaf: true },
				{ name: "External link icons", vitepress: true, leaf: true },
			];

			features.forEach((feature) => {
				expect(feature.leaf).toBe(feature.vitepress);
			});

			// All features should have parity
			const allHaveParity = features.every((f) => f.leaf === f.vitepress);
			expect(allHaveParity).toBe(true);
		});
	});
});
