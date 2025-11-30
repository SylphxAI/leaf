import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["packages/**/*.{test,spec}.{js,ts}", "**/__tests__/**/*.{js,ts}"],
		exclude: ["node_modules", "dist", "examples", "docs"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["packages/*/src/**/*.{js,ts}"],
			exclude: ["node_modules", "dist", "**/*.d.ts", "**/__tests__/**"],
			thresholds: {
				global: {
					branches: 100,
					functions: 100,
					lines: 100,
					statements: 100,
				},
			},
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./packages/core/src"),
		},
	},
});
