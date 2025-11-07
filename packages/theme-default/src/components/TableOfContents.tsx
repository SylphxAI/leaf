import { useEffect, useState } from "react";

export interface TocItem {
	text: string;
	id: string;
	level: number;
}

interface TableOfContentsProps {
	items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
	const [activeId, setActiveId] = useState<string>("");

	useEffect(() => {
		// Track which heading is currently visible
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

		// Observe all headings
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

	return (
		<nav className="toc">
			<h3 className="toc-title">On this page</h3>
			<ul className="toc-list">
				{items.map((item) => (
					<li
						key={item.id}
						className={`toc-item toc-level-${item.level} ${activeId === item.id ? "active" : ""}`}
					>
						<a href={`#${item.id}`} className="toc-link">
							{item.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
