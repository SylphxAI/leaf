import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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

	const shouldExpand = hasActiveChild;

	// IMPORTANT: Initialize with false (expanded) to match SSR structure
	// Groups with active children will stay expanded, others will be interactive
	const [collapsed, setCollapsed] = React.useState(item.collapsed ?? false);

	React.useEffect(() => {
		if (shouldExpand && collapsed) {
			setCollapsed(false);
		}
	}, [shouldExpand, collapsed]);

	if (!hasItems && item.link) {
		// Simple link item
		return (
			<Link
				to={item.link}
				className={isActive ? "sidebar-link active" : "sidebar-link"}
				style={{ paddingLeft: `${level * 1 + 0.75}rem` }}
			>
				{item.text}
			</Link>
		);
	}

	if (hasItems) {
		// Group with collapsible children
		return (
			<div className="sidebar-group">
				{item.link ? (
					<div className="sidebar-group-header">
						<Link
							to={item.link}
							className={isActive ? "sidebar-link active" : "sidebar-link"}
							style={{ paddingLeft: `${level * 1 + 0.75}rem` }}
						>
							{item.text}
						</Link>
						<button
							className="sidebar-group-toggle"
							onClick={() => setCollapsed(!collapsed)}
							aria-label={collapsed ? "Expand group" : "Collapse group"}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								style={{
									transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
									transition: "transform 0.2s",
								}}
							>
								<polyline points="6 9 12 15 18 9" />
							</svg>
						</button>
					</div>
				) : (
					<button
						className="sidebar-group-label"
						onClick={() => setCollapsed(!collapsed)}
						style={{ paddingLeft: `${level * 1 + 0.75}rem` }}
					>
						<span>{item.text}</span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							style={{
								transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
								transition: "transform 0.2s",
							}}
						>
							<polyline points="6 9 12 15 18 9" />
						</svg>
					</button>
				)}

				<div className={`sidebar-group-items ${collapsed ? "collapsed" : "expanded"}`}>
					{item.items.map((child, idx) => (
						<SidebarGroup key={child.link || idx} item={child} level={level + 1} />
					))}
				</div>
			</div>
		);
	}

	return null;
}

export function Sidebar({ items = [], open = false, onClose }: SidebarProps): JSX.Element {
	return (
		<>
			{open && <div className="sidebar-backdrop" onClick={onClose} />}
			<aside className={`sidebar ${open ? "open" : ""}`}>
				<nav className="sidebar-nav">
					{items.map((item, idx) => (
						<SidebarGroup key={item.link || idx} item={item} />
					))}
				</nav>
			</aside>
		</>
	);
}
