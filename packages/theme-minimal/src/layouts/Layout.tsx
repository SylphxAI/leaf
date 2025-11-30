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
		<div className="min-h-screen bg-white text-gray-900">
			<Header
				title={title}
				description={description}
				className="bg-white border-b border-gray-200"
			/>

			<div className="flex">
				{showSidebar && sidebar && (
					<Sidebar
						items={sidebar}
						className="bg-gray-50 border-r border-gray-200"
					/>
				)}

				<main className="flex-1 max-w-4xl mx-auto px-6 py-12">
					<article className="prose prose-lg max-w-none">{children}</article>
				</main>

				{showToc && toc && toc.length > 0 && (
					<aside className="w-64 hidden xl:block">
						<div className="sticky top-24 p-6">
							<TableOfContents items={toc} />
						</div>
					</aside>
				)}
			</div>

			<footer className="border-t border-gray-200 mt-16">
				<div className="max-w-4xl mx-auto px-6 py-8 text-center">
					<p className="text-gray-600">
						© 2025 Leaf Minimal Theme. Less is more.
					</p>
				</div>
			</footer>
		</div>
	);
}
