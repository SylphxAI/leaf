import type { h } from "preact";
import { useEffect, useState } from "preact/hooks";

interface LayoutProps {
	children: h.JSX.Element | h.JSX.Element[];
	title?: string;
	description?: string;
	sidebar?: any[];
	toc?: any[];
	showSidebar?: boolean;
	showToc?: boolean;
}

export default function Layout({
	children,
	title,
	description,
	sidebar,
	toc,
	showSidebar = true,
	showToc = true,
}: LayoutProps): h.JSX.Element {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	useEffect(() => {
		if (title) {
			document.title = title;
		}
		if (description) {
			const metaDesc = document.querySelector('meta[name="description"]');
			if (metaDesc) {
				metaDesc.setAttribute("content", description);
			}
		}
	}, [title, description]);

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<button
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						</button>
						<h1 className="text-xl font-bold">{title || "Blog"}</h1>
					</div>
					<div className="flex items-center gap-4">
						<button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</button>
						<button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
								/>
							</svg>
						</button>
					</div>
				</div>
			</header>

			<div className="flex">
				{showSidebar && sidebar && (
					<aside
						className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${isSidebarOpen ? "block" : "hidden lg:block"}`}
					>
						<nav className="p-4">
							{sidebar.map((item) => (
								<a
									key={item.link}
									href={item.link}
									className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
								>
									{item.text}
								</a>
							))}
						</nav>
					</aside>
				)}

				<main className="flex-1 max-w-4xl mx-auto px-6 py-8">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						<div className="lg:col-span-2">{children}</div>

						{showToc && toc && toc.length > 0 && (
							<aside className="lg:col-span-1">
								<div className="sticky top-8 bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
									<h3 className="font-semibold mb-3">Table of Contents</h3>
									<nav className="space-y-1">
										{toc.map((item) => (
											<a
												key={item.id}
												href={`#${item.id}`}
												className="block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 py-1"
												style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
											>
												{item.text}
											</a>
										))}
									</nav>
								</div>
							</aside>
						)}
					</div>
				</main>
			</div>

			<footer className="border-t border-gray-200 dark:border-gray-700 mt-16 bg-white dark:bg-gray-800">
				<div className="max-w-7xl mx-auto px-6 py-8">
					<div className="text-center text-gray-600 dark:text-gray-400">
						<p>© 2025 Leaf Theme Blog. Built with Leaf.</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
