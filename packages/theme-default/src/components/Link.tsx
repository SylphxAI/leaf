import { A } from "@solidjs/router";
import type { JSX, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
	to: string;
	children: JSX.Element;
}

/**
 * Link component for SPA navigation
 * Uses @solidjs/router's <A> component for client-side routing
 * Falls back to regular anchor for external links
 */
export const Link: ParentComponent<LinkProps> = (props) => {
	const [local, others] = splitProps(props, ["to", "children"]);

	// External links use regular anchor
	if (local.to.startsWith("http") || local.to.startsWith("//")) {
		return (
			<a href={local.to} {...others} target="_blank" rel="noopener noreferrer">
				{local.children}
			</a>
		);
	}

	// Internal links use SolidJS Router's A component for SPA navigation
	return (
		<A href={local.to} {...others}>
			{local.children}
		</A>
	);
};
