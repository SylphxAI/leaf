import { createSignal, For, onMount, Show } from "solid-js";
import "iconify-icon";

const themes = [
	{
		id: "default",
		name: "Default",
		description: "Modern documentation theme",
		icon: "mdi:palette",
	},
	{
		id: "blog",
		name: "Blog",
		description: "Article-focused theme",
		icon: "mdi:post",
	},
	{
		id: "business",
		name: "Business",
		description: "Professional corporate theme",
		icon: "mdi:briefcase",
	},
	{
		id: "minimal",
		name: "Minimal",
		description: "Clean and minimal theme",
		icon: "mdi:bullseye-arrow",
	},
];

export function ThemeSwitcher(): JSX.Element {
	const [isOpen, setIsOpen] = createSignal(false);
	const [currentThemeId, setCurrentThemeId] = createSignal("default");

	onMount(() => {
		const stored = localStorage.getItem("leaf-theme");
		if (stored) {
			setCurrentThemeId(stored);
			applyThemeStyles(stored);
		}
	});

	const applyThemeStyles = (themeId: string) => {
		console.log("🎨 Applying theme:", themeId);

		// Apply theme-specific styles - Critical: Apply to documentElement for CSS variables
		const root = document.documentElement;
		const body = document.body;

		// Remove existing theme classes from both root and body
		root.className = root.className.replace(/theme-\w+/g, "");
		body.className = body.className.replace(/theme-\w+/g, "");

		// Add new theme class to both
		root.classList.add(`theme-${themeId}`);
		body.classList.add(`theme-${themeId}`);

		console.log("📋 Root classes:", root.className);
		console.log("📋 Body classes:", body.className);

		// Force CSS variables to be set directly (in case CSS file not loaded)
		if (themeId === "blog") {
			root.style.setProperty("--font-family", "Georgia, serif", "important");
			root.style.setProperty("--font-size", "18px", "important");
			root.style.setProperty("--line-height", "1.7", "important");
		} else if (themeId === "business") {
			root.style.setProperty(
				"--font-family",
				"Helvetica, Arial, sans-serif",
				"important",
			);
			root.style.setProperty("--font-size", "15px", "important");
			root.style.setProperty("--line-height", "1.5", "important");
		} else if (themeId === "minimal") {
			root.style.setProperty(
				"--font-family",
				"-apple-system, BlinkMacSystemFont, sans-serif",
				"important",
			);
			root.style.setProperty("--font-size", "16px", "important");
			root.style.setProperty("--line-height", "1.6", "important");
		} else {
			root.style.setProperty(
				"--font-family",
				"Inter, system-ui, sans-serif",
				"important",
			);
			root.style.setProperty("--font-size", "16px", "important");
			root.style.setProperty("--line-height", "1.6", "important");
		}

		// Also set directly on body as fallback
		body.style.fontFamily = root.style.getPropertyValue("--font-family");
		body.style.fontSize = root.style.getPropertyValue("--font-size");
		body.style.lineHeight = root.style.getPropertyValue("--line-height");

		console.log("✅ CSS variables applied forcefully");
		console.log(
			"   Font family:",
			root.style.getPropertyValue("--font-family"),
		);
	};

	const currentTheme = () =>
		themes.find((t) => t.id === currentThemeId()) || themes[0];

	const handleThemeChange = (themeId: string) => {
		setCurrentThemeId(themeId);
		localStorage.setItem("leaf-theme", themeId);
		applyThemeStyles(themeId);
		setIsOpen(false);
	};

	return (
		<div class="relative">
			<button
				onClick={() => setIsOpen(!isOpen())}
				class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				aria-label="Switch theme"
			>
				<iconify-icon icon={currentTheme().icon} class="text-lg" />
				<span class="hidden md:inline">{currentTheme().name}</span>
				<svg
					class={`w-4 h-4 transition-transform ${isOpen() ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			<Show when={isOpen()}>
				<div class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
					<div class="p-4">
						<h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">
							Choose Theme
						</h3>
						<div class="space-y-2">
							<For each={themes}>
								{(theme) => (
									<button
										onClick={() => handleThemeChange(theme.id)}
										class={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
											currentThemeId() === theme.id
												? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
												: "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
										}`}
									>
										<div class="flex items-center gap-3">
											<iconify-icon icon={theme.icon} class="text-lg" />
											<div>
												<div class="font-medium">{theme.name}</div>
												<div class="text-xs text-gray-500 dark:text-gray-400">
													{theme.description}
												</div>
											</div>
										</div>
									</button>
								)}
							</For>
						</div>
					</div>
				</div>
			</Show>
		</div>
	);
}
