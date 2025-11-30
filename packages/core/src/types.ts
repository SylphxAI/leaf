import type { UserConfig as ViteUserConfig } from "vite";

export interface LeafConfig {
	/** Site title */
	title?: string;
	/** Site description */
	description?: string;
	/** Base URL */
	base?: string;
	/** Head tags for SEO */
	head?: HeadTag[];
	/** Theme configuration */
	theme?: ThemeConfig;
	/** Markdown configuration */
	markdown?: MarkdownConfig;
	/** Vite configuration */
	vite?: ViteUserConfig;
}

export type HeadTag = [
	string, // tag name
	Record<string, any>, // attributes
	string?, // children (optional)
];

export interface ThemeConfig {
	/** Theme name or package */
	name?: string;
	/** Theme-specific configuration */
	config?: Record<string, any>;
	/** Navigation items */
	nav?: NavItem[];
	/** Sidebar configuration */
	sidebar?: SidebarConfig;
	/** Logo */
	logo?: string;
	/** Social links */
	socialLinks?: SocialLink[];
	/** Edit link configuration */
	editLink?: EditLinkConfig;
	/** Show last updated timestamp */
	lastUpdated?: boolean | LastUpdatedConfig;
}

export interface EditLinkConfig {
	/** URL pattern with :path placeholder */
	pattern: string;
	/** Link text (default: "Edit this page") */
	text?: string;
}

export interface LastUpdatedConfig {
	/** Custom text (default: "Last updated") */
	text?: string;
	/** Date formatting options */
	formatOptions?: Intl.DateTimeFormatOptions;
}

export interface NavItem {
	text: string;
	link: string;
}

export type SidebarConfig = SidebarItem[] | Record<string, SidebarItem[]>;

export interface SidebarItem {
	text: string;
	link?: string;
	items?: SidebarItem[];
	collapsed?: boolean;
}

export interface SocialLink {
	icon:
		| "github"
		| "twitter"
		| "discord"
		| "npm"
		| "youtube"
		| "facebook"
		| "instagram"
		| "linkedin"
		| "slack";
	link: string;
}

export interface MarkdownConfig {
	/** Enable line numbers in code blocks */
	lineNumbers?: boolean;
	/** Custom rehype plugins to process HTML */
	rehypePlugins?: RehypePlugin[];
	/** Custom remark plugins to process markdown */
	remarkPlugins?: RemarkPlugin[];
}

// Re-export plugin types from plugins module
export type { RehypePlugin, RemarkPlugin } from "./plugins/index.js";

export interface PageData {
	/** Page title from frontmatter */
	title?: string;
	/** Page description from frontmatter */
	description?: string;
	/** Page frontmatter */
	frontmatter: Record<string, any>;
	/** Page relative path */
	relativePath: string;
}
