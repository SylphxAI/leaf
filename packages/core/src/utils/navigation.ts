export interface SidebarItem {
	text: string;
	link?: string;
	items?: SidebarItem[];
	collapsed?: boolean;
}

export interface NavLink {
	text: string;
	link: string;
}

/**
 * Flatten sidebar items into a linear list of links
 */
function flattenSidebar(items: SidebarItem[]): NavLink[] {
	const links: NavLink[] = [];

	function traverse(items: SidebarItem[]) {
		for (const item of items) {
			if (item.link) {
				links.push({ text: item.text, link: item.link });
			}
			if (item.items) {
				traverse(item.items);
			}
		}
	}

	traverse(items);
	return links;
}

/**
 * Get prev/next navigation links for a given route
 */
export function getPrevNext(
	currentPath: string,
	sidebar: SidebarItem[],
): {
	prev?: NavLink;
	next?: NavLink;
} {
	const flatLinks = flattenSidebar(sidebar);
	const currentIndex = flatLinks.findIndex((link) => link.link === currentPath);

	if (currentIndex === -1) {
		return {};
	}

	return {
		prev: currentIndex > 0 ? flatLinks[currentIndex - 1] : undefined,
		next:
			currentIndex < flatLinks.length - 1
				? flatLinks[currentIndex + 1]
				: undefined,
	};
}
