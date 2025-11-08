import React, { useState, useEffect } from "react";
import { Outlet, useMatches, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { TableOfContents, type TocItem } from "../components/TableOfContents";
import { DocFooter, type DocFooterProps } from "../components/DocFooter";
import { Search } from "../components/Search";
import { cn } from "../lib/utils";

interface LayoutProps {
	config?: any;
}

export function Layout({ config }: LayoutProps): JSX.Element {
	const matches = useMatches();
	const location = useLocation();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const currentMatch = matches[matches.length - 1];
	const handle = (currentMatch?.handle as any) || {};
	const toc = handle.toc || [];
	const docFooter = handle.docFooter;

	useEffect(() => {
		setSidebarOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 768 && sidebarOpen) {
				setSidebarOpen(false);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [sidebarOpen]);

	return (
		<div className="min-h-screen bg-background">
			<Header
				title={config?.title}
				nav={config?.theme?.nav}
				onMenuClick={() => setSidebarOpen(!sidebarOpen)}
			/>
			<Search />

			<div className="pt-16">
				<Sidebar
					items={config?.theme?.sidebar}
					open={sidebarOpen}
					onClose={() => setSidebarOpen(false)}
				/>

				{/* VitePress-style layout: fixed sidebar + centered content container */}
				<div className="lg:pl-64">
					<div className="mx-auto px-6 py-8" style={{ maxWidth: '1440px' }}>
						<div className="flex gap-8 xl:gap-12">
							{/* Main content - fixed width for stability */}
							<main className="flex-1 min-w-0" style={{ maxWidth: toc && toc.length > 0 ? 'calc(100% - 16rem)' : '100%' }}>
								<article className="mx-auto" style={{ maxWidth: '48rem' }}>
									<div className="prose prose-slate dark:prose-invert max-w-none">
										<Outlet />
									</div>
									{docFooter && (
										<div className="mt-16 pt-8 border-t border-border/40">
											<DocFooter {...docFooter} />
										</div>
									)}
								</article>
							</main>

							{/* TOC - fixed width, always reserves space */}
							<aside className="hidden xl:block flex-shrink-0" style={{ width: '14rem' }}>
								{toc && toc.length > 0 && <TableOfContents items={toc} />}
							</aside>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
