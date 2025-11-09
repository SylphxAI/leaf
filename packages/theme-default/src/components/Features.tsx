import { Icon } from "@iconify/react";
import { cn } from "../lib/utils";

export interface Feature {
	icon?: string;
	title: string;
	details: string;
	link?: string;
}

export interface FeaturesProps {
	features: Feature[];
}

export function Features({ features }: FeaturesProps): JSX.Element {
	if (!features || features.length === 0) {
		return <></>;
	}

	return (
		<div className="border-t border-border bg-muted/30">
			<div className="px-6 py-16 md:px-12 md:py-24 lg:px-20">
				<div className="mx-auto max-w-6xl">
					<div
						className={cn(
							"grid gap-8",
							features.length === 2 && "md:grid-cols-2",
							features.length === 3 && "md:grid-cols-3",
							features.length >= 4 && "md:grid-cols-2 lg:grid-cols-3"
						)}
					>
						{features.map((feature, index) => (
							<div
								key={index}
								className="group relative overflow-hidden rounded-xl border border-border bg-background p-8 transition-all hover:border-primary/50 hover:shadow-lg"
							>
								{/* Icon */}
								{feature.icon && (
									<div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
										<Icon icon={feature.icon} className="h-6 w-6" />
									</div>
								)}

								{/* Title */}
								<h3 className="mb-2 text-xl font-bold text-foreground">
									{feature.title}
								</h3>

								{/* Details */}
								<p className="text-muted-foreground leading-relaxed">
									{feature.details}
								</p>

								{/* Hover gradient effect */}
								<div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
