// TOC active state tracking (pure JS, no React hydration needed)
export function initTableOfContents() {
	// Only run on client-side and if TOC exists
	if (typeof window === "undefined") return;

	const toc = document.querySelector(".toc");
	if (!toc) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				const id = entry.target.getAttribute("id");
				if (!id) return;

				const tocLink = toc.querySelector(`a[href="#${id}"]`);
				if (!tocLink) return;

				const tocItem = tocLink.closest(".toc-item");
				if (!tocItem) return;

				if (entry.isIntersecting) {
					// Remove active from all items
					toc.querySelectorAll(".toc-item").forEach((item) => {
						item.classList.remove("active");
					});
					// Add active to current item
					tocItem.classList.add("active");
				}
			});
		},
		{
			rootMargin: "-80px 0px -80% 0px",
			threshold: 0,
		},
	);

	// Observe all headings that are in the TOC
	const headings = document.querySelectorAll("h2[id], h3[id]");
	headings.forEach((heading) => {
		observer.observe(heading);
	});

	// Handle cleanup
	return () => observer.disconnect();
}

// Auto-initialize when DOM is ready
if (typeof window !== "undefined") {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initTableOfContents);
	} else {
		initTableOfContents();
	}
}
