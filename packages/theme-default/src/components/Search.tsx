import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import "iconify-icon";
import MiniSearch from "minisearch";
import { cn } from "../lib/utils";

interface SearchDocument {
	id: string;
	title: string;
	text: string;
	path: string;
	section?: string;
}

interface SearchResult {
	id: string;
	title: string;
	text: string;
	path: string;
	section?: string;
	score: number;
}

interface SearchProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function Search(props: SearchProps = {}): JSX.Element {
	const [internalOpen, setInternalOpen] = createSignal(false);
	const open = () => (props.open !== undefined ? props.open : internalOpen());
	const setOpen = (value: boolean) => {
		if (props.onOpenChange) {
			props.onOpenChange(value);
		} else {
			setInternalOpen(value);
		}
	};

	const [query, setQuery] = createSignal("");
	const [results, setResults] = createSignal<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = createSignal(0);
	const [searchIndex, setSearchIndex] = createSignal<MiniSearch | null>(null);
	const [isVisible, setIsVisible] = createSignal(false);
	const [shouldRender, setShouldRender] = createSignal(false);
	const navigate = useNavigate();

	// Handle animation on open/close
	createEffect(() => {
		if (open()) {
			setShouldRender(true);
			requestAnimationFrame(() => {
				setIsVisible(true);
			});
		} else {
			setIsVisible(false);
			const timer = setTimeout(() => {
				setShouldRender(false);
			}, 300);
			onCleanup(() => clearTimeout(timer));
		}
	});

