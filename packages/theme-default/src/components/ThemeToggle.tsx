import "iconify-icon";
import { useStore } from "../hooks/useStore";
import { themeStore, toggleTheme } from "../store/theme";
import { Button } from "./Button";

export function ThemeToggle(): JSX.Element {
	const theme = useStore(themeStore);

	return (
		<Button
			variant="icon"
			onClick={toggleTheme}
			aria-label={`Toggle theme (current: ${theme()})`}
			aria-pressed={theme() === "dark"}
		>
			<iconify-icon
				icon={theme() === "light" ? "lucide:moon" : "lucide:sun"}
				class="h-5 w-5"
			/>
		</Button>
	);
}
