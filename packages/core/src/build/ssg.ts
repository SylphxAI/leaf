import { readFile } from "node:fs/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { type Route, generateRoutes } from "../utils/routes.js";
import matter from "gray-matter";
import { generateSearchIndex } from "./search.js";
import { getLastModifiedTime, formatLastModified } from "../utils/git.js";
import { createMarkdownProcessor } from "../markdown/processor.js";

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

	// Create unified processor with TOC extraction
	const { processor, getToc } = createMarkdownProcessor({
		config,
		extractToc: true,
	});

	const vfile = await processor.process(markdownContent);
	const contentHtml = String(vfile);
	const toc = getToc();

	// SEO Meta Tags
	const pageTitle = frontmatter.title || config.title || "Leaf";
	const pageDescription = frontmatter.description || config.description || "A modern React-based documentation framework";
	const siteUrl = config.siteUrl || "https://leaf.sylphx.com";
	const canonicalUrl = `${siteUrl}${route.path}`;
	const ogImage = frontmatter.ogImage || `${siteUrl}/og-image.png`;

	const themeColor = config.theme?.themeColor || "#15803D";

	const seoMeta = `
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
		<meta name="theme-color" content="${themeColor}" />

		<!-- Favicons -->
		<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
		<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
		<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

		<!-- PWA Manifest -->
		<link rel="manifest" href="/manifest.webmanifest" />
	`;

	// Prepare preload data for React (TOC, last modified, etc)
	const preloadData = {
		toc,
		lastModified: lastModifiedText,
		frontmatter,
	};

	const preloadScript = `
		<script id="__LEAF_PRELOAD__" type="application/json">${JSON.stringify(preloadData)}</script>
	`;

	// Inject all head content in a single pass to avoid multiple replacements
	// This ensures proper ordering and prevents replacement conflicts
	const headInjection = `
		<!-- SEO Meta Tags -->
		${seoMeta}

		<!-- Preload Data -->
		${preloadScript}
	</head>`;

	let html = template;

	// Replace title tag
	html = html.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`);

	// Inject all head content before </head> in a single replacement
	html = html.replace("</head>", headInjection);

	// React will handle ALL rendering - we just keep empty root
	// This prevents hydration mismatches

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
