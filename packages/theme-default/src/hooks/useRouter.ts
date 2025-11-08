import { useEffect, useState, useCallback } from "preact/hooks";
import { $router, open as zenOpen } from "@sylphx/zen-router";
import { subscribe, get } from "@sylphx/zen";

// Hook to get current location
export function useLocation(): { pathname: string; search: string; hash: string } {
	const [routerState, setRouterState] = useState(() => get($router));

	useEffect(() => {
		const unsubscribe = subscribe($router, setRouterState);
		return unsubscribe;
	}, []);

	return {
		pathname: routerState.path as string,
		search: (Object.keys(routerState.search).length > 0
			? "?" + new URLSearchParams(routerState.search as Record<string, string>).toString()
			: "") as string,
		hash: "" as string,
	};
}

// Hook to navigate
export function useNavigate(): (to: string) => void {
	return useCallback((to: string) => {
		zenOpen(to);
	}, []);
}
