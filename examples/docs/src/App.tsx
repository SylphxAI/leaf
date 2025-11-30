import { routes } from "virtual:reactpress/routes";
import type { TocItem } from "@sylphx/leaf-theme-default";
import { Layout } from "@sylphx/leaf-theme-default";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import config from "./config.json";

// Wrapper component to handle TOC extraction
function PageWrapper({ Component }: { Component: any }) {
	const [_toc, setToc] = useState<TocItem[]>([]);

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
