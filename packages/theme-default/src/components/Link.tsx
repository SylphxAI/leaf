// ASSUMPTION: JSX automatic runtime via Preact preset
import { open } from "@sylphx/zen-router";
import type { JSX } from "preact";

interface LinkProps extends JSX.HTMLAttributes<HTMLAnchorElement> {
	to: string;
	children: JSX.Element | JSX.Element[] | string;
}

/**
 * Link component that works with zen-router
 * Intercepts clicks and uses zen-router's open() for SPA navigation
 */
export function Link({ to, children, ...props }: LinkProps): JSX.Element {
	const handleClick = (e: JSX.TargetedMouseEvent<HTMLAnchorElement>) => {
		// Allow default behavior for:
		// - External links
		// - Modified clicks (ctrl/cmd/shift)
		// - Right clicks
		if (
			to.startsWith("http") ||
			to.startsWith("//") ||
			e.ctrlKey ||
			e.metaKey ||
			e.shiftKey ||
			e.button !== 0
		) {
			return;
		}

		e.preventDefault();
		open(to);
	};

	return (
		<a href={to} onClick={handleClick} {...props}>
			{children}
		</a>
	);
}
