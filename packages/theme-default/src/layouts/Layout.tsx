import { createSignal, createEffect, onCleanup, JSX, ParentComponent, children } from "solid-js";
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
import "../styles/theme-variables.css";

interface LayoutProps {
	config?: any;
	currentRoute?: {
		path: string;
		toc: TocItem[];
		docFooter: DocFooterProps;
		frontmatter?: Record<string, any>;
	} | null;
}

export const Layout: ParentComponent<LayoutProps> = (props) => {
	const [sidebarOpen, setSidebarOpen] = createSignal(false);
	const [searchOpen, setSearchOpen] = createSignal(false);

	const c = children(() => props.children);

	const handleSearchClick = () => {
		setSearchOpen(true);
	};

	const handleMenuClick = () => {
		setSidebarOpen(!sidebarOpen());
	};

	const frontmatter = () => props.currentRoute?.frontmatter || {};
	const isHeroLayout = () => frontmatter().layout === "home";
	const toc = () => props.currentRoute?.toc || [];
	const docFooter = () => props.currentRoute?.docFooter;

	const hasSidebar = () => props.config?.theme?.sidebar && props.config.theme.sidebar.length > 0;
	const hasToc = () => toc() && toc().length > 0;

	createEffect(() => {
		const path = props.currentRoute?.path;
		setSidebarOpen(false);
	});

	createEffect(() => {
		const handleResize = () => {
			if (window.innerWidth > 768 && sidebarOpen()) {
				setSidebarOpen(false);
			}
		};

		window.addEventListener("resize", handleResize);
		onCleanup(() => window.removeEventListener("resize", handleResize));
	});

	// Initialize copy code functionality
	createEffect(() => {
		initCopyCode();
	});

	return (
		<>
			{isHeroLayout() ? (
				<div class="min-h-screen bg-background">
					<Header
						title={props.config?.title}
						nav={props.config?.theme?.nav}
						socialLinks={props.config?.theme?.socialLinks}
						onMenuClick={handleMenuClick}
						onSearchClick={handleSearchClick}
					/>
					<Search open={searchOpen()} onOpenChange={setSearchOpen} />

					<div class="pt-16">
						{/* Hero Section */}
						{frontmatter().hero && <Hero {...(frontmatter().hero as HeroProps)} />}

						{/* Features Section */}
						{(frontmatter().features || []).length > 0 && <Features features={frontmatter().features as Feature[]} />}

						{/* Content Section */}
						{c() && (
							<div class="border-t border-border">
								<div class="px-8 py-12 md:px-12 md:py-16 lg:px-20 lg:py-20">
									<div class="mx-auto max-w-5xl">
										<div class="prose max-w-none">
											{c()}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			) : (
				<div class="min-h-screen bg-background">
					<Header
						title={props.config?.title}
						nav={props.config?.theme?.nav}
						socialLinks={props.config?.theme?.socialLinks}
						onMenuClick={handleMenuClick}
						onSearchClick={handleSearchClick}
					/>
					<Search open={searchOpen()} onOpenChange={setSearchOpen} />

					<div class="pt-16">
						<Sidebar
							items={props.config?.theme?.sidebar}
							open={sidebarOpen()}
							onClose={() => setSidebarOpen(false)}
						/>

						<div class={cn("lg:pl-80", !hasSidebar() && "lg:pl-0")}>
							<div class={cn(
								"px-8 py-12 md:px-12 md:py-16 lg:px-20 lg:py-20",
								!hasSidebar() && !hasToc() && "lg:max-w-5xl lg:mx-auto"
							)}>
								<div class="flex gap-16 xl:gap-20">
									<main class="flex-1 min-w-0 relative">
										{/* Floating copy button */}
										<div class="absolute top-0 right-0 z-10">
											<CopyPage title={props.config?.title} />
										</div>

										<div class="prose max-w-none xl:max-w-3xl">
											{c()}
										</div>
										{docFooter() && (
											<div class="mt-32 pt-16 border-t-2 border-border/50">
												<DocFooter {...docFooter()!} />
											</div>
										)}
									</main>

									{hasToc() && (
										<aside class="hidden xl:block flex-shrink-0 w-64">
											<TableOfContents items={toc()} />
										</aside>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* Mobile TOC toggle - only shown on mobile when TOC exists */}
					<MobileTocToggle toc={toc()} />
				</div>
			)}
		</>
	);
};
