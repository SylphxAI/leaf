import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as Dialog from "@radix-ui/react-dialog";
import { Icon } from "@iconify/react";
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

export function Search(): JSX.Element {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [searchIndex, setSearchIndex] = useState<MiniSearch | null>(null);
	const navigate = useNavigate();

	// Load search index
	useEffect(() => {
		fetch("/search-index.json")
			.then((res) => res.json())
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
				console.error("Failed to load search index:", err);
			});
	}, []);

	// Handle keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Cmd/Ctrl + K to open search
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setOpen(true);
				setQuery("");
				setSelectedIndex(0);
			}

			if (!open) return;

			// Esc to close
			if (e.key === "Escape") {
				setOpen(false);
				setQuery("");
				setResults([]);
			}

			// Arrow navigation
			if (results.length > 0) {
				if (e.key === "ArrowDown") {
					e.preventDefault();
					setSelectedIndex((prev) => (prev + 1) % results.length);
				} else if (e.key === "ArrowUp") {
					e.preventDefault();
					setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
				} else if (e.key === "Enter") {
					e.preventDefault();
					if (results[selectedIndex]) {
						handleSelectResult(results[selectedIndex]);
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, results, selectedIndex]);

	// Perform search
	useEffect(() => {
		if (!searchIndex || !query.trim()) {
			setResults([]);
			setSelectedIndex(0);
			return;
		}

		const searchResults = searchIndex.search(query, {
			limit: 10,
		}) as SearchResult[];

		setResults(searchResults);
		setSelectedIndex(0);
	}, [query, searchIndex]);

	const handleSelectResult = (result: SearchResult) => {
		navigate(result.path);
		setOpen(false);
		setQuery("");
		setResults([]);
	};

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-lg data-[state=open]:animate-fade-in" />
				<Dialog.Content className="fixed left-[50%] top-[15%] z-50 w-full max-w-2xl translate-x-[-50%] animate-slide-in-from-top">
					<div
						className="mx-4 overflow-hidden rounded-2xl border border-border/50 bg-popover/95 backdrop-blur-xl"
						style={{ boxShadow: "var(--shadow-lg)" }}
					>
						{/* Search Input with gradient accent */}
						<div className="relative flex items-center border-b border-border/50 px-5 py-4">
							<div
								className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
								style={{
									background:
										"linear-gradient(135deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
								}}
							>
								<Icon icon="lucide:search" className="h-4 w-4" />
							</div>
							<input
								type="text"
								placeholder="Search documentation..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="flex-1 bg-transparent text-base font-medium placeholder:text-muted-foreground focus:outline-none"
								autoFocus
							/>
							<kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded-md border border-border/50 bg-muted/50 px-2 font-mono text-xs font-medium transition-all hover:border-border hover:bg-muted">
								ESC
							</kbd>
						</div>

						{/* Results with refined design */}
						{query && results.length === 0 ? (
							<div className="py-20 px-6 text-center">
								<div
									className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50"
									style={{
										background:
											"linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 100%)",
									}}
								>
									<Icon icon="lucide:search-x" className="h-8 w-8 text-muted-foreground/60" />
								</div>
								<p className="text-sm font-medium text-muted-foreground">
									No results for "{query}"
								</p>
								<p className="mt-2 text-xs text-muted-foreground/70">
									Try different keywords or check the spelling
								</p>
							</div>
						) : results.length > 0 ? (
							<div className="max-h-[420px] overflow-y-auto p-3 space-y-1">
								{results.map((result, idx) => (
									<button
										key={result.id}
										onClick={() => handleSelectResult(result)}
										onMouseEnter={() => setSelectedIndex(idx)}
										className={cn(
											"group w-full rounded-xl p-4 text-left transition-all duration-200 cursor-pointer",
											idx === selectedIndex
												? "bg-primary/10 shadow-sm"
												: "hover:bg-accent/50 active:scale-[0.98]"
										)}
									>
										<div className="flex items-center gap-2.5 mb-2">
											<div
												className={cn(
													"flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-200",
													idx === selectedIndex ? "text-white" : "text-primary"
												)}
												style={
													idx === selectedIndex
														? {
																background:
																	"linear-gradient(135deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
														  }
														: {}
												}
											>
												<Icon icon="lucide:file-text" className="h-3.5 w-3.5" />
											</div>
											<div
												className={cn(
													"font-semibold text-sm transition-colors",
													idx === selectedIndex ? "text-primary" : "text-foreground"
												)}
											>
												{result.title}
											</div>
										</div>
										{result.text && (
											<p className="text-sm text-muted-foreground line-clamp-2 pl-8">
												{result.text.slice(0, 120)}
												{result.text.length > 120 ? "..." : ""}
											</p>
										)}
									</button>
								))}
							</div>
						) : null}

						{/* Footer with refined keyboard shortcuts */}
						{!query && (
							<div className="border-t border-border/50 bg-muted/20 px-5 py-3.5 backdrop-blur-sm">
								<div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
									<div className="flex items-center gap-5">
										<div className="flex items-center gap-2">
											<kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-background/50 px-1.5 font-mono text-[10px] font-medium">
												↑↓
											</kbd>
											<span>Navigate</span>
										</div>
										<div className="flex items-center gap-2">
											<kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-background/50 px-1.5 font-mono text-[10px] font-medium">
												↵
											</kbd>
											<span>Select</span>
										</div>
									</div>
									<div className="flex items-center gap-2">
										<kbd className="inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-background/50 px-1.5 font-mono text-[10px] font-medium">
											ESC
										</kbd>
										<span>Close</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
