import { Outlet, useOutletContext } from "react-router-dom";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { TableOfContents, type TocItem } from "../components/TableOfContents";

interface LayoutProps {
	config?: any;
}

interface OutletContext {
	toc?: TocItem[];
}

export function Layout({ config }: LayoutProps) {
	const context = useOutletContext<OutletContext>();

	return (
		<div className="layout">
			<Header title={config?.title} nav={config?.theme?.nav} />
			<div className="layout-content">
				<Sidebar items={config?.theme?.sidebar} />
				<main className="main-content">
					<div className="doc-content">
						<Outlet />
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
