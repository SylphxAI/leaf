import { generateSidebar } from "@sylphx/reactpress";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const docsDir = resolve(root, "docs");

// Generate sidebar
const sidebar = await generateSidebar(docsDir);

// Generate config file from reactpress.config.ts
const { default: reactpressConfig } = await import("./reactpress.config.ts");

// Generate config file
const config = {
	title: reactpressConfig.title,
	description: reactpressConfig.description,
	base: reactpressConfig.base || "/",
	theme: {
		nav: reactpressConfig.theme?.nav || [],
		sidebar: reactpressConfig.theme?.sidebar || sidebar,
	},
};

// Write to file
const configPath = resolve(root, "src/config.json");
await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");

console.log("✓ Generated config:");
console.log(JSON.stringify(config, null, 2));
