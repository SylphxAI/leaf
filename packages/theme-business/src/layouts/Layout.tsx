import { Header, Sidebar, TableOfContents } from "@sylphx/leaf-theme-default";
import type { h } from "preact";

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
	return (
		<div className="min-h-screen bg-gray-50">
			<Header
				title={title}
				description={description}
				className="bg-white border-b-2 border-blue-600 shadow-sm"
			/>

			<div className="flex">
				{showSidebar && sidebar && (
					<Sidebar
						items={sidebar}
						className="bg-white border-r border-gray-200"
					/>
				)}

				<main className="flex-1 max-w-6xl mx-auto px-8 py-12">
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
						<div className={`${showToc ? "lg:col-span-3" : "lg:col-span-4"}`}>
							{children}
						</div>

						{showToc && toc && toc.length > 0 && (
							<aside className="lg:col-span-1">
								<div className="sticky top-24 bg-white rounded-lg border border-gray-200 p-6">
									<h3 className="text-lg font-semibold text-gray-900 mb-4">
										On this page
									</h3>
									<TableOfContents items={toc} />
								</div>
							</aside>
						)}
					</div>
				</main>
			</div>

			<footer className="bg-gray-800 text-white mt-16">
				<div className="max-w-7xl mx-auto px-8 py-8">
					<div className="text-center">
						<p className="text-gray-300">
							© 2025 Leaf Business Theme. Professional documentation solution.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
