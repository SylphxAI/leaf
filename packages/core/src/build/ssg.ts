import { readFile } from "node:fs/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { type Route, generateRoutes } from "../utils/routes.js";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";

interface TocItem {
	text: string;
	id: string;
	level: number;
}

export interface SSGOptions {
	root: string;
	outDir: string;
	template: string;
	clientBundle: string;
}

export async function generateStaticSite(options: SSGOptions): Promise<void> {
	const { root, outDir, template } = options;

	// Get all routes
	const routes = await generateRoutes(root);

	console.log(`Generating static HTML for ${routes.length} routes...`);

	// Generate HTML for each route
	for (const route of routes) {
		await generatePageHTML(route, outDir, template);
	}

	console.log(`✓ Generated ${routes.length} static pages`);
}

async function generatePageHTML(
	route: Route,
	outDir: string,
	template: string,
): Promise<void> {
	// Convert route path to file path
	const htmlPath = routeToHtmlPath(route.path, outDir);

	// Read and process the markdown file
	const markdownContent = await readFile(route.component, "utf-8");

	// Extract TOC
	const toc: TocItem[] = [];

	function extractToc() {
		return (tree: Root) => {
			visit(tree, "heading", (node) => {
				if (node.depth >= 2 && node.depth <= 3) {
					const text = node.children
						.filter((child) => child.type === "text")
						.map((child: any) => child.value)
						.join("");

					const id = text
						.toLowerCase()
						.replace(/\s+/g, "-")
						.replace(/[^\w-]/g, "");

					toc.push({
						text,
						id,
						level: node.depth,
					});
				}
			});
		};
	}

	// Process markdown with unified (same pipeline as the Vite plugin)
	const processor = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(extractToc)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeSlug)
		.use(rehypeHighlight)
		.use(rehypeStringify, { allowDangerousHtml: true });

	const vfile = await processor.process(markdownContent);
	const contentHtml = String(vfile);

	// Generate TOC HTML
	const tocHtml =
		toc.length > 0
			? `
		<aside class="toc-aside">
			<nav class="toc">
				<h3 class="toc-title">On this page</h3>
				<ul class="toc-list">
					${toc.map((item) => `<li class="toc-item toc-level-${item.level}"><a href="#${item.id}" class="toc-link">${item.text}</a></li>`).join("\n\t\t\t\t\t")}
				</ul>
			</nav>
		</aside>
	`
			: "";

	// Inline TOC script (lightweight, no dependencies)
	const tocScript = toc.length > 0 ? `
		<script>
		(function() {
			if (typeof window === "undefined") return;
			const toc = document.querySelector(".toc");
			if (!toc) return;

			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						const id = entry.target.getAttribute("id");
						if (!id) return;
						const tocLink = toc.querySelector('a[href="#' + id + '"]');
						if (!tocLink) return;
						const tocItem = tocLink.closest(".toc-item");
						if (!tocItem) return;

						if (entry.isIntersecting) {
							toc.querySelectorAll(".toc-item").forEach((item) => {
								item.classList.remove("active");
							});
							tocItem.classList.add("active");
						}
					});
				},
				{
					rootMargin: "-80px 0px -80% 0px",
					threshold: 0,
				}
			);

			const headings = document.querySelectorAll("h2[id], h3[id]");
			headings.forEach((heading) => {
				observer.observe(heading);
			});
		})();
		</script>
	` : "";

	// Inject the rendered content, TOC, and script into the template
	// Replace <div id="root"></div> with pre-rendered content
	const html = template.replace(
		'<div id="root"></div>',
		`<div id="root">
			<div class="layout-content">
				<main class="main-content">
					<div class="doc-content">
						<div class="markdown-content">${contentHtml}</div>
					</div>
				</main>
				${tocHtml}
			</div>
		</div>${tocScript}`,
	);

	// Ensure directory exists
	await mkdir(dirname(htmlPath), { recursive: true });

	// Write HTML file
	await writeFile(htmlPath, html, "utf-8");

	console.log(`  Generated: ${htmlPath}`);
}

function routeToHtmlPath(routePath: string, outDir: string): string {
	if (routePath === "/") {
		return join(outDir, "index.html");
	}

	// Remove leading slash
	const cleanPath = routePath.replace(/^\//, "");

	// Create /path/index.html for clean URLs
	return join(outDir, cleanPath, "index.html");
}
