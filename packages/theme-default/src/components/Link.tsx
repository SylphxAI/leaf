import type { JSX, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
	to: string;
	children: JSX.Element;
}

/**
 * Link component for navigation
 * Uses regular anchor tags to avoid router context dependencies
 */
export const Link: ParentComponent<LinkProps> = (props) => {
	const [local, others] = splitProps(props, ["to", "children"]);

	return (
		<a href={local.to} {...others}>
			{local.children}
		</a>
	);
};
