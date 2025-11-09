import { Icon } from "@iconify/react";
import { Link } from "./Link";
import { Button } from "./Button";
import { cn } from "../lib/utils";

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

export function Hero({ name, text, tagline, actions = [], image }: HeroProps): JSX.Element {
	return (
		<div className="relative">
			<div className="px-6 py-16 md:px-12 md:py-24 lg:px-20 lg:py-32">
				<div className="mx-auto max-w-6xl">
					<div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
						{/* Hero Content */}
						<div className="text-center lg:text-left">
							{name && (
								<div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
									<Icon icon="lucide:sparkles" className="h-4 w-4" />
									{name}
								</div>
							)}

							{text && (
								<h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
									<span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
										{text}
									</span>
								</h1>
							)}

							{tagline && (
								<p className="mb-8 text-xl text-muted-foreground md:text-2xl lg:text-3xl font-medium">
									{tagline}
								</p>
							)}

							{actions.length > 0 && (
								<div className="flex flex-wrap gap-4 justify-center lg:justify-start">
									{actions.map((action, index) => {
										const isBrand = action.theme === "brand" || index === 0;
										return (
											<Link
												key={action.link}
												to={action.link}
												className={cn(
													"inline-flex items-center gap-2 rounded-lg px-6 py-3 text-base font-semibold transition-all active:scale-95 shadow-lg hover:shadow-xl",
													isBrand
														? "bg-primary text-primary-foreground hover:bg-primary/90"
														: "bg-muted text-foreground hover:bg-muted/80"
												)}
											>
												{action.text}
												<Icon
													icon={isBrand ? "lucide:arrow-right" : "lucide:book-open"}
													className="h-5 w-5"
												/>
											</Link>
										);
									})}
								</div>
							)}
						</div>

						{/* Hero Image */}
						{image && (
							<div className="relative">
								<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 shadow-2xl">
									<img
										src={image.src}
										alt={image.alt || "Hero image"}
										className="relative z-10 w-full h-auto rounded-lg"
									/>
									<div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Background Decorations */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
			</div>
		</div>
	);
}
