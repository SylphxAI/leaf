import { createSignal, createEffect, onCleanup } from "solid-js";
import { $router, open as zenOpen } from "@sylphx/zen-router";
import { subscribe, get } from "@sylphx/zen";

// Hook to get current location
export function useLocation(): { pathname: string; search: string; hash: string } {
	const [routerState, setRouterState] = createSignal(get($router));

	createEffect(() => {
		const unsubscribe = subscribe($router, setRouterState);
		onCleanup(() => unsubscribe());
	});

	const state = routerState();
	return {
		pathname: state.path as string,
		search: (Object.keys(state.search).length > 0
			? "?" + new URLSearchParams(state.search as Record<string, string>).toString()
			: "") as string,
		hash: "" as string,
	};
}

// Hook to navigate
export function useNavigate(): (to: string) => void {
	return (to: string) => {
		zenOpen(to);
	};
}
