// ASSUMPTION: JSX automatic runtime via Preact preset
import { Link } from "./Link";
import { useLocation } from "../hooks/useRouter";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "../lib/utils";

interface HeaderProps {
	title?: string;
	nav?: Array<{ text: string; link: string }>;
	onMenuClick?: () => void;
	onSearchClick?: () => void;
}

export function Header({
	title = "Leaf",
	nav = [],
	onMenuClick,
	onSearchClick,
}: HeaderProps): JSX.Element {
	const location = useLocation();

	return (
		<header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-full items-center px-4 lg:px-8">
				{/* Mobile Menu Button */}
				<button
					onClick={onMenuClick}
					className="mr-4 inline-flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-all duration-200 hover:bg-accent/50 hover:text-foreground active:scale-95 lg:hidden"
					aria-label="Toggle menu"
				>
					<Icon icon="lucide:menu" className="h-5 w-5" />
					<span className="sr-only">Toggle menu</span>
				</button>

				{/* Logo with VitePress-style gradient */}
				<Link
					to="/"
					className="mr-8 flex items-center gap-3 font-bold transition-all duration-200 hover:opacity-80 active:scale-95"
				>
					<div
						className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
						style={{
							background:
								"linear-gradient(135deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
						}}
					>
						<Icon icon="lucide:leaf" className="h-5 w-5" />
					</div>
					<span
						className="hidden text-lg font-bold sm:inline-block bg-clip-text text-transparent"
						style={{
							backgroundImage:
								"linear-gradient(135deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))",
						}}
					>
						{title}
					</span>
				</Link>

				{/* Navigation with refined active state */}
				<nav className="hidden gap-0.5 md:flex flex-1" aria-label="Main navigation">
					{nav.map((item) => {
						const isActive = location.pathname.startsWith(item.link);
						return (
							<Link
								key={item.link}
								to={item.link}
								className={cn(
									"relative inline-flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
									isActive
										? "text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-accent/50"
								)}
								aria-current={isActive ? "page" : undefined}
							>
								{item.text}
								{isActive && (
									<span
										className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-3/4 rounded-full transition-all duration-300"
										style={{
											background:
												"linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
										}}
									/>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Actions with modern search box */}
				<div className="flex items-center gap-3 ml-auto">
					<button
						onClick={onSearchClick}
						className="group inline-flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/50 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-muted hover:text-foreground hover:shadow-md active:scale-95"
						aria-label="Search documentation"
					>
						<Icon
							icon="lucide:search"
							className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
						/>
						<span className="hidden sm:inline font-medium">Search</span>
						<kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-background/50 px-1.5 font-mono text-[10px] font-medium transition-all duration-200 group-hover:border-border group-hover:bg-background">
							<span className="text-xs">⌘</span>K
						</kbd>
					</button>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
