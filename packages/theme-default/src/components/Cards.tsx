import { Link } from "./Link";
import { cn } from "../lib/utils";
import { For } from "solid-js";

export interface Card {
	icon?: string;
	title: string;
	description: string;
	link: string;
}

export interface CardsProps {
	cards: Card[];
	columns?: 2 | 3 | 4;
}

export function Cards(props: CardsProps) {
	if (!props.cards || props.cards.length === 0) {
		return <></>;
	}

	const columns = () => props.columns || 2;

	return (
		<div
			class={cn(
				"grid gap-4 mt-6",
				columns() === 2 && "sm:grid-cols-2",
				columns() === 3 && "sm:grid-cols-2 lg:grid-cols-3",
				columns() === 4 && "sm:grid-cols-2 lg:grid-cols-4"
			)}
			style={{ "margin-left": "0", "margin-right": "0" }}
		>
			<For each={props.cards}>
				{(card) => (
					<Link
						to={card.link}
						class="group block rounded-lg border border-border bg-background p-5 transition-all hover:border-primary/50 hover:shadow-md"
						style={{ "text-decoration": "none" }}
					>
						<div class="mb-2 flex items-center gap-3">
							{card.icon && (
								<span class="text-2xl leading-none" style={{ "margin-bottom": "0" }}>
									{card.icon}
								</span>
							)}
							<span class="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
								{card.title}
							</span>
						</div>
						<p class="text-sm text-muted-foreground leading-relaxed" style={{ margin: "0" }}>
							{card.description}
						</p>
					</Link>
				)}
			</For>
		</div>
	);
}
