import { vi } from "vitest";

// Mock Node.js modules that might not be available in test environment
global.process = {
	...global.process,
	env: {
		NODE_ENV: "test",
	},
} as any;

// Mock fs modules
vi.mock("node:fs", () => ({
	readFileSync: vi.fn(),
	existsSync: vi.fn(() => true),
	statSync: vi.fn(() => ({ isDirectory: () => false, isFile: () => true })),
	readdirSync: vi.fn(() => []),
	writeFileSync: vi.fn(),
	copyFileSync: vi.fn(),
	mkdirSync: vi.fn(),
	rmSync: vi.fn(),
}));

vi.mock("node:fs/promises", () => ({
	readFile: vi.fn(() => Promise.resolve("mock markdown content")),
	writeFile: vi.fn(() => Promise.resolve()),
	access: vi.fn(() => Promise.resolve()),
}));

// Mock fast-glob
vi.mock("fast-glob", () => ({
	default: vi.fn(() => Promise.resolve(["test.md", "guide/installation.md"])),
}));

// Mock gray-matter
vi.mock("gray-matter", () => ({
	default: vi.fn((content) => ({
		content,
		data: {
			title: "Test Page",
			description: "Test description",
			order: 1,
		},
	})),
}));

// Mock path utilities
vi.mock("node:path", () => ({
	resolve: vi.fn((...args) => args.join("/")),
	relative: vi.fn((from, to) => to.replace(from, "")),
	join: vi.fn((...args) => args.join("/")),
	dirname: vi.fn((path) => path.split("/").slice(0, -1).join("/")),
	basename: vi.fn(
		(path, ext) =>
			path
				.split("/")
				.pop()
				?.replace(ext || "", "") || "",
	),
	extname: vi.fn((path) => `.${path.split(".").pop()}`),
}));
