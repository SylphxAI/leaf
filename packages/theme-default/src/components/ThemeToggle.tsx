import { Icon } from "@iconify/react";
import { useStore } from "../hooks/useStore";
import { themeStore, toggleTheme } from "../store/theme";

export function ThemeToggle(): JSX.Element {
	const theme = useStore(themeStore);

	return (
		<button
			type="button"
			className="inline-flex items-center justify-center rounded-lg border border-input bg-background p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
			onClick={toggleTheme}
			aria-label="Toggle theme"
		>
			<Icon
				icon={theme === "light" ? "lucide:moon" : "lucide:sun"}
				className="h-5 w-5"
			/>
		</button>
	);
}
