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
	const [searchOpen, setSearchOpen] = useState(false);

	const currentMatch = matches[matches.length - 1];
	const handle = (currentMatch?.handle as any) || {};
	const toc = handle.toc || [];
	const docFooter = handle.docFooter;

	const hasSidebar = config?.theme?.sidebar && config.theme.sidebar.length > 0;
	const hasToc = toc && toc.length > 0;

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
				onSearchClick={() => setSearchOpen(true)}
			/>
			<Search open={searchOpen} onOpenChange={setSearchOpen} />

			<div className="pt-16">
				<Sidebar
					items={config?.theme?.sidebar}
					open={sidebarOpen}
					onClose={() => setSidebarOpen(false)}
				/>

				{/* VitePress-style layout: responsive centering */}
				<div className={cn("lg:pl-64", !hasSidebar && "lg:pl-0")}>
					<div className="px-6 py-8">
						<div className={cn(
							"flex gap-8 xl:gap-12",
							!hasSidebar && !hasToc && "justify-center"
						)}>
							{/* Main content - centered when TOC is missing */}
							<main className={cn(
								"flex-1 min-w-0",
								!hasToc && "mx-auto"
							)} style={{ maxWidth: hasToc ? 'calc(100% - 16rem)' : '48rem' }}>
								<article className={cn(
									"mx-auto",
									!hasSidebar && !hasToc && "max-w-4xl"
								)} style={{ maxWidth: hasToc ? '48rem' : undefined }}>
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

							{/* TOC - only render when items exist */}
							{hasToc && (
								<aside className="hidden xl:block flex-shrink-0" style={{ width: '14rem' }}>
									<TableOfContents items={toc} />
								</aside>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
