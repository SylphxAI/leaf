import { createSignal, Show, For } from "solid-js";
import { Link } from "./Link";
import { useLocation } from "@solidjs/router";
import * as Collapsible from "@kobalte/core/collapsible";
import "iconify-icon";
import { cn } from "../lib/utils";


interface SidebarItem {
	text: string;
	link?: string;
	items?: SidebarItem[];
	collapsed?: boolean;
}

interface SidebarProps {
	items?: SidebarItem[];
	open?: boolean;
	onClose?: () => void;
}

function SidebarGroup(props: { item: SidebarItem; level?: number }) {
	const location = useLocation();
	const pathname = () => location.pathname;
	const hasItems = props.item.items && props.item.items.length > 0;

	const isActive = () => props.item.link && pathname() === props.item.link;
	const hasActiveChild = () =>
		hasItems &&
		props.item.items!.some(
			(child) =>
				child.link === pathname() ||
				child.items?.some((grandchild) => grandchild.link === pathname()),
		);

	const [open, setOpen] = createSignal(!props.item.collapsed || hasActiveChild());

	if (!hasItems && props.item.link) {
		return (
			<Link
				to={props.item.link}
				class={cn(
					"block rounded-lg px-3 py-2.5 text-sm font-semibold transition-all",
					isActive()
						? "bg-primary/10 text-primary shadow-sm border border-primary/20"
						: "text-muted-foreground hover:bg-muted hover:text-foreground hover:shadow-sm"
				)}
				style={{ "padding-left": `${(props.level || 0) * 1 + 0.75}rem` }}
			>
				{props.item.text}
			</Link>
		);
	}

	if (hasItems) {
		return (
			<Collapsible.Root open={open()} onOpenChange={setOpen} class="space-y-1">
				<Collapsible.Trigger
					class={cn(
						"flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold transition-all",
						"text-foreground hover:bg-muted/60 hover:shadow-sm"
					)}
					style={{ "padding-left": `${(props.level || 0) * 1 + 0.75}rem` }}
					aria-expanded={open()}
				>
					<span>{props.item.text}</span>
					<iconify-icon
						icon="lucide:chevron-right"
						class={cn(
							"h-4 w-4 transition-all duration-200 text-muted-foreground",
							open() && "rotate-90 text-primary"
						)}
					/>
				</Collapsible.Trigger>
				<Collapsible.Content class="space-y-1 pt-1">
					<For each={props.item.items}>
						{(child) => (
							<SidebarGroup item={child} level={(props.level || 0) + 1} />
						)}
					</For>
				</Collapsible.Content>
			</Collapsible.Root>
		);
	}

	return null;
}

export function Sidebar(props: SidebarProps): JSX.Element {
	return (
		<>
			{/* Overlay for mobile */}
			<Show when={props.open}>
				<div
					class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
					onClick={props.onClose}
					aria-label="Close sidebar"
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							props.onClose?.();
						}
					}}
				/>
			</Show>

			{/* Sidebar */}
			<aside
				role="navigation"
				aria-label="Documentation navigation"
				class={cn(
					"fixed top-16 bottom-0 left-0 z-40 w-80 border-r border-border bg-background",
					"transition-transform duration-300 ease-in-out lg:translate-x-0",
					props.open ? "translate-x-0" : "-translate-x-full"
				)}
			>
				<div class="sidebar-scroll h-full overflow-y-auto px-6 py-10">
					<nav class="space-y-0.5">
						<For each={props.items || []}>
							{(item) => <SidebarGroup item={item} />}
						</For>
					</nav>
				</div>
			</aside>
		</>
	);
}
