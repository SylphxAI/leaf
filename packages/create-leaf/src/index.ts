#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cyan, green, red } from "kolorist";
import prompts from "prompts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cwd = process.cwd();

async function init() {
	console.log();
	console.log(green("⚡ Create Leaf Documentation Site"));
	console.log();

	let targetDir = "";
	let projectName = "";

	try {
		const result = await prompts(
			[
				{
					type: "text",
					name: "projectName",
					message: "Project name:",
					initial: "my-docs",
					onState: (state) => {
						targetDir = String(state.value).trim() || "my-docs";
					},
				},
				{
					type: () => (!fs.existsSync(targetDir) ? null : "confirm"),
					name: "overwrite",
					message: () => `${targetDir} already exists. Overwrite?`,
					initial: false,
				},
				{
					type: (_, { overwrite } = {}) => {
						if (overwrite === false) {
							throw new Error(`${red("✖")} Operation cancelled`);
						}
						return null;
					},
					name: "overwriteChecker",
				},
			],
			{
				onCancel: () => {
					throw new Error(`${red("✖")} Operation cancelled`);
				},
			},
		);

		projectName = result.projectName || targetDir;
	} catch (cancelled: any) {
		console.log(cancelled.message);
		process.exit(1);
	}

	const root = path.join(cwd, targetDir);

	if (fs.existsSync(root)) {
		emptyDir(root);
	}

	console.log(`\nScaffolding project in ${cyan(root)}...`);

	const templateDir = path.resolve(__dirname, "../template-default");

	const write = (file: string, content?: string) => {
		const targetPath = path.join(root, file);
		if (content) {
			fs.writeFileSync(targetPath, content);
		} else {
			copy(path.join(templateDir, file), targetPath);
		}
	};

	const files = fs.readdirSync(templateDir);
	for (const file of files.filter((f) => f !== "package.json")) {
		write(file);
	}

	const pkg = JSON.parse(
		fs.readFileSync(path.join(templateDir, "package.json"), "utf-8"),
	);
	pkg.name = projectName;

	write("package.json", `${JSON.stringify(pkg, null, "\t")}\n`);

	const cdProjectName = path.relative(cwd, root);

	console.log(`\n${green("✓")} Done!\n`);
	console.log(`Now run:\n`);
	if (root !== cwd) {
		console.log(`  cd ${cyan(cdProjectName)}`);
	}
	console.log(`  ${cyan("bun install")} (or npm install)`);
	console.log(`  ${cyan("bun dev")} (or npm run dev)`);
	console.log();
}

function copy(src: string, dest: string) {
	const stat = fs.statSync(src);
	if (stat.isDirectory()) {
		copyDir(src, dest);
	} else {
		fs.copyFileSync(src, dest);
	}
}

function copyDir(srcDir: string, destDir: string) {
	fs.mkdirSync(destDir, { recursive: true });
	for (const file of fs.readdirSync(srcDir)) {
		const srcFile = path.resolve(srcDir, file);
		const destFile = path.resolve(destDir, file);
		copy(srcFile, destFile);
	}
}

function emptyDir(dir: string) {
	if (!fs.existsSync(dir)) {
		return;
	}
	for (const file of fs.readdirSync(dir)) {
		if (file === ".git") {
			continue;
		}
		fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
	}
}

init().catch((e) => {
	console.error(e);
	process.exit(1);
});
