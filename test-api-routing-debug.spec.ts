import { expect, test } from "@playwright/test";

const baseUrl = "https://leaf.sylphx.com";

test("API 路由問題診斷", async ({ page }) => {
	console.log("🔍 診斷 /api 路由問題...");

	// 訪問 /api 頁面
	await page.goto(`${baseUrl}/api`);
	await page.waitForLoadState("networkidle");

	// 等待一下，檢查是否會重定向
	await page.waitForTimeout(2000);

	// 檢查當前 URL
	const currentUrl = page.url();
	console.log("🔗 當前 URL:", currentUrl);

	// 檢查頁面標題
	const title = await page.title();
	console.log("📄 頁面標題:", title);

	// 檢查是否被重定向到首頁
	const isHomepage =
		currentUrl === `${baseUrl}/` || currentUrl === `${baseUrl}`;
	console.log("🎯 是否被重定向到首頁:", isHomepage);

	// 檢查 H1 內容
	const h1Text = await page.evaluate(() => {
		const h1 = document.querySelector("h1");
		return h1 ? h1.textContent : "No H1";
	});
	console.log("📋 H1 內容:", h1Text);

	// 檢查頁面是否包含 API 相關內容
	const pageContent = await page.content();
	const hasApiContent =
		pageContent.toLowerCase().includes("api") ||
		pageContent.toLowerCase().includes("application") ||
		pageContent.toLowerCase().includes("interface");

	console.log("📋 是否包含 API 內容:", hasApiContent);

	// 檢查是否有重定向的跡象
	const redirects = await page.evaluate(() => {
		const perfEntries = performance.getEntriesByType(
			"navigation",
		) as PerformanceNavigationTiming[];
		if (perfEntries.length > 0) {
			const nav = perfEntries[0];
			return {
				redirectCount: nav.redirectCount,
				redirectStart: nav.redirectStart,
				redirectEnd: nav.redirectEnd,
				type: nav.type,
			};
		}
		return null;
	});

	if (redirects) {
		console.log("🔄 重定向信息:", redirects);
	}

	// 檢查 HTTP 狀態（可能需要從網絡請求中查看）
	const responses: any[] = [];
	page.on("response", (response) => {
		responses.push({
			url: response.url(),
			status: response.status(),
			ok: response.ok(),
		});
		console.log("📡 Response:", response.url(), response.status());
	});

	// 檢查本地是否存在 API markdown 文件
	console.log("\n🔍 檢查本地文件結構...");

	// 截圖
	await page.screenshot({
		path: "test-results/api-routing-debug.png",
		fullPage: true,
	});

	console.log("\n📸 已拍攝截圖: test-results/api-routing-debug.png");

	// 應該停留在 /api，不應該重定向到首頁
	expect(currentUrl).toContain("/api");
	expect(isHomepage).toBeFalsy();
});

test("檢查正確的 API 文件存在", async ({ page }) => {
	console.log("\n🔍 檢查正確的 API 文件是否生成...");

	// 嘗試不同的 API 相關 URL
	const apiUrls = [
		"/api",
		"/api/",
		"/docs/api",
		"/api/config",
		"/api/markdown-plugins",
		"/api/theming",
	];

	for (const url of apiUrls) {
		console.log(`\n📍 測試: ${baseUrl}${url}`);

		await page.goto(`${baseUrl}${url}`);
		await page.waitForLoadState("networkidle");

		const currentUrl = page.url();
		const title = await page.title();
		const h1Text = await page.evaluate(() => {
			const h1 = document.querySelector("h1");
			return h1 ? h1.textContent : "No H1";
		});

		console.log(`   URL: ${currentUrl}`);
		console.log(`   標題: ${title}`);
		console.log(`   H1: ${h1Text}`);

		// 檢查是否正確的 API 內容
		const isCorrectApiContent =
			h1Text &&
			(h1Text.includes("API") ||
				h1Text.includes("Config") ||
				h1Text.includes("Markdown") ||
				h1Text.includes("Theming"));

		const isHomepage =
			currentUrl === `${baseUrl}/` || currentUrl === `${baseUrl}`;

		console.log(`   是否正確 API 內容: ${isCorrectApiContent}`);
		console.log(`   是否首頁: ${isHomepage}`);

		if (!isHomepage && isCorrectApiContent) {
			console.log(`   ✅ 找到正確的 API 頁面!`);
		}
	}
});
