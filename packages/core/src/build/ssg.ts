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

	// Load configuration
	const { loadConfig } = await import("../config/index.js");
	const config = await loadConfig(root);

	// Get all routes
	const routes = await generateRoutes(root);

	console.log(`Generating static HTML for ${routes.length} routes...`);

	// Generate HTML for each route
	for (const route of routes) {
		await generatePageHTML(route, outDir, template, config);
	}

	console.log(`✓ Generated ${routes.length} static pages`);

	// Generate search index
	await generateSearchIndex(routes, outDir);
}

// Critical CSS - inline styles for instant first paint (NO FOUC)
const CRITICAL_CSS = `<style>
/* Critical CSS for instant render - prevents FOUC */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root,:root[data-theme="light"]{--font-sans:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--color-bg:#ffffff;--color-text:#1a1a1a;--color-border:#e5e5e5;--color-accent:#0070f3;color-scheme:light}
:root[data-theme="dark"]{--color-bg:#0a0a0a;--color-text:#ededed;--color-border:#2a2a2a;--color-accent:#3291ff;color-scheme:dark}
body{font-family:var(--font-sans);background-color:var(--color-bg);color:var(--color-text);line-height:1.6;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
.layout{min-height:100vh;display:flex;flex-direction:column}
.layout-content{display:flex;flex:1}
.main-content{flex:1;max-width:1200px;margin:0 auto;width:100%}
.header{border-bottom:1px solid var(--color-border);position:sticky;top:0;background-color:var(--color-bg);z-index:100}
.header-content{max-width:1400px;margin:0 auto;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;gap:2rem}
.logo{font-size:1.5rem;font-weight:700;text-decoration:none;color:var(--color-accent)}
.nav{display:flex;gap:2rem;align-items:center}
.nav-link{text-decoration:none;color:var(--color-text);font-weight:500;transition:color 0.2s}
.nav-link:hover{color:var(--color-accent)}
.sidebar{width:250px;border-right:1px solid var(--color-border);padding:2rem 0;position:sticky;top:73px;height:calc(100vh - 73px);overflow-y:auto}
.sidebar-nav{display:flex;flex-direction:column;gap:0.5rem;padding:0 1.5rem}
.sidebar-link{text-decoration:none;color:var(--color-text);padding:0.5rem 0.75rem;border-radius:0.375rem;transition:all 0.2s;font-size:0.9375rem;display:block}
.sidebar-link:hover{background-color:var(--color-border)}
.sidebar-link.active{background-color:var(--color-accent);color:white;font-weight:500}
.sidebar-group{margin-bottom:0.5rem}
.sidebar-group-label{width:100%;background:none;border:none;text-align:left;padding:0.5rem 0.75rem;border-radius:0.375rem;font-size:0.9375rem;color:var(--color-text);cursor:pointer;font-weight:500;display:flex;align-items:center;justify-content:space-between;gap:0.5rem}
.sidebar-group-items{display:flex;flex-direction:column;gap:0.25rem;margin-top:0.25rem;overflow:hidden}
.sidebar-group-items.collapsed{max-height:0;opacity:0;margin-top:0}
.sidebar-group-items.expanded{max-height:2000px;opacity:1}
.doc-content{max-width:800px;padding:2rem}
.toc-aside{width:250px;padding:2rem 1.5rem;position:sticky;top:73px;height:calc(100vh - 73px);overflow-y:auto;border-left:1px solid var(--color-border)}
.toc-title{font-size:0.875rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:1rem;color:var(--color-text);opacity:0.8}
.toc-list{list-style:none;padding:0;margin:0}
.toc-item{margin:0}
.toc-level-2{margin-bottom:0.5rem}
.toc-level-3{margin-left:1rem;margin-bottom:0.375rem}
.toc-link{display:block;color:var(--color-text);text-decoration:none;font-size:0.875rem;line-height:1.5;padding:0.25rem 0.5rem;border-radius:0.25rem;transition:all 0.2s;opacity:0.7}
.toc-link:hover{opacity:1;background-color:var(--color-border)}
.header-mobile-menu{display:none}
@media(max-width:1200px){.toc-aside{display:none}}
@media(max-width:768px){.sidebar{position:fixed;top:73px;left:0;bottom:0;transform:translateX(-100%);transition:transform 0.3s;z-index:200;background-color:var(--color-bg)}.sidebar.open{transform:translateX(0)}.header-mobile-menu{display:block}}
</style>`;

