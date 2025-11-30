import { test } from "@playwright/test";

const baseUrl = "https://leaf.sylphx.com";

test("Theme switcher 當前狀態診斷", async ({ page }) => {
	console.log("🔍 診斷主題切換當前狀態...");

	await page.goto(`${baseUrl}/themes.html`);
	await page.waitForLoadState("networkidle");

	// 檢查 Console 訊息
	const consoleLogs: string[] = [];
	page.on("console", (msg) => {
		consoleLogs.push(msg.text());
		console.log("📢", msg.text());
	});

	// 等待幾秒讓 console log 顯示
	await page.waitForTimeout(2000);

	// 檢查主題切換按鈕
	const themeButton = page.locator('button[aria-label="Switch theme"]').first();
	const isVisible = await themeButton.isVisible();
	console.log("👀 主題切換按鈕可見:", isVisible);

	if (isVisible) {
		// 點擊按鈕
		await themeButton.click();
		await page.waitForTimeout(1000);

		// 點擊 Blog theme
		const blogTheme = page
			.locator("button")
			.filter({ hasText: "Blog" })
			.first();
		const blogVisible = await blogTheme.isVisible();
		console.log("📝 Blog theme 可見:", blogVisible);

		if (blogVisible) {
			await blogTheme.click();
			console.log("✅ 點擊了 Blog theme");
			await page.waitForTimeout(2000);

			// 檢查 body class
			const bodyClass = await page.evaluate(() => document.body.className);
			console.log("📋 Body classes after click:", bodyClass);

			// 檢查 CSS 變數
			const cssVars = await page.evaluate(() => {
				const root = document.documentElement;
				return {
					fontFamily: root.style.getPropertyValue("--font-family"),
					computedFont: window.getComputedStyle(root).fontFamily,
				};
			});
			console.log("🎨 CSS variables:", cssVars);
		}
	}

	// 檢查錯誤
	const errors = consoleLogs.filter(
		(log) => log.includes("Error") || log.includes("error"),
	);
	console.log("❌ Errors found:", errors.length);

	console.log("📊 All console logs:", consoleLogs);

	// 截圖
	await page.screenshot({
		path: "test-results/current-state.png",
		fullPage: true,
	});
});

test("/guide 路由內容檢查", async ({ page }) => {
	console.log("\n🔍 檢查 /guide 路由內容...");

	await page.goto(`${baseUrl}/guide`);
	await page.waitForLoadState("networkidle");

	const title = await page.title();
	const h1 = await page.evaluate(() => {
		const h1 = document.querySelector("h1");
		return h1 ? h1.textContent : "No H1";
	});

	console.log("📄 頁面標題:", title);
	console.log("📋 H1 內容:", h1);

	// 檢查是否首頁內容
	const isHomepage = h1.includes("Modern Documentation Framework");
	console.log("🎯 是否首頁內容:", isHomepage);

	// 截圖
	await page.screenshot({
		path: "test-results/guide-content.png",
		fullPage: true,
	});
});
