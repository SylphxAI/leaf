export interface Theme {
	id: string;
	name: string;
	description: string;
	package: string;
	styles: string[];
	config?: Record<string, any>;
}

export class ThemeManager {
	private static instance: ThemeManager;
	private themes: Map<string, Theme> = new Map();
	private currentTheme: string = "default";

	private constructor() {}

	static getInstance(): ThemeManager {
		if (!ThemeManager.instance) {
			ThemeManager.instance = new ThemeManager();
		}
		return ThemeManager.instance;
	}

	registerTheme(theme: Theme): void {
		this.themes.set(theme.id, theme);
	}

	getTheme(id: string): Theme | undefined {
		return this.themes.get(id);
	}

	getAllThemes(): Theme[] {
		return Array.from(this.themes.values());
	}

	setCurrentTheme(themeId: string): void {
		const theme = this.themes.get(themeId);
		if (!theme) {
			throw new Error(`Theme ${themeId} not found`);
		}
		this.currentTheme = themeId;
		this.applyTheme(theme);
	}

	getCurrentTheme(): Theme {
		const theme = this.themes.get(this.currentTheme);
		if (!theme) {
			throw new Error(`Current theme ${this.currentTheme} not found`);
		}
		return theme;
	}

	private applyTheme(theme: Theme) {
		// Remove existing theme styles
		document
			.querySelectorAll("link[data-theme]")
			.forEach((link) => link.remove());

		// Apply new theme styles
		theme.styles.forEach((style) => {
			const link = document.createElement("link");
			link.rel = "stylesheet";
			link.href = style;
			link.setAttribute("data-theme", theme.id);
			document.head.appendChild(link);
		});

		// Set theme attribute for CSS variables
		document.documentElement.setAttribute("data-theme", theme.id);

		// Store theme preference
		localStorage.setItem("leaf-theme", theme.id);
	}

	loadStoredTheme(): void {
		const stored = localStorage.getItem("leaf-theme");
		if (stored && this.themes.has(stored)) {
			this.setCurrentTheme(stored);
		}
	}
}

export const themeManager: ThemeManager = ThemeManager.getInstance();

// Register default themes
export function registerDefaultThemes(): void {
	themeManager.registerTheme({
		id: "default",
		name: "Default",
		description: "The default Leaf theme with modern design",
		package: "@sylphx/leaf-theme-default",
		styles: ["/theme-default/style.css"],
	});

	themeManager.registerTheme({
		id: "blog",
		name: "Blog",
		description: "Blog-focused theme with article cards and author info",
		package: "@sylphx/leaf-theme-blog",
		styles: ["/theme-blog/style.css"],
	});

	themeManager.registerTheme({
		id: "business",
		name: "Business",
		description: "Professional corporate theme for business documentation",
		package: "@sylphx/leaf-theme-business",
		styles: ["/theme-business/style.css"],
	});

	themeManager.registerTheme({
		id: "minimal",
		name: "Minimal",
		description: "Clean and minimal theme with distraction-free design",
		package: "@sylphx/leaf-theme-minimal",
		styles: ["/theme-minimal/style.css"],
	});
}
