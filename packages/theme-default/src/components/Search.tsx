import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MiniSearch from "minisearch";

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
	const [isOpen, setIsOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [searchIndex, setSearchIndex] = useState<MiniSearch | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
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
				setIsOpen(true);
				setQuery("");
				setSelectedIndex(0);
			}

			// Esc to close
			if (e.key === "Escape" && isOpen) {
				setIsOpen(false);
				setQuery("");
				setResults([]);
			}

			// Arrow navigation
			if (isOpen && results.length > 0) {
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
	}, [isOpen, results, selectedIndex]);

	// Focus input when opened
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

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
		setIsOpen(false);
		setQuery("");
		setResults([]);
	};

	if (!isOpen) {
		return (
			<button className="search-button" onClick={() => setIsOpen(true)}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<span>Search</span>
				<kbd className="search-hotkey">
					<span className="search-hotkey-text">⌘K</span>
				</kbd>
			</button>
		);
	}

	return (
		<div className="search-modal">
			<div className="search-backdrop" onClick={() => setIsOpen(false)} />
			<div className="search-container">
				<div className="search-input-wrapper">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="search-icon"
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.35-4.35" />
					</svg>
					<input
						ref={inputRef}
						type="text"
						className="search-input"
						placeholder="Search documentation..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
					<button className="search-close" onClick={() => setIsOpen(false)}>
						<span>Esc</span>
					</button>
				</div>

				{query && results.length === 0 && (
					<div className="search-no-results">
						<p>No results for "{query}"</p>
					</div>
				)}

				{results.length > 0 && (
					<div className="search-results">
						{results.map((result, idx) => (
							<button
								key={result.id}
								className={`search-result-item ${idx === selectedIndex ? "selected" : ""}`}
								onClick={() => handleSelectResult(result)}
								onMouseEnter={() => setSelectedIndex(idx)}
							>
								<div className="search-result-title">{result.title}</div>
								{result.text && (
									<div className="search-result-text">
										{result.text.slice(0, 120)}
										{result.text.length > 120 ? "..." : ""}
									</div>
								)}
							</button>
						))}
					</div>
				)}

				{!query && (
					<div className="search-footer">
						<div className="search-commands">
							<div className="search-command">
								<kbd>↑↓</kbd>
								<span>Navigate</span>
							</div>
							<div className="search-command">
								<kbd>Enter</kbd>
								<span>Select</span>
							</div>
							<div className="search-command">
								<kbd>Esc</kbd>
								<span>Close</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
