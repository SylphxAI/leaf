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
					"group relative flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
					isActive
						? "bg-primary/10 text-primary font-semibold shadow-sm"
						: "text-muted-foreground hover:bg-accent/50 hover:text-foreground active:scale-95"
				)}
				style={{ paddingLeft: `${level * 0.75 + 0.875}rem` }}
			>
				{isActive && (
					<span
						className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full shadow-lg transition-all duration-300"
						style={{
							background:
								"linear-gradient(180deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
							boxShadow: "0 0 12px hsl(var(--primary) / 0.4)",
						}}
					/>
				)}
				<span className="truncate">{item.text}</span>
			</Link>
		);
	}

	if (hasItems) {
		return (
			<Collapsible.Root open={open} onOpenChange={setOpen} className="space-y-1.5">
				<Collapsible.Trigger
					className={cn(
						"group flex w-full items-center justify-between gap-2 rounded-lg px-3.5 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200",
						"text-muted-foreground/80 hover:text-foreground hover:bg-accent/30"
					)}
					style={{ paddingLeft: `${level * 0.75 + 0.875}rem` }}
				>
					<span className="text-xs">{item.text}</span>
					<Icon
						icon="lucide:chevron-down"
						className={cn(
							"h-4 w-4 shrink-0 transition-all duration-300",
							open ? "rotate-0" : "-rotate-90"
						)}
					/>
				</Collapsible.Trigger>

				<Collapsible.Content className="space-y-1 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
					<div className="ml-3 space-y-1 border-l-2 border-border/40 pl-2.5 transition-all duration-200 hover:border-border/60">
						{item.items.map((child, idx) => (
							<SidebarGroup key={child.link || idx} item={child} level={level + 1} />
						))}
					</div>
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
			{/* Backdrop for mobile - Enhanced blur */}
			{open && (
				<div
					className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md transition-opacity duration-300 lg:hidden"
					onClick={onClose}
				/>
			)}

			{/* Sidebar with card-based design */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 w-64 border-r border-border/40 bg-background/90 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/70 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0",
					"transform transition-all duration-300 ease-in-out",
					open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
				)}
			>
				<div className="flex h-full flex-col">
					{/* Header - Mobile only with gradient */}
					<div className="flex items-center justify-between border-b border-border/40 bg-muted/30 p-4 backdrop-blur-sm lg:hidden">
						<h2
							className="text-lg font-bold bg-clip-text text-transparent"
							style={{
								backgroundImage:
									"linear-gradient(135deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
							}}
						>
							Menu
						</h2>
						<button
							onClick={onClose}
							className="rounded-lg p-2 text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground active:scale-95"
						>
							<Icon icon="lucide:x" className="h-5 w-5" />
						</button>
					</div>

					{/* Navigation with refined spacing */}
					<nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
						{items.map((item, idx) => (
							<SidebarGroup key={item.link || idx} item={item} />
						))}
					</nav>
				</div>
			</aside>
		</>
	);
}
