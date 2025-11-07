// Code copy button functionality (pure JS, no React hydration needed)
export function initCodeCopy() {
	if (typeof window === "undefined") return;

	// Add copy button to all code blocks
	const codeBlocks = document.querySelectorAll("pre code");

	codeBlocks.forEach((codeBlock) => {
		const pre = codeBlock.parentElement;
		if (!pre) return;

		// Skip if already has copy button
		if (pre.querySelector(".code-copy-btn")) return;

		// Create wrapper
		const wrapper = document.createElement("div");
		wrapper.className = "code-block-wrapper";

		// Move pre into wrapper
		pre.parentNode?.insertBefore(wrapper, pre);
		wrapper.appendChild(pre);

		// Extract language from class (e.g., "language-typescript")
		const languageClass = Array.from(codeBlock.classList).find((cls) =>
			cls.startsWith("language-"),
		);
		const language = languageClass
			? languageClass.replace("language-", "")
			: "text";

		// Add language label
		const langLabel = document.createElement("span");
		langLabel.className = "code-lang";
		langLabel.textContent = language;
		wrapper.appendChild(langLabel);

		// Create copy button
		const button = document.createElement("button");
		button.className = "code-copy-btn";
		button.innerHTML = `
			<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
			</svg>
			<svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
		`;
		button.setAttribute("aria-label", "Copy code");

		// Add click handler
		button.addEventListener("click", async () => {
			const code = codeBlock.textContent || "";

			try {
				await navigator.clipboard.writeText(code);
				button.classList.add("copied");

				setTimeout(() => {
					button.classList.remove("copied");
				}, 2000);
			} catch (err) {
				console.error("Failed to copy code:", err);
			}
		});

		wrapper.appendChild(button);
	});
}

// Auto-initialize when DOM is ready
if (typeof window !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initCodeCopy);
	} else {
		initCodeCopy();
	}
}
