import { useEffect, useState } from "react";
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
		<div className="sticky top-20 w-64 h-[calc(100vh-6rem)] overflow-y-auto">
			<div
				className="space-y-5 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-lg"
				style={{ boxShadow: "var(--shadow)" }}
			>
				{/* Header with gradient icon */}
				<div className="flex items-center gap-2.5 border-b border-border/50 pb-4">
					<div
						className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
						style={{
							background:
								"linear-gradient(135deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
						}}
					>
						<Icon icon="lucide:list" className="h-3.5 w-3.5" />
					</div>
					<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
						On this page
					</h3>
				</div>

				{/* Progress indicator */}
				<div className="relative h-1 w-full overflow-hidden rounded-full bg-muted">
					<div
						className="h-full rounded-full transition-all duration-500 ease-out"
						style={{
							width: `${progress}%`,
							background:
								"linear-gradient(90deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
						}}
					/>
				</div>

				{/* Navigation */}
				<nav>
					<ul className="space-y-1.5">
						{items.map((item) => {
							const isActive = activeId === item.id;
							return (
								<li
									key={item.id}
									className={cn("text-sm transition-all", item.level === 3 && "ml-4")}
								>
									<a
										href={`#${item.id}`}
										className={cn(
											"group relative block rounded-lg px-3.5 py-2 transition-all duration-200",
											isActive
												? "bg-primary/10 text-primary font-semibold shadow-sm"
												: "text-muted-foreground hover:bg-accent/50 hover:text-foreground active:scale-95"
										)}
									>
										{isActive && (
											<span
												className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r-full transition-all duration-300"
												style={{
													background:
														"linear-gradient(180deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
													boxShadow: "0 0 8px hsl(var(--primary) / 0.4)",
												}}
											/>
										)}
										<span className="block truncate">{item.text}</span>
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
