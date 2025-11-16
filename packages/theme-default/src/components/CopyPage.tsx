import { createSignal, createEffect, onCleanup } from "solid-js";
import { Button } from "./Button";
import "iconify-icon";

interface CopyPageProps {
	title?: string;
}


export function CopyPage(props: CopyPageProps) {
	const [copied, setCopied] = createSignal(false);

	createEffect(() => {
		if (copied()) {
			const timer = setTimeout(() => setCopied(false), 2000);
			onCleanup(() => clearTimeout(timer));
		}
	});

	const handleCopy = async () => {
		try {
			// Get the main content
			const mainElement = document.querySelector("main .prose");
			if (!mainElement) return;

			// Get text content (includes code blocks)
			let content = "";

			// Add title if available
			if (props.title) {
				content += `# ${props.title}\n\n`;
			}

			// Extract text content while preserving structure
			const extractContent = (element: Element): string => {
				let text = "";

				for (const node of Array.from(element.childNodes)) {
					if (node.nodeType === Node.TEXT_NODE) {
						text += node.textContent || "";
					} else if (node.nodeType === Node.ELEMENT_NODE) {
						const el = node as HTMLElement;

						// Handle code blocks specially
						if (el.tagName === "PRE") {
							const code = el.querySelector("code");
							if (code) {
								text += "\n```\n" + code.textContent + "\n```\n\n";
							}
						} else if (el.tagName === "H1" || el.tagName === "H2" || el.tagName === "H3") {
							const level = el.tagName === "H1" ? "#" : el.tagName === "H2" ? "##" : "###";
							text += `\n${level} ${el.textContent}\n\n`;
						} else if (el.tagName === "P") {
							text += extractContent(el) + "\n\n";
						} else if (el.tagName === "UL" || el.tagName === "OL") {
							const items = el.querySelectorAll("li");
							items.forEach((item) => {
								text += `- ${item.textContent}\n`;
							});
							text += "\n";
						} else {
							text += extractContent(el);
						}
					}
				}

				return text;
			};

			content += extractContent(mainElement);

			// Copy to clipboard
			await navigator.clipboard.writeText(content.trim());

			// Visual feedback
			setCopied(true);
		} catch (err) {
			console.error("Failed to copy page:", err);
		}
	};

	return (
		<Button
			onClick={handleCopy}
			variant="default"
			class="text-xs font-medium"
			aria-label="Copy page content"
		>
			<iconify-icon
				icon={copied() ? "ph:check-bold" : "ph:copy-bold"}
				width="14"
				height="14"
				class={`transition-colors duration-200 ${copied() ? 'text-success' : ''}`}
			/>
			<span class="hidden lg:inline">
				{copied() ? "Copied!" : "Copy"}
			</span>
		</Button>
	);
}
