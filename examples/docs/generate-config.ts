import { generateSidebar } from "@sylphx/reactpress";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const docsDir = resolve(root, "docs");

// Generate sidebar
const sidebar = await generateSidebar(docsDir);

// Generate config file
const config = {
	title: "Sylphx Documentation",
	description: "Documentation for Sylphx tools",
	base: "/",
	theme: {
		nav: [
			{ text: "Guide", link: "/guide/" },
			{ text: "Zen", link: "/zen" },
			{ text: "Craft", link: "/craft" },
			{ text: "Silk", link: "/silk" },
		],
		sidebar,
	},
};

// Write to file
const configPath = resolve(root, "src/config.json");
await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");

console.log("✓ Generated config with auto sidebar:");
console.log(JSON.stringify(sidebar, null, 2));
