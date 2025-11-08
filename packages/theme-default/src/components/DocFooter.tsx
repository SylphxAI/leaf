// ASSUMPTION: JSX automatic runtime via Preact preset
import { Link } from "./Link";
import { Icon } from "@iconify/react";

export interface DocFooterProps {
	prev?: {
		text: string;
		link: string;
	};
	next?: {
		text: string;
		link: string;
	};
	editLink?: {
		pattern: string;
		text?: string;
	};
	lastUpdated?: boolean;
}

export function DocFooter({
	prev,
	next,
	editLink,
	lastUpdated,
}: DocFooterProps): JSX.Element {
	return (
		<footer className="mt-12 border-t pt-8">
			{(editLink || lastUpdated) && (
				<div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
					{editLink && (
						<a
							href={editLink.pattern}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<Icon icon="lucide:edit" className="h-4 w-4" />
							<span>{editLink.text || "Edit this page"}</span>
						</a>
					)}
					{lastUpdated && (
						<div className="flex items-center gap-2">
							<Icon icon="lucide:clock" className="h-4 w-4" />
							<span>Last updated: </span>
							<time id="last-updated-time" className="font-medium text-foreground" />
						</div>
					)}
				</div>
			)}

			{(prev || next) && (
				<nav className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						{prev && (
							<Link
								to={prev.link}
								className="group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
							>
								<span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
									<Icon icon="lucide:arrow-left" className="h-3 w-3" />
									Previous
								</span>
								<span className="font-semibold text-foreground group-hover:text-primary">
									{prev.text}
								</span>
							</Link>
						)}
					</div>
					<div className="md:text-right">
						{next && (
							<Link
								to={next.link}
								className="group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md md:items-end"
							>
								<span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Next
									<Icon icon="lucide:arrow-right" className="h-3 w-3" />
								</span>
								<span className="font-semibold text-foreground group-hover:text-primary">
									{next.text}
								</span>
							</Link>
						)}
					</div>
				</nav>
			)}
		</footer>
	);
}
