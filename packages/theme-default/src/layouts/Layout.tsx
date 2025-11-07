import React, { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { TableOfContents, type TocItem } from "../components/TableOfContents";
import { SidebarToggle } from "../components/SidebarToggle";
import { DocFooter, type DocFooterProps } from "../components/DocFooter";
import { Search } from "../components/Search";

interface LayoutProps {
	config?: any;
}

interface OutletContext {
	toc?: TocItem[];
	docFooter?: DocFooterProps;
}

export function Layout({ config }: LayoutProps): JSX.Element {
	const context = useOutletContext<OutletContext>();
	const [sidebarOpen, setSidebarOpen] = useState(false);

	React.useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 768 && sidebarOpen) {
				setSidebarOpen(false);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [sidebarOpen]);

	React.useEffect(() => {
		setSidebarOpen(false);
	}, [context]);

	return (
		<div className="layout">
			<Header title={config?.title} nav={config?.theme?.nav}>
				<SidebarToggle open={sidebarOpen} onClick={() => setSidebarOpen(!sidebarOpen)} />
			</Header>
			<Search />
			<div className="layout-content">
				<Sidebar
					items={config?.theme?.sidebar}
					open={sidebarOpen}
					onClose={() => setSidebarOpen(false)}
				/>
				<main className="main-content">
					<div className="doc-content">
						<Outlet />
						{context?.docFooter && <DocFooter {...context.docFooter} />}
					</div>
				</main>
				{context?.toc && context.toc.length > 0 && (
					<aside className="toc-aside">
						<TableOfContents items={context.toc} />
					</aside>
				)}
			</div>
		</div>
	);
}
