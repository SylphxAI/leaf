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
		<div className="flex min-h-screen flex-col">
			<Header
				title={config?.title}
				nav={config?.theme?.nav}
				onMenuClick={() => setSidebarOpen(!sidebarOpen)}
			/>
			<Search />

			<div className="flex flex-1">
				<Sidebar
					items={config?.theme?.sidebar}
					open={sidebarOpen}
					onClose={() => setSidebarOpen(false)}
				/>

				<div className="flex flex-1 flex-col lg:ml-64">
					<div className="flex flex-1 gap-12 px-6 md:px-8 lg:px-12">
						<main className="flex-1 max-w-4xl mx-auto w-full">
							<article className="py-12 md:py-16">
								<div className="prose">
									<Outlet />
								</div>
								{docFooter && <DocFooter {...docFooter} />}
							</article>
						</main>

						{toc && toc.length > 0 && (
							<aside className="hidden xl:block">
								<TableOfContents items={toc} />
							</aside>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
