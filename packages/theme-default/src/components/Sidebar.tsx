// ASSUMPTION: JSX automatic runtime via Preact preset
import { useState } from "preact/hooks";
import { Link } from "./Link";
import { useLocation } from "../hooks/useRouter";
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

	const [open, setOpen] = useState(!item.collapsed || hasActiveChild);

	if (!hasItems && item.link) {
		return (
			<Link
				to={item.link}
				className={cn(
					"block rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
					isActive
						? "bg-muted text-foreground"
						: "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
				)}
				style={{ paddingLeft: `${level * 1 + 0.75}rem` }}
			>
				{item.text}
			</Link>
		);
	}

	if (hasItems) {
		return (
			<Collapsible.Root open={open} onOpenChange={setOpen} className="space-y-0.5">
				<Collapsible.Trigger
					className={cn(
						"flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
						"text-foreground hover:bg-muted/50"
					)}
					style={{ paddingLeft: `${level * 1 + 0.75}rem` }}
					aria-expanded={open}
				>
					<span>{item.text}</span>
					<Icon
						icon="lucide:chevron-right"
						className={cn(
							"h-3.5 w-3.5 transition-transform duration-200 text-muted-foreground",
							open && "rotate-90"
						)}
					/>
				</Collapsible.Trigger>
				<Collapsible.Content className="space-y-0.5 pt-1">
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
					aria-label="Close sidebar"
					role="button"
					tabIndex={0}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							onClose?.();
						}
					}}
				/>
			)}

			{/* Sidebar */}
			<aside
				role="navigation"
				aria-label="Documentation navigation"
				className={cn(
					"fixed top-16 bottom-0 left-0 z-40 w-80 border-r border-border bg-background",
					"transition-transform duration-300 ease-in-out lg:translate-x-0",
					open ? "translate-x-0" : "-translate-x-full"
				)}
			>
				<div className="sidebar-scroll h-full overflow-y-auto px-6 py-10">
					<nav className="space-y-0.5">
						{items.map((item, idx) => (
							<SidebarGroup key={item.link || idx} item={item} />
						))}
					</nav>
				</div>
			</aside>
		</>
	);
}
