import "iconify-icon";
import { cn } from "../lib/utils";
import { For, Show } from "solid-js";


export interface Feature {
	icon?: string;
	title: string;
	details: string;
	link?: string;
}

export interface FeaturesProps {
	features: Feature[];
}

export function Features(props: FeaturesProps) {
	if (!props.features || props.features.length === 0) {
		return <></>;
	}

	return (
		<div class="border-t border-border bg-muted/30">
			<div class="px-6 py-16 md:px-12 md:py-24 lg:px-20">
				<div class="mx-auto max-w-6xl">
					<div
						class={cn(
							"grid gap-8",
							props.features.length === 2 && "md:grid-cols-2",
							props.features.length === 3 && "md:grid-cols-3",
							props.features.length >= 4 && "md:grid-cols-2 lg:grid-cols-3"
						)}
					>
						<For each={props.features}>
							{(feature) => (
								<div
									class="group relative overflow-hidden rounded-xl border border-border bg-background p-8 transition-all hover:border-primary/50 hover:shadow-lg"
								>
									{/* Icon */}
									<Show when={feature.icon}>
										<div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
											<iconify-icon icon={feature.icon} class="h-6 w-6" />
										</div>
									</Show>

									{/* Title */}
									<h3 class="mb-2 text-xl font-bold text-foreground">
										{feature.title}
									</h3>

									{/* Details */}
									<p class="text-muted-foreground leading-relaxed">
										{feature.details}
									</p>

									{/* Hover gradient effect */}
									<div class="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
								</div>
							)}
						</For>
					</div>
				</div>
			</div>
		</div>
	);
}
