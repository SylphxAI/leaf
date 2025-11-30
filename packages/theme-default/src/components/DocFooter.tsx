import { Link } from "./Link";
import "iconify-icon";
import { Show } from "solid-js";

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

export function DocFooter(props: DocFooterProps): JSX.Element {
	return (
		<footer class="mt-12 border-t pt-8">
			<Show when={props.editLink || props.lastUpdated}>
				<div class="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
					<Show when={props.editLink}>
						<a
							href={props.editLink!.pattern}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
						>
							<iconify-icon icon="lucide:edit" class="h-4 w-4" />
							<span>{props.editLink!.text || "Edit this page"}</span>
						</a>
					</Show>
					<Show when={props.lastUpdated}>
						<div class="flex items-center gap-2">
							<iconify-icon icon="lucide:clock" class="h-4 w-4" />
							<span>Last updated: </span>
							<time
								id="last-updated-time"
								class="font-medium text-foreground"
							/>
						</div>
					</Show>
				</div>
			</Show>

			<Show when={props.prev || props.next}>
				<nav
					class="grid grid-cols-1 gap-4 md:grid-cols-2"
					aria-label="Page navigation"
				>
					<div>
						<Show when={props.prev}>
							<Link
								to={props.prev!.link}
								class="group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
								aria-label={`Previous page: ${props.prev!.text}`}
							>
								<span class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
									<iconify-icon icon="lucide:arrow-left" class="h-3 w-3" />
									Previous
								</span>
								<span class="font-semibold text-foreground group-hover:text-primary">
									{props.prev!.text}
								</span>
							</Link>
						</Show>
					</div>
					<div class="md:text-right">
						<Show when={props.next}>
							<Link
								to={props.next!.link}
								class="group flex flex-col gap-2 rounded-lg border bg-card p-4 transition-all hover:border-primary hover:shadow-md md:items-end"
								aria-label={`Next page: ${props.next!.text}`}
							>
								<span class="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Next
									<iconify-icon icon="lucide:arrow-right" class="h-3 w-3" />
								</span>
								<span class="font-semibold text-foreground group-hover:text-primary">
									{props.next!.text}
								</span>
							</Link>
						</Show>
					</div>
				</nav>
			</Show>
		</footer>
	);
}
