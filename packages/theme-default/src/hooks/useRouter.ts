import { useEffect, useState, useCallback } from "preact/hooks";
import { $router, open as zenOpen } from "@sylphx/zen-router";
import { subscribe, get } from "@sylphx/zen";

// Hook to get current location
export function useLocation() {
	const [routerState, setRouterState] = useState(() => get($router));

	useEffect(() => {
		const unsubscribe = subscribe($router, setRouterState);
		return unsubscribe;
	}, []);

	return {
		pathname: routerState.path,
		search: Object.keys(routerState.search).length > 0
			? "?" + new URLSearchParams(routerState.search as Record<string, string>).toString()
			: "",
		hash: "",
	};
}

// Hook to navigate
export function useNavigate() {
	return useCallback((to: string) => {
		zenOpen(to);
	}, []);
}
