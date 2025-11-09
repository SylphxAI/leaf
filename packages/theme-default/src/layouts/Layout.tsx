import { useState, useEffect } from "preact/hooks";
import type { ComponentChildren } from "preact";
import { Header } from "../components/Header";
import { Sidebar } from "../components/Sidebar";
import { TableOfContents, type TocItem } from "../components/TableOfContents";
import { DocFooter, type DocFooterProps } from "../components/DocFooter";
import { Search } from "../components/Search";
import { CopyPage } from "../components/CopyPage";
import { MobileTocToggle } from "../components/MobileTocToggle";
import { Hero, type HeroProps } from "../components/Hero";
import { Features, type Feature } from "../components/Features";
import { cn } from "../lib/utils";
import { initCopyCode } from "../lib/copy-code";

interface LayoutProps {
	config?: any;
	currentRoute?: {
		path: string;
		toc: TocItem[];
		docFooter: DocFooterProps;
		frontmatter?: Record<string, any>;
	} | null;
	children: ComponentChildren;
}

export function Layout({ config, currentRoute, children }: LayoutProps): JSX.Element {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);

	const frontmatter = currentRoute?.frontmatter || {};
	const isHeroLayout = frontmatter.layout === "home";
	const toc = currentRoute?.toc || [];
	const docFooter = currentRoute?.docFooter;

	const hasSidebar = config?.theme?.sidebar && config.theme.sidebar.length > 0;
	const hasToc = toc && toc.length > 0;

	useEffect(() => {
		setSidebarOpen(false);
	}, [currentRoute?.path]);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 768 && sidebarOpen) {
				setSidebarOpen(false);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [sidebarOpen]);

	// Initialize copy code functionality
	useEffect(() => {
		initCopyCode();
	}, []);

	// Hero Layout
	if (isHeroLayout) {
		const hero = frontmatter.hero as HeroProps | undefined;
		const features = (frontmatter.features || []) as Feature[];

		return (
			<div className="min-h-screen bg-background">
				<Header
					title={config?.title}
					nav={config?.theme?.nav}
					socialLinks={config?.theme?.socialLinks}
					onMenuClick={() => setSidebarOpen(!sidebarOpen)}
					onSearchClick={() => setSearchOpen(true)}
				/>
				<Search open={searchOpen} onOpenChange={setSearchOpen} />

				<div className="pt-16">
					{/* Hero Section */}
					{hero && <Hero {...hero} />}

					{/* Features Section */}
					{features.length > 0 && <Features features={features} />}

					{/* Content Section */}
					{children && (
						<div className="border-t border-border">
							<div className="px-8 py-12 md:px-12 md:py-16 lg:px-20 lg:py-20">
								<div className="mx-auto max-w-5xl">
									<div className="prose max-w-none">
										{children}
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Standard Layout
	return (
		<div className="min-h-screen bg-background">
			<Header
				title={config?.title}
				nav={config?.theme?.nav}
				socialLinks={config?.theme?.socialLinks}
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

				<div className={cn("lg:pl-80", !hasSidebar && "lg:pl-0")}>
					<div className={cn(
						"px-8 py-12 md:px-12 md:py-16 lg:px-20 lg:py-20",
						!hasSidebar && !hasToc && "lg:max-w-5xl lg:mx-auto"
					)}>
						<div className="flex gap-16 xl:gap-20">
							<main className="flex-1 min-w-0 relative">
								{/* Floating copy button */}
								<div className="absolute top-0 right-0 z-10">
									<CopyPage title={config?.title} />
								</div>

								<div className="prose max-w-none xl:max-w-3xl">
									{children}
								</div>
								{docFooter && (
									<div className="mt-32 pt-16 border-t-2 border-border/50">
										<DocFooter {...docFooter} />
									</div>
								)}
							</main>

							{hasToc && (
								<aside className="hidden xl:block flex-shrink-0 w-64">
									<TableOfContents items={toc} />
								</aside>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Mobile TOC toggle - only shown on mobile when TOC exists */}
			<MobileTocToggle toc={toc} />
		</div>
	);
}
