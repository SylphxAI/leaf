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
		<div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto">
			<div className="space-y-2">
				<h3 className="text-sm font-semibold text-foreground">On this page</h3>
				<nav>
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
	);
}
