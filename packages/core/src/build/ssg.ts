import { readFile } from "node:fs/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { type Route, generateRoutes } from "../utils/routes.js";
import type { Root } from "mdast";
import { visit } from "unist-util-visit";
import { remarkContainers } from "../plugins/remark-containers.js";
import { remarkCodeGroups } from "../plugins/remark-code-groups.js";
import { remarkCodeMeta } from "../plugins/remark-code-meta.js";
import { remarkBadge } from "../plugins/remark-badge.js";
import { rehypeLineHighlight } from "../plugins/rehype-line-highlight.js";
import { rehypeExternalLinks } from "../plugins/rehype-external-links.js";
import { rehypeMermaid } from "../plugins/rehype-mermaid.js";
import matter from "gray-matter";
import { generateSearchIndex } from "./search.js";
import { getLastModifiedTime, formatLastModified } from "../utils/git.js";

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

	// Generate search index
	await generateSearchIndex(routes, outDir);
}

async function generatePageHTML(
	route: Route,
	outDir: string,
	template: string,
): Promise<void> {
	// Convert route path to file path
	const htmlPath = routeToHtmlPath(route.path, outDir);

	// Read and process the markdown file
	const fileContent = await readFile(route.component, "utf-8");

	// Strip frontmatter before processing
	const { content: markdownContent } = matter(fileContent);

	// Get last modified time from git
	const lastModified = await getLastModifiedTime(route.component);
	const lastModifiedText = lastModified
		? formatLastModified(lastModified)
		: null;

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
		.use(remarkMath) // Process math equations
		.use(remarkBadge) // Process badges in markdown text
		.use(remarkCodeGroups) // Must run before remarkContainers
		.use(remarkContainers)
		.use(remarkCodeMeta)
		.use(extractToc)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeSlug)
		.use(rehypeKatex) // Render math equations with KaTeX
		.use(rehypeMermaid) // Mark mermaid diagrams before highlighting
		.use(rehypeHighlight)
		.use(rehypeLineHighlight)
		.use(rehypeExternalLinks) // Add external link icons
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
	const tocScript =
		toc.length > 0
			? `
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
	`
			: "";

	// Code copy script
	const codeCopyScript = `
		<script>
		(function() {
			if (typeof window === "undefined") return;

			const codeBlocks = document.querySelectorAll("pre code");

			codeBlocks.forEach((codeBlock) => {
				const pre = codeBlock.parentElement;
				if (!pre) return;
				if (pre.querySelector(".code-copy-btn")) return;

				const wrapper = document.createElement("div");
				wrapper.className = "code-block-wrapper";

				pre.parentNode.insertBefore(wrapper, pre);
				wrapper.appendChild(pre);

				const languageClass = Array.from(codeBlock.classList).find((cls) =>
					cls.startsWith("language-")
				);
				const language = languageClass
					? languageClass.replace("language-", "")
					: "text";

				const langLabel = document.createElement("span");
				langLabel.className = "code-lang";
				langLabel.textContent = language;
				wrapper.appendChild(langLabel);

				const button = document.createElement("button");
				button.className = "code-copy-btn";
				button.innerHTML = '<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
				button.setAttribute("aria-label", "Copy code");

				button.addEventListener("click", async () => {
					const code = codeBlock.textContent || "";
					try {
						await navigator.clipboard.writeText(code);
						button.classList.add("copied");
						setTimeout(() => {
							button.classList.remove("copied");
						}, 2000);
					} catch (err) {
						console.error("Failed to copy code:", err);
					}
				});

				wrapper.appendChild(button);
			});
		})();
		</script>
	`;

	// Code groups script
	const codeGroupsScript = `
		<script>
		(function() {
			if (typeof window === "undefined") return;

			const codeGroups = document.querySelectorAll(".code-group");

			codeGroups.forEach((container) => {
				const dataAttr = container.getAttribute("data-code-group");
				if (!dataAttr) return;

				try {
					const tabs = JSON.parse(dataAttr);
					if (tabs.length === 0) return;

					const tabsContainer = document.createElement("div");
					tabsContainer.className = "code-group-tabs";

					tabs.forEach((tab, index) => {
						const button = document.createElement("button");
						button.className = "code-group-tab" + (index === 0 ? " active" : "");
						button.textContent = tab.label;
						button.setAttribute("data-index", String(index));

						button.addEventListener("click", () => {
							tabsContainer.querySelectorAll(".code-group-tab").forEach((btn) => {
								btn.classList.remove("active");
							});
							button.classList.add("active");

							contentContainer.querySelectorAll(".code-group-content").forEach((content) => {
								content.classList.remove("active");
							});
							const targetContent = contentContainer.querySelector(".code-group-content[data-index=\\"" + index + "\\"]");
							if (targetContent) {
								targetContent.classList.add("active");
							}
						});

						tabsContainer.appendChild(button);
					});

					const contentContainer = document.createElement("div");
					contentContainer.className = "code-group-contents";

					tabs.forEach((tab, index) => {
						const contentDiv = document.createElement("div");
						contentDiv.className = "code-group-content" + (index === 0 ? " active" : "");
						contentDiv.setAttribute("data-index", String(index));

						const wrapper = document.createElement("div");
						wrapper.className = "code-block-wrapper";

						const pre = document.createElement("pre");
						const code = document.createElement("code");
						code.className = "hljs language-" + tab.language;
						code.textContent = tab.code;

						pre.appendChild(code);
						wrapper.appendChild(pre);

						const langLabel = document.createElement("span");
						langLabel.className = "code-lang";
						langLabel.textContent = tab.language;
						wrapper.appendChild(langLabel);

						const copyButton = document.createElement("button");
						copyButton.className = "code-copy-btn";
						copyButton.innerHTML = '<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
						copyButton.setAttribute("aria-label", "Copy code");

						copyButton.addEventListener("click", async () => {
							try {
								await navigator.clipboard.writeText(tab.code);
								copyButton.classList.add("copied");
								setTimeout(() => {
									copyButton.classList.remove("copied");
								}, 2000);
							} catch (err) {
								console.error("Failed to copy code:", err);
							}
						});

						wrapper.appendChild(copyButton);
						contentDiv.appendChild(wrapper);
						contentContainer.appendChild(contentDiv);

						if (typeof hljs !== "undefined") {
							hljs.highlightElement(code);
						}
					});

					container.innerHTML = "";
					container.appendChild(tabsContainer);
					container.appendChild(contentContainer);
				} catch (err) {
					console.error("Failed to parse code group:", err);
				}
			});
		})();
		</script>
	`;

	// Last updated script
	const lastUpdatedScript =
		lastModifiedText
			? `
		<script>
		(function() {
			if (typeof window === "undefined") return;
			const timeElement = document.getElementById("last-updated-time");
			if (timeElement) {
				timeElement.textContent = "${lastModifiedText}";
			}
		})();
		</script>
	`
			: "";

	// Mermaid script - only add if there are mermaid diagrams
	const hasMermaid = contentHtml.includes('class="mermaid"');
	const mermaidScript = hasMermaid
		? `
		<script type="module">
		import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
		mermaid.initialize({
			startOnLoad: true,
			theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default'
		});
		</script>
	`
		: "";

	// Generate DocFooter HTML with last updated
	const docFooterHtml = lastModifiedText
		? `
		<footer class="doc-footer">
			<div class="doc-footer-meta">
				<div class="last-updated">
					<span class="last-updated-text">Last updated: </span>
					<time id="last-updated-time">${lastModifiedText}</time>
				</div>
			</div>
		</footer>
	`
		: "";

	// Inject the rendered content, TOC, and scripts into the template
	// Replace <div id="root"></div> with pre-rendered content
	// NOTE: This is a partial SSR - only renders markdown content
	// Header, Sidebar, and other UI components will be hydrated by React on the client
	let html = template.replace(
		'<div id="root"></div>',
		`<div id="root">
			<div class="layout">
				<header class="header">
					<div class="header-container">
						<a href="/" class="site-title">ReactPress</a>
						<nav class="nav"></nav>
						<button class="sidebar-toggle" aria-label="Toggle sidebar" aria-expanded="false">
							<span class="sidebar-toggle-icon">
								<span class="line"></span>
								<span class="line"></span>
								<span class="line"></span>
							</span>
						</button>
						<button class="theme-toggle" aria-label="Toggle theme">🌙</button>
					</div>
				</header>
				<button class="search-btn" aria-label="Search">
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.35-4.35"></path>
					</svg>
					<span>Search</span>
					<kbd>⌘K</kbd>
				</button>
				<div class="layout-content">
					<aside class="sidebar">
						<nav class="sidebar-nav"></nav>
					</aside>
					<main class="main-content">
						<div class="doc-content">
							<div class="markdown-content">${contentHtml}</div>
							${docFooterHtml}
						</div>
					</main>
					${tocHtml}
				</div>
			</div>
		</div>${tocScript}${codeCopyScript}${codeGroupsScript}${mermaidScript}${lastUpdatedScript}`,
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
