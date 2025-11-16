import { type Zen, get, subscribe } from "@sylphx/zen";
import { createSignal, onCleanup, onMount, createEffect } from "solid-js";

export function useStore<T>(store: Zen<T>): () => T {
	const [value, setValue] = createSignal<T>(get(store));

	createEffect(() => {
		setValue(() => get(store));
		const unsubscribe = subscribe(store, setValue);
		onCleanup(() => unsubscribe());
	});

	return value;
}
