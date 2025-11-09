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
		<header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
			<div className="flex h-full items-center px-6 lg:px-8">
				{/* Mobile Menu Button */}
				<button
					onClick={onMenuClick}
					className="mr-4 inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
					aria-label="Toggle menu"
				>
					<Icon icon="lucide:menu" className="h-5 w-5" />
					<span className="sr-only">Toggle menu</span>
				</button>

				{/* Logo - Clean and Simple */}
				<Link
					to="/"
					className="mr-10 flex items-center gap-2.5 font-semibold transition-opacity hover:opacity-70"
				>
					<Icon icon="lucide:leaf" className="h-5 w-5 text-primary" />
					<span className="hidden text-base font-semibold text-foreground sm:inline-block">
						{title}
					</span>
				</Link>

				{/* Navigation - Minimal Design */}
				<nav className="hidden gap-1 md:flex flex-1" aria-label="Main navigation">
					{nav.map((item) => {
						const isActive = location.pathname.startsWith(item.link);
						return (
							<Link
								key={item.link}
								to={item.link}
								className={cn(
									"inline-flex items-center px-3 py-1.5 text-sm font-medium transition-colors rounded-md",
									isActive
										? "text-foreground bg-muted"
										: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
								)}
								aria-current={isActive ? "page" : undefined}
							>
								{item.text}
							</Link>
						);
					})}
				</nav>

				{/* Actions - Simple and Clean */}
				<div className="flex items-center gap-2 ml-auto">
					<button
						onClick={onSearchClick}
						className="group inline-flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						aria-label="Search documentation"
					>
						<Icon icon="lucide:search" className="h-4 w-4" />
						<span className="hidden sm:inline font-medium">Search</span>
						<kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border/60 bg-background px-1.5 font-mono text-[10px] font-medium">
							⌘K
						</kbd>
					</button>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
