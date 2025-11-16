import "iconify-icon";


export interface SidebarToggleProps {
	open: boolean;
	onClick: () => void;
}

export function SidebarToggle(props: SidebarToggleProps) {
	return (
		<button
			class="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors lg:hidden"
			onClick={props.onClick}
			aria-label="Toggle sidebar"
			aria-expanded={props.open}
		>
			<iconify-icon icon={props.open ? "lucide:x" : "lucide:menu"} class="h-6 w-6" />
		</button>
	);
}
