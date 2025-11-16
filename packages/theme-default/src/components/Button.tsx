import type { JSX, ParentComponent } from "solid-js";
import { cn } from "../lib/utils";

interface ButtonProps {
	children: JSX.Element;
	onClick?: () => void;
	class?: string;
	variant?: "icon" | "default";
	type?: "button" | "submit" | "reset";
	"aria-label"?: string;
	"aria-pressed"?: boolean;
}

export const Button: ParentComponent<ButtonProps> = (props) => {
	const baseStyles = "inline-flex items-center justify-center rounded-lg transition-all active:scale-95";

	const variantStyles = {
		icon: "h-9 w-9 p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
		default: "gap-2.5 px-4 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground",
	};

	return (
		<button
			type={props.type || "button"}
			class={cn(baseStyles, variantStyles[props.variant || "default"], props.class)}
			onClick={props.onClick}
			aria-label={props["aria-label"]}
			aria-pressed={props["aria-pressed"]}
		>
			{props.children}
		</button>
	);
};
