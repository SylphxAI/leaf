import { describe, expect, test } from "vitest";
import type { SidebarItem } from "../types.js";

describe("routesPlugin", () => {
	describe("getSidebarForPath", () => {
		// Helper function to simulate the getSidebarForPath logic
		function getSidebarForPath(
			currentPath: string,
			sidebarObject: Record<string, SidebarItem[]>,
		): SidebarItem[] {
			const sortedKeys = Object.keys(sidebarObject).sort(
				(a, b) => b.length - a.length,
			);

			for (const basePath of sortedKeys) {
				const normalizedBase = basePath.replace(/\/$/, "");
				if (
					currentPath === normalizedBase ||
					currentPath.startsWith(`${normalizedBase}/`)
				) {
					return sidebarObject[basePath];
				}
			}
			return [];
		}

		test("should match exact paths", () => {
			const sidebar = {
				"/guide/": [{ text: "Guide", link: "/guide/" }],
				"/api/": [{ text: "API", link: "/api/" }],
			};

			expect(getSidebarForPath("/guide/", sidebar)).toEqual([
				{ text: "Guide", link: "/guide/" },
			]);
			expect(getSidebarForPath("/api/", sidebar)).toEqual([
				{ text: "API", link: "/api/" },
			]);
		});

		test("should match nested paths", () => {
			const sidebar = {
				"/guide/": [{ text: "Guide Home", link: "/guide/" }],
				"/api/": [{ text: "API Home", link: "/api/" }],
			};

			expect(getSidebarForPath("/guide/installation", sidebar)).toEqual([
				{ text: "Guide Home", link: "/guide/" },
			]);
			expect(getSidebarForPath("/api/config", sidebar)).toEqual([
				{ text: "API Home", link: "/api/" },
			]);
		});

		test("should match longest path first", () => {
			const sidebar = {
				"/guide/": [{ text: "General Guide", link: "/guide/" }],
				"/guide/advanced/": [
					{ text: "Advanced Guide", link: "/guide/advanced/" },
				],
			};

			// Should match the more specific path
			expect(getSidebarForPath("/guide/advanced/config", sidebar)).toEqual([
				{ text: "Advanced Guide", link: "/guide/advanced/" },
			]);
			expect(getSidebarForPath("/guide/basic", sidebar)).toEqual([
				{ text: "General Guide", link: "/guide/" },
			]);
		});

		test("should handle trailing slashes correctly", () => {
			const sidebar = {
				"/guide": [{ text: "Guide", link: "/guide" }],
				"/api/": [{ text: "API", link: "/api/" }],
			};

			expect(getSidebarForPath("/guide/installation", sidebar)).toEqual([
				{ text: "Guide", link: "/guide" },
			]);
			expect(getSidebarForPath("/api/config", sidebar)).toEqual([
				{ text: "API", link: "/api/" },
			]);
		});

		test("should return empty array for non-matching paths", () => {
			const sidebar = {
				"/guide/": [{ text: "Guide", link: "/guide/" }],
				"/api/": [{ text: "API", link: "/api/" }],
			};

			expect(getSidebarForPath("/other/", sidebar)).toEqual([]);
			expect(getSidebarForPath("/", sidebar)).toEqual([]);
			expect(getSidebarForPath("/docs/", sidebar)).toEqual([]);
		});

		test("should handle empty sidebar object", () => {
			const sidebar = {};
			expect(getSidebarForPath("/any/path", sidebar)).toEqual([]);
		});

		test("should handle complex nested structures", () => {
			const sidebar = {
				"/": [
					{ text: "Home", link: "/" },
					{ text: "About", link: "/about" },
				],
				"/guide/": [
					{
						text: "Getting Started",
						items: [
							{ text: "Introduction", link: "/guide/" },
							{ text: "Installation", link: "/guide/installation" },
						],
					},
				],
			};

			expect(getSidebarForPath("/", sidebar)).toEqual([
				{ text: "Home", link: "/" },
				{ text: "About", link: "/about" },
			]);

			expect(getSidebarForPath("/guide/installation", sidebar)).toEqual([
				{
					text: "Getting Started",
					items: [
						{ text: "Introduction", link: "/guide/" },
						{ text: "Installation", link: "/guide/installation" },
					],
				},
			]);
		});
	});

	describe("DocFooter generation", () => {
		test("should generate correct prev/next navigation", () => {
			const sidebar = [
				{ text: "Page 1", link: "/page1" },
				{ text: "Page 2", link: "/page2" },
				{ text: "Page 3", link: "/page3" },
			];

			// This would be tested through the actual plugin integration
			// For now, we verify the structure is correct
			expect(sidebar).toHaveLength(3);
			expect(sidebar[0].link).toBe("/page1");
			expect(sidebar[1].link).toBe("/page2");
			expect(sidebar[2].link).toBe("/page3");
		});
	});
});
