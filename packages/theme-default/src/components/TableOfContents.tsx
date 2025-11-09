import { useEffect, useState } from "preact/hooks";
import { Icon } from "@iconify/react";
import { cn } from "../lib/utils";

export interface TocItem {
	text: string;
	id: string;
	level: number;
}

interface TableOfContentsProps {
	items: TocItem[];
}

export function TableOfContents({
	items,
}: TableOfContentsProps): JSX.Element | null {
	const [activeId, setActiveId] = useState<string>("");

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{
				rootMargin: "-80px 0px -80% 0px",
			},
		);

		items.forEach((item) => {
			const element = document.getElementById(item.id);
			if (element) {
				observer.observe(element);
			}
		});

		return () => observer.disconnect();
	}, [items]);

	if (items.length === 0) {
		return null;
	}

	const activeIndex = items.findIndex((item) => item.id === activeId);
	const progress =
		activeIndex >= 0 ? ((activeIndex + 1) / items.length) * 100 : 0;

	return (
		<div className="group sticky top-24 h-[calc(100vh-6rem)]">
			<div className="relative h-full overflow-y-auto pr-3">
				{/* Scroll Progress Indicator */}
				<div className="absolute right-0 top-0 h-full w-0.5 bg-border/50 opacity-0 transition-opacity group-hover:opacity-100">
					<div
						className="w-full bg-primary transition-all duration-300"
						style={{ height: `${progress}%` }}
					/>
				</div>

				<div className="space-y-2">
					<h3 className="text-sm font-semibold text-foreground">On this page</h3>
					<nav aria-label="Table of contents">
						<ul className="space-y-1">
							{items.map((item) => {
								const isActive = activeId === item.id;
								return (
									<li
										key={item.id}
										className={cn(
											item.level === 3 && "ml-4"
										)}
									>
										<a
											href={`#${item.id}`}
											className={cn(
												"block text-sm py-1 transition-colors",
												isActive
													? "text-primary font-medium"
													: "text-muted-foreground hover:text-foreground"
											)}
											aria-current={isActive ? "location" : undefined}
										>
											{item.text}
										</a>
									</li>
								);
							})}
						</ul>
					</nav>
				</div>
			</div>
		</div>
	);
}
