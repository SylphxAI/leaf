import { defineConfig } from "bunup";

export default defineConfig({
	target: "browser",
	platform: "browser",
	jsx: {
		runtime: "automatic",
		importSource: "preact",
	},
});
