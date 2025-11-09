// ASSUMPTION: JSX automatic runtime via Preact preset
import { Link } from "./Link";
import { useLocation } from "../hooks/useRouter";
import { Icon } from "@iconify/react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./Button";
import { cn } from "../lib/utils";

interface SocialLink {
	icon: "github" | "twitter" | "discord" | "npm";
	link: string;
}

interface HeaderProps {
	title?: string;
	nav?: Array<{ text: string; link: string }>;
	socialLinks?: SocialLink[];
	onMenuClick?: () => void;
	onSearchClick?: () => void;
}

const iconMap = {
	github: "lucide:github",
	twitter: "lucide:twitter",
	discord: "simple-icons:discord",
	npm: "simple-icons:npm",
};

export function Header({
	title = "Leaf",
	nav = [],
	socialLinks = [],
	onMenuClick,
	onSearchClick,
}: HeaderProps): JSX.Element {
	const location = useLocation();

	return (
		<header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 shadow-sm">
			<div className="flex h-full items-center px-6 lg:px-8">
				{/* Mobile Menu Button */}
				<Button
					onClick={onMenuClick}
					variant="icon"
					className="mr-4 lg:hidden"
					aria-label="Toggle menu"
				>
					<Icon icon="lucide:menu" className="h-5 w-5" />
					<span className="sr-only">Toggle menu</span>
				</Button>

				{/* Logo - Bold Brand */}
				<Link
					to="/"
					className="mr-10 flex items-center gap-3 font-bold transition-all hover:opacity-80 active:scale-95"
				>
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-md">
						<Icon icon="lucide:leaf" className="h-5 w-5" />
					</div>
					<span className="hidden text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent sm:inline-block">
						{title}
					</span>
				</Link>

				{/* Navigation - Modern Pills */}
				<nav className="hidden gap-1.5 md:flex flex-1" aria-label="Main navigation">
					{nav.map((item) => {
						const isActive = location.pathname.startsWith(item.link);
						return (
							<Link
								key={item.link}
								to={item.link}
								className={cn(
									"relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all rounded-lg",
									isActive
										? "text-primary-foreground bg-primary shadow-sm"
										: "text-muted-foreground hover:text-foreground hover:bg-muted/60"
								)}
								aria-current={isActive ? "page" : undefined}
							>
								{item.text}
							</Link>
						);
					})}
				</nav>

				{/* Actions */}
				<div className="flex items-center gap-2 ml-auto">
					<Button
						onClick={onSearchClick}
						variant="default"
						aria-label="Search documentation"
					>
						<Icon icon="lucide:search" className="h-4 w-4" />
						<span className="hidden sm:inline font-semibold">Search</span>
						<kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded-md border border-border bg-background px-1.5 font-mono text-[10px] font-semibold shadow-sm">
							⌘K
						</kbd>
					</Button>

					{/* Social Links */}
					{socialLinks.length > 0 && (
						<div className="flex items-center gap-2">
							{socialLinks.map((social) => (
								<a
									key={social.link}
									href={social.link}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground transition-all hover:text-foreground hover:bg-muted/60 active:scale-95"
									aria-label={`${social.icon} link`}
								>
									<Icon icon={iconMap[social.icon]} className="h-5 w-5" />
								</a>
							))}
						</div>
					)}

					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
