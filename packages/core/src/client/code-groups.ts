interface CodeTab {
	label: string;
	language: string;
	code: string;
	meta: string;
}

export function initCodeGroups(): void {
	if (typeof window === "undefined") return;

	const codeGroups = document.querySelectorAll(".code-group");

	codeGroups.forEach((container) => {
		const dataAttr = container.getAttribute("data-code-group");
		if (!dataAttr) return;

		try {
			const tabs: CodeTab[] = JSON.parse(dataAttr);
			if (tabs.length === 0) return;

			// Create tabs container
			const tabsContainer = document.createElement("div");
			tabsContainer.className = "code-group-tabs";

			// Create tab buttons
			tabs.forEach((tab, index) => {
				const button = document.createElement("button");
				button.className = `code-group-tab ${index === 0 ? "active" : ""}`;
				button.textContent = tab.label;
				button.setAttribute("data-index", String(index));

				button.addEventListener("click", () => {
					// Update active tab
					tabsContainer.querySelectorAll(".code-group-tab").forEach((btn) => {
						btn.classList.remove("active");
					});
					button.classList.add("active");

					// Update active content
					contentContainer
						.querySelectorAll(".code-group-content")
						.forEach((content) => {
							content.classList.remove("active");
						});
					const targetContent = contentContainer.querySelector(
						`.code-group-content[data-index="${index}"]`,
					);
					if (targetContent) {
						targetContent.classList.add("active");
					}
				});

				tabsContainer.appendChild(button);
			});

			// Create content container
			const contentContainer = document.createElement("div");
			contentContainer.className = "code-group-contents";

			// Create code blocks
			tabs.forEach((tab, index) => {
				const contentDiv = document.createElement("div");
				contentDiv.className = `code-group-content ${index === 0 ? "active" : ""}`;
				contentDiv.setAttribute("data-index", String(index));

				// Create wrapper for code block
				const wrapper = document.createElement("div");
				wrapper.className = "code-block-wrapper";

				// Create pre and code elements
				const pre = document.createElement("pre");
				const code = document.createElement("code");
				code.className = `language-${tab.language}`;
				code.textContent = tab.code;

				pre.appendChild(code);
				wrapper.appendChild(pre);

				// Add language label
				const langLabel = document.createElement("span");
				langLabel.className = "code-lang";
				langLabel.textContent = tab.language;
				wrapper.appendChild(langLabel);

				// Add copy button
				const copyButton = document.createElement("button");
				copyButton.className = "code-copy-btn";
				copyButton.innerHTML = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
				copyButton.setAttribute("aria-label", "Copy code");

				copyButton.addEventListener("click", async () => {
					try {
						await navigator.clipboard.writeText(tab.code);
						copyButton.classList.add("copied");
						setTimeout(() => {
							copyButton.classList.remove("copied");
						}, 2000);
					} catch (err) {
						console.error("Failed to copy code:", err);
					}
				});

				wrapper.appendChild(copyButton);

				contentDiv.appendChild(wrapper);
				contentContainer.appendChild(contentDiv);
			});

			// Clear container and append new structure
			container.innerHTML = "";
			container.appendChild(tabsContainer);
			container.appendChild(contentContainer);

			// Apply syntax highlighting if available
			if (typeof (window as any).hljs !== "undefined") {
				container.querySelectorAll("pre code").forEach((block) => {
					(window as any).hljs.highlightElement(block);
				});
			}
		} catch (err) {
			console.error("Failed to parse code group:", err);
		}
	});
}