	// Load search index
	createEffect(() => {
		fetch("/search-index.json")
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP ${res.status}`);
				}
				return res.json();
			})
			.then((documents: SearchDocument[]) => {
				const miniSearch = new MiniSearch({
					fields: ["title", "text"],
					storeFields: ["title", "text", "path", "section"],
					searchOptions: {
						boost: { title: 2 },
						fuzzy: 0.2,
						prefix: true,
					},
				});

				miniSearch.addAll(documents);
				setSearchIndex(miniSearch);
			})
			.catch((err) => {
				// Silently fail in development mode when search index doesn't exist
				if (import.meta.env.DEV) {
					return;
				}
				console.error("Failed to load search index:", err);
			});
	});

	// Handle keyboard shortcuts
	createEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Cmd/Ctrl + K to open search
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen(true);
				setQuery("");
				setSelectedIndex(0);
			}

			if (!open()) return;

			// Esc to close
			if (e.key === "Escape") {
				setOpen(false);
				setQuery("");
				setResults([]);
			}

			// Arrow navigation
			if (results().length > 0) {
				if (e.key === "ArrowDown") {
					e.preventDefault();
					setSelectedIndex((prev) => (prev + 1) % results().length);
				} else if (e.key === "ArrowUp") {
					e.preventDefault();
					setSelectedIndex(
						(prev) => (prev - 1 + results().length) % results().length,
					);
				} else if (e.key === "Enter") {
					e.preventDefault();
					if (results()[selectedIndex()]) {
						handleSelectResult(results()[selectedIndex()]);
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
	});

	// Perform search
	createEffect(() => {
		if (!searchIndex() || !query().trim()) {
			setResults([]);
			setSelectedIndex(0);
			return;
		}

		const searchResults = searchIndex()!.search(query(), {
			limit: 10,
		}) as SearchResult[];

		setResults(searchResults);
		setSelectedIndex(0);
	});

	const handleSelectResult = (result: SearchResult) => {
		navigate(result.path);
		setOpen(false);
		setQuery("");
		setResults([]);
	};

	return (
		<Show when={shouldRender()}>
			{() => (
				<>
					{/* Overlay */}
					<div
						class={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
							isVisible() ? "opacity-100" : "opacity-0"
						}`}
						onClick={() => setOpen(false)}
						aria-label="Close search"
						role="button"
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								setOpen(false);
							}
						}}
					/>

					{/* Search Dialog */}
					<div
						role="dialog"
						aria-modal="true"
						aria-label="Search documentation"
						class={`fixed left-1/2 top-1/2 z-50 w-full max-w-[85vw] lg:max-w-3xl -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
							isVisible() ? "opacity-100 scale-100" : "opacity-0 scale-95"
						}`}
					>
						<div class="mx-6 overflow-hidden rounded-2xl border border-border bg-background/95 backdrop-blur-2xl shadow-2xl">
							{/* Search Input */}
							<div class="relative flex items-center border-b border-border px-6 py-5">
								<iconify-icon
									icon="lucide:search"
									class="mr-4 h-6 w-6 text-primary shrink-0"
								/>
								<input
									type="text"
									placeholder="Search documentation..."
									value={query()}
									onInput={(e) => setQuery(e.currentTarget.value)}
									class="flex-1 bg-transparent text-xl font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none"
									autofocus
									aria-label="Search documentation"
								/>
								<kbd class="hidden sm:inline-flex h-8 select-none items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 font-mono text-xs font-semibold text-muted-foreground">
									ESC
								</kbd>
							</div>

							{/* Empty State */}
							<Show when={query() && results().length === 0}>
								<div class="py-20 px-8 text-center">
									<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
										<iconify-icon
											icon="lucide:search-x"
											class="h-10 w-10 text-muted-foreground"
										/>
									</div>
									<p class="text-lg font-semibold text-foreground mb-2">
										No results for "{query()}"
									</p>
									<p class="text-sm text-muted-foreground">
										Try different keywords or check the spelling
									</p>
								</div>
							</Show>

							<Show when={results().length > 0}>
								<div class="max-h-[600px] overflow-y-auto p-4 space-y-2">
									<For each={results()}>
										{(result, idx) => (
											<button
												onClick={() => handleSelectResult(result)}
												onMouseEnter={() => setSelectedIndex(idx())}
												class={cn(
													"group w-full rounded-xl p-5 text-left transition-all duration-200 cursor-pointer",
													idx() === selectedIndex()
														? "bg-primary/10 shadow-sm ring-2 ring-primary/20"
														: "hover:bg-muted/60 active:scale-[0.99]",
												)}
											>
												<div class="flex items-center gap-4 mb-2">
													<div
														class={cn(
															"flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
															idx() === selectedIndex()
																? "bg-primary text-white"
																: "bg-muted text-muted-foreground",
														)}
													>
														<iconify-icon
															icon="lucide:file-text"
															class="h-5 w-5"
														/>
													</div>
													<div
														class={cn(
															"font-semibold text-lg transition-colors flex-1",
															idx() === selectedIndex()
																? "text-primary"
																: "text-foreground",
														)}
													>
														{result.title}
													</div>
												</div>
												<Show when={result.text}>
													<p class="text-sm text-muted-foreground line-clamp-2 pl-14 leading-relaxed">
														{result.text.slice(0, 150)}
														{result.text.length > 150 ? "..." : ""}
													</p>
												</Show>
											</button>
										)}
									</For>
								</div>
							</Show>

							<Show when={!query() || results().length === 0}>
								<div class="border-t border-border bg-muted/30 px-6 py-5">
									<div class="flex items-center justify-between text-sm font-medium text-muted-foreground">
										<div class="flex items-center gap-6">
											<div class="flex items-center gap-2.5">
												<kbd class="inline-flex h-8 select-none items-center gap-1 rounded-lg border border-border bg-muted/60 px-3 font-mono text-xs font-semibold text-muted-foreground">
													↑↓
												</kbd>
												<span>Navigate</span>
											</div>
											<div class="flex items-center gap-2.5">
												<kbd class="inline-flex h-8 select-none items-center gap-1 rounded-lg border border-border bg-muted/60 px-3 font-mono text-xs font-semibold text-muted-foreground">
													↵
												</kbd>
												<span>Select</span>
											</div>
										</div>
										<div class="flex items-center gap-2.5">
											<kbd class="inline-flex h-8 select-none items-center gap-1 rounded-lg border border-border bg-muted/60 px-3 font-mono text-xs font-semibold text-muted-foreground">
												ESC
											</kbd>
											<span>Close</span>
										</div>
									</div>
								</div>
							</Show>
						</div>
					</div>
				</>
			)}
		</Show>
	);
}
