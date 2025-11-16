import { createSignal, createEffect, onCleanup, Show, For } from "solid-js";
import "iconify-icon";
import { cn } from "../lib/utils";


export interface TocItem {
	text: string;
	id: string;
	level: number;
}

interface TableOfContentsProps {
	items: TocItem[];
}

export function TableOfContents(props: TableOfContentsProps) {
	const [activeId, setActiveId] = createSignal<string>("");

	createEffect(() => {
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

		props.items.forEach((item) => {
			const element = document.getElementById(item.id);
			if (element) {
				observer.observe(element);
			}
		});

		onCleanup(() => observer.disconnect());
	});

	if (props.items.length === 0) {
		return null;
	}

	const activeIndex = () => props.items.findIndex((item) => item.id === activeId());
	const progress = () =>
		activeIndex() >= 0 ? ((activeIndex() + 1) / props.items.length) * 100 : 0;

	return (
		<div class="group sticky top-24 h-[calc(100vh-6rem)]">
			<div class="relative h-full overflow-y-auto pr-3">
				{/* Scroll Progress Indicator */}
				<div class="absolute right-0 top-0 h-full w-0.5 bg-border/50 opacity-0 transition-opacity group-hover:opacity-100">
					<div
						class="w-full bg-primary transition-all duration-300"
						style={{ height: `${progress()}%` }}
					/>
				</div>

				<div class="space-y-2">
					<h3 class="text-sm font-semibold text-foreground">On this page</h3>
					<nav aria-label="Table of contents">
						<ul class="space-y-1">
							<For each={props.items}>
								{(item) => {
									const isActive = () => activeId() === item.id;
									return (
										<li
											class={cn(
												item.level === 3 && "ml-4"
											)}
										>
											<a
												href={`#${item.id}`}
												class={cn(
													"block text-sm py-1 transition-colors",
													isActive()
														? "text-primary font-medium"
														: "text-muted-foreground hover:text-foreground"
												)}
												aria-current={isActive() ? "location" : undefined}
											>
												{item.text}
											</a>
										</li>
									);
								}}
							</For>
						</ul>
					</nav>
				</div>
			</div>
		</div>
	);
}
