import { defineConfig } from "bunup";

export default defineConfig({
	target: "browser",
	platform: "browser",
	external: ["solid-js", "solid-js/*", "@solidjs/router"],
	jsx: {
		runtime: "automatic",
		importSource: "solid-js",
		jsxImportSource: "solid-js",
	},
});
