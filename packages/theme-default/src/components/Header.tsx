import { Link } from "./Link";
import { useLocation } from "../hooks/useRouter";
import "iconify-icon";
import { ThemeToggle } from "./ThemeToggle";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Button } from "./Button";
import { cn } from "../lib/utils";
import { For } from "solid-js";


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

export function Header(props: HeaderProps) {
	const location = useLocation();

	return (
		<header class="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 shadow-sm">
			<div class="flex h-full items-center px-6 lg:px-8">
				{/* Mobile Menu Button */}
				<Button
					onClick={props.onMenuClick}
					variant="icon"
					class="mr-4 lg:hidden"
					aria-label="Toggle menu"
				>
					<iconify-icon icon="lucide:menu" class="h-5 w-5" />
					<span class="sr-only">Toggle menu</span>
				</Button>

				{/* Logo - Bold Brand */}
				<Link
					to="/"
					class="mr-10 flex items-center gap-3 font-bold transition-all hover:opacity-80 active:scale-95"
				>
					<div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-md">
						<iconify-icon icon="lucide:leaf" class="h-5 w-5" />
					</div>
					<span class="hidden text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent sm:inline-block">
						{props.title || "Leaf"}
					</span>
				</Link>

				{/* Navigation - Modern Pills */}
				<nav class="hidden gap-1.5 md:flex flex-1" aria-label="Main navigation">
					<For each={props.nav || []}>
						{(item) => {
							const isActive = location.pathname.startsWith(item.link);
							return (
								<Link
									to={item.link}
									class={cn(
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
						}}
					</For>
				</nav>

				{/* Actions */}
				<div class="flex items-center gap-2 ml-auto">
					<Button
						onClick={props.onSearchClick}
						variant="default"
						aria-label="Search documentation"
					>
						<iconify-icon icon="lucide:search" class="h-4 w-4" />
						<span class="hidden sm:inline font-semibold">Search</span>
						<kbd class="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded-md border border-border bg-background px-1.5 font-mono text-[10px] font-semibold shadow-sm">
							⌘K
						</kbd>
					</Button>

					{/* Social Links */}
					<For each={props.socialLinks || []}>
						{(social) => (
							<a
								href={social.link}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground transition-all hover:text-foreground hover:bg-muted/60 active:scale-95"
								aria-label={`${social.icon} link`}
							>
								<iconify-icon icon={iconMap[social.icon]} class="h-5 w-5" />
							</a>
						)}
					</For>

					<ThemeSwitcher />
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
