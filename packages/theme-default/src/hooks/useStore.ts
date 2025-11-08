import { type Zen } from "@sylphx/zen";
import { useEffect, useState } from "preact/hooks";

// TEMPORARY: Import Zen functions with type assertions
import * as ZenModule from "@sylphx/zen";
const get = ZenModule.get as <T>(store: Zen<T>) => T;
const subscribe = ZenModule.subscribe as <T>(
	store: Zen<T>,
	listener: (value: T) => void,
) => () => void;

export function useStore<T>(store: Zen<T>): T {
	const [value, setValue] = useState<T>(get(store));

	useEffect(() => {
		setValue(get(store));
		return subscribe(store, setValue);
	}, [store]);

	return value;
}
