#!/usr/bin/env node

import { cac } from "cac";
import { build } from "./commands/build";
import { dev } from "./commands/dev";
import { preview } from "./commands/preview";

const cli = cac("leaf");

cli
	.command("dev [root]", "Start development server")
	.action(async (root?: string) => {
		await dev(root);
	});

cli
	.command("build [root]", "Build for production")
	.action(async (root?: string) => {
		await build(root);
	});

cli
	.command("preview [root]", "Preview production build")
	.action(async (root?: string) => {
		await preview(root);
	});

cli.help();
cli.version("0.1.0");

cli.parse();
