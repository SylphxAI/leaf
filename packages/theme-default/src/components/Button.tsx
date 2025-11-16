import type { JSX, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";
import { cn } from "../lib/utils";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "icon" | "default";
}

export const Button: ParentComponent<ButtonProps> = (props) => {
	const [local, others] = splitProps(props, ["variant", "class", "children"]);

	const baseStyles = "inline-flex items-center justify-center rounded-lg transition-all active:scale-95";

	const variantStyles = {
		icon: "h-9 w-9 p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
		default: "gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground",
	};

	return (
		<button
			type="button"
			class={cn(baseStyles, variantStyles[local.variant || "default"], local.class)}
			{...others}
		>
			{local.children}
		</button>
	);
};
