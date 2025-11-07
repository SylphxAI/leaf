import { Layout } from "@sylphx/reactpress-theme-default";
import type { TocItem } from "@sylphx/reactpress-theme-default";
import { useState, useEffect } from "react";
import { Route, Routes, useOutletContext } from "react-router-dom";
import { routes } from "virtual:reactpress/routes";

const config = {
	title: "Sylphx Documentation",
	description: "Documentation for Sylphx tools",
	base: "/",
	theme: {
		nav: [
			{ text: "Zen", link: "/zen" },
			{ text: "Craft", link: "/craft" },
			{ text: "Silk", link: "/silk" },
		],
		sidebar: [
			{ text: "Introduction", link: "/" },
			{ text: "Zen", link: "/zen" },
			{ text: "Craft", link: "/craft" },
			{ text: "Silk", link: "/silk" },
		],
	},
};

// Wrapper component to handle TOC extraction
function PageWrapper({ Component }: { Component: any }) {
	const [toc, setToc] = useState<TocItem[]>([]);

	useEffect(() => {
		// Import TOC from the component module
		import(Component).then((module) => {
			if (module.toc) {
				setToc(module.toc);
			}
		});
	}, [Component]);

	return (
		<div>
			<Component />
		</div>
	);
}

export function App() {
	return (
		<Routes>
			<Route path="/" element={<Layout config={config} />}>
				{routes.map((route) => (
					<Route
						key={route.path}
						path={route.path === "/" ? undefined : route.path}
						index={route.path === "/"}
						element={<PageWrapper Component={route.component} />}
					/>
				))}
			</Route>
		</Routes>
	);
}
