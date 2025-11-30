import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Get the last commit timestamp for a file
 */
export async function getLastModifiedTime(
	filePath: string,
): Promise<Date | null> {
	try {
		const { stdout } = await execAsync(`git log -1 --format=%at "${filePath}"`);
		const timestamp = Number.parseInt(stdout.trim(), 10);

		if (Number.isNaN(timestamp)) {
			return null;
		}

		return new Date(timestamp * 1000);
	} catch {
		// File not in git or git not available
		return null;
	}
}

/**
 * Format a date as a relative or absolute time string
 */
export function formatLastModified(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		return "Today";
	}
	if (diffDays === 1) {
		return "Yesterday";
	}
	if (diffDays < 7) {
		return `${diffDays} days ago`;
	}
	if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7);
		return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
	}
	if (diffDays < 365) {
		const months = Math.floor(diffDays / 30);
		return months === 1 ? "1 month ago" : `${months} months ago`;
	}

	// Format as absolute date for older content
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
