import { describe, expect, test } from "vitest";
import type { LeafConfig, SidebarConfig, SocialLink } from "../../types.js";

describe("Config Types Validation", () => {
	describe("LeafConfig", () => {
		test("should accept minimal valid config", () => {
			const config: LeafConfig = {};
			expect(config).toBeDefined();
		});

		test("should accept full valid config", () => {
			const config: LeafConfig = {
				title: "My Docs",
				description: "Documentation site",
				base: "/docs/",
				head: [
					["meta", { property: "og:title", content: "My Docs" }],
					["link", { rel: "icon", href: "/favicon.ico" }],
				],
				theme: {
					nav: [
						{ text: "Guide", link: "/guide" },
						{ text: "API", link: "/api" },
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
					logo: "/logo.png",
					socialLinks: [
						{ icon: "github", link: "https://github.com/user" },
						{ icon: "twitter", link: "https://twitter.com/user" },
					],
					editLink: {
						pattern: "https://github.com/user/repo/edit/main/docs/:path",
						text: "Edit this page",
					},
					lastUpdated: true,
				},
				markdown: {
					lineNumbers: true,
					rehypePlugins: [],
					remarkPlugins: [],
				},
				vite: {
					define: {
						__DEV__: true,
					},
				},
			};

			expect(config.title).toBe("My Docs");
			expect(config.description).toBe("Documentation site");
			expect(config.base).toBe("/docs/");
			expect(config.head).toHaveLength(2);
			expect(config.theme?.nav).toHaveLength(2);
			expect(config.theme?.sidebar).toHaveLength(1);
			expect(config.theme?.socialLinks).toHaveLength(2);
			expect(config.theme?.editLink?.pattern).toContain(":path");
			expect(config.theme?.lastUpdated).toBe(true);
			expect(config.markdown?.lineNumbers).toBe(true);
		});

		test("should accept sidebar object format", () => {
			const config: LeafConfig = {
				theme: {
					sidebar: {
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
					},
				},
			};

			// Verify it's an object (not array)
			expect(typeof config.theme?.sidebar).toBe("object");
			expect(Array.isArray(config.theme?.sidebar)).toBe(false);

			// Verify keys are strings
			const sidebar = config.theme!.sidebar as Record<string, any[]>;
			expect(Object.keys(sidebar)).toEqual(["/guide/", "/api/"]);
			expect(sidebar["/guide/"]).toHaveLength(1);
			expect(sidebar["/api/"]).toHaveLength(1);
		});

		test("should accept sidebar array format", () => {
			const config: LeafConfig = {
				theme: {
					sidebar: [
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
					],
				},
			};

			// Verify it's an array
			expect(Array.isArray(config.theme?.sidebar)).toBe(true);
			expect((config.theme!.sidebar as any[]).length).toBe(2);
		});

		test("should accept all head tag formats", () => {
			const config: LeafConfig = {
				head: [
					["meta", { name: "description", content: "Site description" }],
					["meta", { property: "og:title", content: "Open Graph title" }],
					["link", { rel: "canonical", href: "https://example.com" }],
					["script", { src: "/analytics.js" }, 'console.log("analytics")'],
					["style", { type: "text/css" }, "body { margin: 0; }"],
				],
			};

			expect(config.head).toHaveLength(5);
			expect(config.head![0]).toEqual([
				"meta",
				{ name: "description", content: "Site description" },
			]);
			expect(config.head![4]).toEqual([
				"style",
				{ type: "text/css" },
				"body { margin: 0; }",
			]);
		});
	});

	describe("SocialLink validation", () => {
		test("should accept all supported social platforms", () => {
			const socialLinks: SocialLink[] = [
				{ icon: "github", link: "https://github.com/user" },
				{ icon: "twitter", link: "https://twitter.com/user" },
				{ icon: "discord", link: "https://discord.gg/user" },
				{ icon: "npm", link: "https://www.npmjs.com/~user" },
				{ icon: "youtube", link: "https://youtube.com/user" },
				{ icon: "facebook", link: "https://facebook.com/user" },
				{ icon: "instagram", link: "https://instagram.com/user" },
				{ icon: "linkedin", link: "https://linkedin.com/in/user" },
				{ icon: "slack", link: "https://slack.com/user" },
			];

			expect(socialLinks).toHaveLength(9);
			socialLinks.forEach((link) => {
				expect(link).toHaveProperty("icon");
				expect(link).toHaveProperty("link");
				expect(typeof link.icon).toBe("string");
				expect(typeof link.link).toBe("string");
				expect(link.link).toMatch(/^https?:\/\//);
			});
		});

		test("should validate social link URLs", () => {
			const validLinks: SocialLink[] = [
				{ icon: "github", link: "https://github.com/user" },
				{ icon: "twitter", link: "http://twitter.com/user" },
				{ icon: "npm", link: "https://www.npmjs.com/package/name" },
				{ icon: "linkedin", link: "https://linkedin.com/in/username" },
			];

			validLinks.forEach((link) => {
				expect(link.link).toMatch(/^https?:\/\/.+/);
				expect(link.icon).toMatch(
					/^(github|twitter|discord|npm|youtube|facebook|instagram|linkedin|slack)$/,
				);
			});
		});

		test("should enforce required social link properties", () => {
			const socialLink: SocialLink = {
				icon: "github",
				link: "https://github.com/user",
			};

			expect(socialLink.icon).toBeDefined();
			expect(socialLink.link).toBeDefined();
			expect(Object.keys(socialLink)).toHaveLength(2);
		});
	});

	describe("SidebarConfig validation", () => {
		test("should accept both array and object formats", () => {
			// Array format
			const arraySidebar: SidebarConfig = [
				{
					text: "Section 1",
					items: [
						{ text: "Page 1", link: "/page1" },
						{ text: "Page 2", link: "/page2" },
					],
				},
			];

			// Object format
			const objectSidebar: SidebarConfig = {
				"/guide/": [
					{
						text: "Guide Section",
						items: [{ text: "Guide Page", link: "/guide/page" }],
					},
				],
			};

			expect(Array.isArray(arraySidebar)).toBe(true);
			expect(typeof objectSidebar).toBe("object");
			expect(Array.isArray(objectSidebar)).toBe(false);
		});

		test("should validate sidebar item structure", () => {
			const sidebarItem = {
				text: "Section Title",
				link: "/section",
				items: [{ text: "Sub Item", link: "/sub-item" }],
				collapsed: true,
			};

			expect(sidebarItem).toHaveProperty("text");
			expect(sidebarItem).toHaveProperty("link");
			expect(sidebarItem).toHaveProperty("items");
			expect(sidebarItem).toHaveProperty("collapsed");
			expect(typeof sidebarItem.text).toBe("string");
			expect(typeof sidebarItem.link).toBe("string");
			expect(Array.isArray(sidebarItem.items)).toBe(true);
			expect(typeof sidebarItem.collapsed).toBe("boolean");
		});
	});
});