async function generatePageHTML(
	route: Route,
	outDir: string,
	template: string,
	config: any,
): Promise<void> {
	// Convert route path to file path
	const htmlPath = routeToHtmlPath(route.path, outDir);

	// Read and process the markdown file
	const fileContent = await readFile(route.component, "utf-8");

	// Parse frontmatter
	const { content: markdownContent, data: frontmatter } = matter(fileContent);

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
		.use(remarkMath)
		.use(remarkBadge)
		.use(remarkCodeGroups)
		.use(remarkContainers)
		.use(remarkCodeMeta)
		.use(extractToc)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeSlug)
		.use(rehypeKatex)
		.use(rehypeMermaid)
		.use(rehypeHighlight)
		.use(rehypeLineHighlight)
		.use(rehypeExternalLinks)
		.use(rehypeStringify, { allowDangerousHtml: true });

	const vfile = await processor.process(markdownContent);
	const contentHtml = String(vfile);

	// SEO Meta Tags
	const pageTitle = frontmatter.title || config.title || "Leaf";
	const pageDescription = frontmatter.description || config.description || "A modern React-based documentation framework";
	const siteUrl = config.siteUrl || "https://leaf.sylphx.com";
	const canonicalUrl = `${siteUrl}${route.path}`;
	const ogImage = frontmatter.ogImage || `${siteUrl}/og-image.png`;

	const seoMeta = `
		<title>${pageTitle}</title>
		<meta name="description" content="${pageDescription}" />
		<link rel="canonical" href="${canonicalUrl}" />

		<!-- Open Graph / Facebook -->
		<meta property="og:type" content="website" />
		<meta property="og:url" content="${canonicalUrl}" />
		<meta property="og:title" content="${pageTitle}" />
		<meta property="og:description" content="${pageDescription}" />
		<meta property="og:image" content="${ogImage}" />
		<meta property="og:site_name" content="${config.title || 'Leaf'}" />

		<!-- Twitter -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:url" content="${canonicalUrl}" />
		<meta name="twitter:title" content="${pageTitle}" />
		<meta name="twitter:description" content="${pageDescription}" />
		<meta name="twitter:image" content="${ogImage}" />

		<!-- Additional Meta Tags -->
		<meta name="robots" content="index, follow" />
		<meta name="googlebot" content="index, follow" />
		<meta name="author" content="${config.author || 'Sylphx'}" />
		<meta name="theme-color" content="#0070f3" />
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
	`;

	// Generate Sidebar HTML matching React component structure
	function generateSidebarHTML(items: any[], level = 0): string {
		if (!items || items.length === 0) return "";

		return items
			.map((item) => {
				const hasChildren = item.items && item.items.length > 0;

				if (!hasChildren && item.link) {
					// Simple link
					const isActive = item.link === route.path;
					return `<a href="${item.link}" class="sidebar-link${isActive ? " active" : ""}">${item.text}</a>`;
				}

				if (hasChildren) {
					// Group with children
					const childrenHTML = generateSidebarHTML(item.items, level + 1);

					if (item.link) {
						// Group with link (not used in current config but supported)
						const isActive = item.link === route.path;
						return `<div class="sidebar-group">
							<div class="sidebar-group-header">
								<a href="${item.link}" class="sidebar-link${isActive ? " active" : ""}">${item.text}</a>
								<button class="sidebar-group-toggle" aria-label="Expand group">
									<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
										<polyline points="6 9 12 15 18 9" />
									</svg>
								</button>
							</div>
							<div class="sidebar-group-items expanded">${childrenHTML}</div>
						</div>`;
					} else {
						// Group without link (label only)
						return `<div class="sidebar-group">
							<button class="sidebar-group-label">
								<span>${item.text}</span>
								<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<polyline points="6 9 12 15 18 9" />
								</svg>
							</button>
							<div class="sidebar-group-items expanded">${childrenHTML}</div>
						</div>`;
					}
				}

				return "";
			})
			.join("");
	}

	const sidebarHTML = generateSidebarHTML(config.theme?.sidebar || []);

	// Generate Nav HTML matching React component
	const navHTML = (config.theme?.nav || [])
		.map((item: any) => {
			const isExternal = item.link && item.link.startsWith("http");
			if (isExternal) {
				return `<a href="${item.link}" class="nav-link" target="_blank" rel="noopener noreferrer">${item.text}</a>`;
			} else {
				return `<a href="${item.link}" class="nav-link">${item.text}</a>`;
			}
		})
		.join("");

	// Generate TOC HTML matching React component structure
	const tocHTML =
		toc.length > 0
			? `<aside class="toc-aside">
			<nav class="toc">
				<h3 class="toc-title">On this page</h3>
				<ul class="toc-list">
					${toc.map((item) => `<li class="toc-item toc-level-${item.level}"><a href="#${item.id}" class="toc-link">${item.text}</a></li>`).join("\n\t\t\t\t\t")}
				</ul>
			</nav>
		</aside>`
			: "";

	// Generate DocFooter HTML
	const docFooterHTML = lastModifiedText
		? `<footer class="doc-footer">
			<div class="doc-footer-meta">
				<div class="last-updated">
					<span class="last-updated-text">Last updated: </span>
					<time id="last-updated-time">${lastModifiedText}</time>
				</div>
			</div>
		</footer>`
		: "";

	// Client-side scripts for interactivity
	const clientScripts = `
		<script>
		// TOC active tracking
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

		// Code copy buttons
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

		// Code groups
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

		// Mermaid diagrams
		${contentHtml.includes('class="mermaid"') ? `
		(function() {
			if (typeof window === "undefined") return;
			import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs').then((m) => {
				m.default.initialize({
					startOnLoad: true,
					theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'default'
				});
			});
		})();
		` : ''}
		</script>
	`;

	// Inject everything into template - MATCH React component structure EXACTLY
	let html = template;

	// Replace title tag
	html = html.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`);

	// Inject SEO meta tags before </head>
	html = html.replace("</head>", `${seoMeta}${CRITICAL_CSS}</head>`);

	// Replace root div with SSR content - MUST match React Layout component exactly
	html = html.replace(
		'<div id="root"></div>',
		`<div id="root"><div class="layout"><header class="header"><div class="header-content"><div class="header-mobile-menu"></div><a href="/" class="logo">${config.title || "Leaf"}</a><nav class="nav">${navHTML}<button class="theme-toggle" aria-label="Toggle theme">🌙</button></nav></div></header><div class="layout-content"><aside class="sidebar"><div class="sidebar-nav">${sidebarHTML}</div></aside><main class="main-content"><div class="doc-content"><div class="markdown-content">${contentHtml}</div>${docFooterHTML}</div></main>${tocHTML}</div></div></div>${clientScripts}`,
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
