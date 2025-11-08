import React from "react";
import { Link, useLocation } from "react-router-dom";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Icon } from "@iconify/react";
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

function SidebarGroup({
	item,
	level = 0,
}: {
	item: SidebarItem;
	level?: number;
}): JSX.Element {
	const location = useLocation();
	const hasItems = item.items && item.items.length > 0;

	const isActive = item.link && location.pathname === item.link;
	const hasActiveChild =
		hasItems &&
		item.items.some(
			(child) =>
				child.link === location.pathname ||
				child.items?.some((grandchild) => grandchild.link === location.pathname),
		);

	const [open, setOpen] = React.useState(!item.collapsed || hasActiveChild);

	if (!hasItems && item.link) {
		return (
			<Link
				to={item.link}
				className={cn(
					"block rounded-md px-3 py-2 text-sm font-medium transition-colors",
					isActive
						? "bg-primary/10 text-primary"
						: "text-muted-foreground hover:bg-accent hover:text-foreground"
				)}
				style={{ paddingLeft: `${level * 0.75 + 0.75}rem` }}
			>
				{item.text}
			</Link>
		);
	}

	if (hasItems) {
		return (
			<Collapsible.Root open={open} onOpenChange={setOpen} className="space-y-1">
				<Collapsible.Trigger
					className={cn(
						"flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-semibold transition-colors",
						"text-foreground hover:bg-accent"
					)}
					style={{ paddingLeft: `${level * 0.75 + 0.75}rem` }}
				>
					<span>{item.text}</span>
					<Icon
						icon="lucide:chevron-right"
						className={cn(
							"h-4 w-4 transition-transform duration-200",
							open && "rotate-90"
						)}
					/>
				</Collapsible.Trigger>
				<Collapsible.Content className="space-y-1 pt-1">
					{item.items.map((child, idx) => (
						<SidebarGroup key={child.link || idx} item={child} level={level + 1} />
					))}
				</Collapsible.Content>
			</Collapsible.Root>
		);
	}

	return null;
}

export function Sidebar({
	items = [],
	open = false,
	onClose,
}: SidebarProps): JSX.Element {
	return (
		<>
			{/* Overlay for mobile */}
			{open && (
				<div
					className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
					onClick={onClose}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-border/40 bg-background",
					"transition-transform duration-300 ease-in-out lg:translate-x-0",
					open ? "translate-x-0" : "-translate-x-full"
				)}
			>
				<div className="h-full overflow-y-auto px-6 py-8">
					<nav className="space-y-1">
						{items.map((item, idx) => (
							<SidebarGroup key={item.link || idx} item={item} />
						))}
					</nav>
				</div>
			</aside>
		</>
	);
}
