import "iconify-icon";
import { Link } from "./Link";
import { Button } from "./Button";
import { cn } from "../lib/utils";
import { For, Show } from "solid-js";


export interface HeroAction {
	text: string;
	link: string;
	theme?: "brand" | "alt";
}

export interface HeroProps {
	name?: string;
	text?: string;
	tagline?: string;
	actions?: HeroAction[];
	image?: {
		src: string;
		alt?: string;
	};
}

export function Hero(props: HeroProps) {
	return (
		<div class="relative">
			<div class="px-6 py-16 md:px-12 md:py-24 lg:px-20 lg:py-32">
				<div class="mx-auto max-w-6xl">
					<div class="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
						{/* Hero Content */}
						<div class="text-center lg:text-left">
							<Show when={props.name}>
								<div class="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
									<iconify-icon icon="lucide:sparkles" class="h-4 w-4" />
									{props.name}
								</div>
							</Show>

							<Show when={props.text}>
								<h1 class="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
									<span class="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
										{props.text}
									</span>
								</h1>
							</Show>

							<Show when={props.tagline}>
								<p class="mb-8 text-xl text-muted-foreground md:text-2xl lg:text-3xl font-medium">
									{props.tagline}
								</p>
							</Show>

							<Show when={props.actions && props.actions.length > 0}>
								<div class="flex flex-wrap gap-4 justify-center lg:justify-start">
									<For each={props.actions}>
										{(action, index) => {
											const isBrand = action.theme === "brand" || index() === 0;
											return (
												<Link
													to={action.link}
													class={cn(
														"inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-all active:scale-95 shadow-lg hover:shadow-xl",
														isBrand
															? "bg-primary text-primary-foreground hover:bg-primary/90"
															: "bg-muted text-foreground hover:bg-muted/80"
													)}
												>
													{action.text}
													<iconify-icon
														icon={isBrand ? "lucide:arrow-right" : "lucide:book-open"}
														class="h-5 w-5"
													/>
												</Link>
											);
										}}
									</For>
								</div>
							</Show>
						</div>

						{/* Hero Image */}
						<Show when={props.image}>
							<div class="relative">
								<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 shadow-2xl">
									<img
										src={props.image!.src}
										alt={props.image!.alt || "Hero image"}
										class="relative z-10 w-full h-auto rounded-lg"
									/>
									<div class="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
								</div>
							</div>
						</Show>
					</div>
				</div>
			</div>

			{/* Background Decorations */}
			<div class="absolute inset-0 -z-10 overflow-hidden">
				<div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
				<div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
			</div>
		</div>
	);
}
