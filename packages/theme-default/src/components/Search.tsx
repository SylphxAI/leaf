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

interface SearchProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function Search({ open: controlledOpen, onOpenChange }: SearchProps = {}): JSX.Element {
	const [internalOpen, setInternalOpen] = useState(false);
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setOpen = onOpenChange || setInternalOpen;
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [searchIndex, setSearchIndex] = useState<MiniSearch | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);
	const navigate = useNavigate();

	// Handle animation on open/close
	useEffect(() => {
		if (open) {
			setShouldRender(true);
			// Use setTimeout with longer delay to ensure DOM is rendered and browser applies initial state
			const timer = setTimeout(() => {
				setIsVisible(true);
			}, 50);
			return () => clearTimeout(timer);
		} else {
			setIsVisible(false);
			const timer = setTimeout(() => {
				setShouldRender(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	// Load search index
	useEffect(() => {
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

	if (!shouldRender) return null;

	return (
		<>
			{/* Overlay */}
			<div
				className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
					isVisible ? "opacity-100" : "opacity-0"
				}`}
				onClick={() => setOpen(false)}
			/>

			{/* Search Dialog */}
			<div
				className={`fixed left-1/2 top-1/2 z-50 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
					isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
				}`}
			>
				<div className="mx-6 overflow-hidden rounded-3xl border border-border/60 bg-background/98 backdrop-blur-2xl shadow-2xl">
					{/* Search Input - Much Larger */}
					<div className="relative flex items-center border-b border-border/60 px-8 py-6">
						<div
							className="mr-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
							style={{
								background:
									"linear-gradient(135deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
							}}
						>
							<Icon icon="lucide:search" className="h-7 w-7" />
						</div>
						<input
							type="text"
							placeholder="Search documentation..."
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="flex-1 bg-transparent text-xl font-medium placeholder:text-muted-foreground focus:outline-none"
							autoFocus
						/>
						<kbd className="hidden sm:inline-flex h-8 select-none items-center gap-1.5 rounded-lg border border-border/60 bg-muted/60 px-3 font-mono text-sm font-medium transition-all hover:border-border hover:bg-muted">
							ESC
						</kbd>
					</div>

					{/* Empty State - Larger */}
					{query && results.length === 0 ? (
						<div className="py-32 px-8 text-center">
							<div
								className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-muted/50"
								style={{
									background:
										"linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted) / 0.5) 100%)",
								}}
							>
								<Icon icon="lucide:search-x" className="h-12 w-12 text-muted-foreground/60" />
							</div>
							<p className="text-lg font-semibold text-muted-foreground">
								No results for "{query}"
							</p>
							<p className="mt-3 text-sm text-muted-foreground/70">
								Try different keywords or check the spelling
							</p>
						</div>
					) : results.length > 0 ? (
						<div className="max-h-[600px] overflow-y-auto p-4 space-y-2">
							{results.map((result, idx) => (
								<button
									key={result.id}
									onClick={() => handleSelectResult(result)}
									onMouseEnter={() => setSelectedIndex(idx)}
									className={cn(
										"group w-full rounded-2xl p-6 text-left transition-all duration-200 cursor-pointer",
										idx === selectedIndex
											? "bg-primary/10 shadow-md ring-2 ring-primary/20"
											: "hover:bg-accent/60 active:scale-[0.99]"
									)}
								>
									<div className="flex items-center gap-4 mb-3">
										<div
											className={cn(
												"flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 shadow-sm",
												idx === selectedIndex ? "text-white scale-110" : "text-primary"
											)}
											style={
												idx === selectedIndex
													? {
															background:
																"linear-gradient(135deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
													  }
													: { background: "hsl(var(--muted))" }
											}
										>
											<Icon icon="lucide:file-text" className="h-5 w-5" />
										</div>
										<div
											className={cn(
												"font-bold text-lg transition-colors",
												idx === selectedIndex ? "text-primary" : "text-foreground"
											)}
										>
											{result.title}
										</div>
									</div>
									{result.text && (
										<p className="text-base text-muted-foreground line-clamp-2 pl-14 leading-relaxed">
											{result.text.slice(0, 150)}
											{result.text.length > 150 ? "..." : ""}
										</p>
									)}
								</button>
							))}
						</div>
					) : (
						<div className="border-t border-border/60 bg-muted/30 px-8 py-5 backdrop-blur-sm">
							<div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
								<div className="flex items-center gap-8">
									<div className="flex items-center gap-3">
										<kbd className="inline-flex h-7 select-none items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2.5 font-mono text-xs font-semibold">
											↑↓
										</kbd>
										<span>Navigate</span>
									</div>
									<div className="flex items-center gap-3">
										<kbd className="inline-flex h-7 select-none items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2.5 font-mono text-xs font-semibold">
											↵
										</kbd>
										<span>Select</span>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<kbd className="inline-flex h-7 select-none items-center gap-1 rounded-md border border-border/60 bg-background/60 px-2.5 font-mono text-xs font-semibold">
										ESC
									</kbd>
									<span>Close</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}
