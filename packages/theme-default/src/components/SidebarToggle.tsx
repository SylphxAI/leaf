import React from "react";
import { Icon } from "@iconify/react";

export interface SidebarToggleProps {
	open: boolean;
	onClick: () => void;
}

export function SidebarToggle({
	open,
	onClick,
}: SidebarToggleProps): JSX.Element {
	return (
		<button
			className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors lg:hidden"
			onClick={onClick}
			aria-label="Toggle sidebar"
			aria-expanded={open}
		>
			<Icon icon={open ? "lucide:x" : "lucide:menu"} className="h-6 w-6" />
		</button>
	);
}
