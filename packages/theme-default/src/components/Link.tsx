import { open } from "@sylphx/zen-router";
import type { JSX, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
	to: string;
	children: JSX.Element;
}

/**
 * Link component that works with zen-router
 * Intercepts clicks and uses zen-router's open() for SPA navigation
 */
export const Link: ParentComponent<LinkProps> = (props) => {
	const [local, others] = splitProps(props, ["to", "children"]);

	const handleClick = (e: MouseEvent) => {
		// Allow default behavior for:
		// - External links
		// - Modified clicks (ctrl/cmd/shift)
		// - Right clicks
		if (
			local.to.startsWith("http") ||
			local.to.startsWith("//") ||
			e.ctrlKey ||
			e.metaKey ||
			e.shiftKey ||
			e.button !== 0
		) {
			return;
		}

		e.preventDefault();
		open(local.to);
	};

	return (
		<a href={local.to} onClick={handleClick} {...others}>
			{local.children}
		</a>
	);
};
