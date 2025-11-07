#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const distDir = join(__dirname, "../dist");

function fixDuplicateExports(filePath) {
	// Read the file
	let content = readFileSync(filePath, "utf-8");

	// Find all export statements (both single-line and multi-line)
	const exportPattern = /export\s*{\s*([^}]+)\s*}\s*;?/g;
	const exports = [];
	let match;

	while ((match = exportPattern.exec(content)) !== null) {
		// Normalize export names by removing all whitespace for comparison
		const rawName = match[1];
		const normalizedName = rawName.replace(/\s+/g, " ").trim();
		exports.push({
			start: match.index,
			end: match.index + match[0].length,
			name: normalizedName,
			fullMatch: match[0],
		});
	}

	if (exports.length === 0) return 0;

	// Group exports by name and keep only the first occurrence
	const seen = new Set();
	const toRemove = [];

	for (const exp of exports) {
		if (seen.has(exp.name)) {
			toRemove.push(exp);
		} else {
			seen.add(exp.name);
		}
	}

	if (toRemove.length === 0) return 0;

	// Remove duplicates (in reverse order to not mess up indices)
	toRemove.reverse();
	for (const exp of toRemove) {
		// Also remove any trailing newline after the export
		let end = exp.end;
		if (content[end] === "\n") end++;

		content = content.substring(0, exp.start) + content.substring(end);
	}

	// Write back
	writeFileSync(filePath, content);
	return toRemove.length;
}

function walkDir(dir) {
	const files = [];
	const items = readdirSync(dir);

	for (const item of items) {
		const fullPath = join(dir, item);
		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			files.push(...walkDir(fullPath));
		} else if (item.endsWith(".js")) {
			files.push(fullPath);
		}
	}

	return files;
}

// Process all .js files in dist
const jsFiles = walkDir(distDir);
let totalFixed = 0;
let filesFixed = 0;

for (const file of jsFiles) {
	const removed = fixDuplicateExports(file);
	if (removed > 0) {
		totalFixed += removed;
		filesFixed++;
		const relativePath = file.replace(distDir + "/", "");
		console.log(`  ✓ ${relativePath}: removed ${removed} duplicate(s)`);
	}
}

if (totalFixed > 0) {
	console.log(
		`✓ Fixed duplicate exports in ${filesFixed} file(s) (${totalFixed} total duplicates removed)`,
	);
} else {
	console.log("✓ No duplicate exports found");
}
