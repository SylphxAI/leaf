// TEMPORARY: Import Zen functions with type assertions

import type { Zen } from "@sylphx/zen";
import * as ZenModule from "@sylphx/zen";

const zen = ZenModule.zen as <T>(initialValue: T) => Zen<T>;
const get = ZenModule.get as <T>(store: Zen<T>) => T;
const set = ZenModule.set as <T>(store: Zen<T>, value: T) => void;

type Theme = "light" | "dark";

export const themeStore: Zen<Theme> = zen<Theme>("light");

export const toggleTheme = (): void => {
	const current = get(themeStore);
	const newTheme = current === "light" ? "dark" : "light";
	set(themeStore, newTheme);
	document.documentElement.setAttribute("data-theme", newTheme);
	// Persist theme preference to localStorage
	if (typeof window !== "undefined") {
		localStorage.setItem("leaf-theme", newTheme);
	}
};

// Initialize theme from localStorage or system preference
if (typeof window !== "undefined") {
	const stored = localStorage.getItem("leaf-theme") as Theme | null;
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const initial = stored || (prefersDark ? "dark" : "light");
	set(themeStore, initial);
	document.documentElement.setAttribute("data-theme", initial);
}
