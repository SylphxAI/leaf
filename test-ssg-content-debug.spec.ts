import { expect, test } from "@playwright/test";

const baseUrl = "https://leaf.sylphx.com";

test("檢查 SSG 生成的 HTML 內容", async ({ page }) => {
	console.log("🔍 檢查 SSG 生成的 HTML 內容...");

	await page.goto(`${baseUrl}/api`);
	await page.waitForLoadState("networkidle");

	// 檢查 HTML 源碼
	const htmlSource = await page.evaluate(() => {
		return document.documentElement.outerHTML;
	});

	// 檢查預加載的數據
	const preloadData = await page.evaluate(() => {
		const preloadScript = document.getElementById("__LEAF_PRELOAD__");
		if (preloadScript) {
			try {
				return JSON.parse(preloadScript.textContent || "{}");
			} catch (_e) {
				return { error: "Failed to parse preload data" };
			}
		}
		return null;
	});

	console.log("📊 Preload data:", preloadData);

	// 檢查是否包含正確的 API 內容
	const hasApiTitle = htmlSource.includes("API Reference");
	const hasApiContent =
		htmlSource.includes("Complete API reference for Leaf") ||
		htmlSource.includes("Config API") ||
		htmlSource.includes("Markdown Plugins");

	// 檢查是否包含首頁內容
	const hasHomepageContent =
		htmlSource.includes("Modern Documentation Framework") &&
		htmlSource.includes("A modern Preact-based documentation framework");

	console.log("📋 是否包含 API 標題:", hasApiTitle);
	console.log("📋 是否包含 API 內容:", hasApiContent);
	console.log("📋 是否包含首頁內容:", hasHomepageContent);

	// 檢查預加載的 frontmatter
	if (preloadData?.frontmatter) {
		const hasApiFrontmatter =
			preloadData.frontmatter.title &&
			(preloadData.frontmatter.title.includes("API") ||
				preloadData.frontmatter.title.includes("Config") ||
				preloadData.frontmatter.title.includes("Markdown"));

		console.log("📋 Frontmatter title:", preloadData.frontmatter.title);
		console.log("📋 Frontmatter 是否 API 相關:", hasApiFrontmatter);
	}

	// 截圖
	await page.screenshot({
		path: "test-results/ssg-content-debug.png",
		fullPage: true,
	});

	// 保存 HTML 到文件以便檢查
	await page.evaluate(() => {
		const blob = new Blob([document.documentElement.outerHTML], {
			type: "text/html",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "api-page-source.html";
		a.click();
		URL.revokeObjectURL(url);
	});

	// 應該包含 API 內容而非首頁內容
	expect(hasApiContent || hasApiTitle).toBeTruthy();
});

test("比較首頁 vs API 頁面的 HTML 源碼", async ({ page }) => {
	console.log("\n🔍 比較首頁 vs API 頁面的 HTML...");

	// 獲取首頁 HTML
	await page.goto(`${baseUrl}/`);
	await page.waitForLoadState("networkidle");
	const homepageHtml = await page.evaluate(
		() => document.documentElement.outerHTML,
	);
	const homepageTitle = await page.title();

	// 獲取 API 頁面 HTML
	await page.goto(`${baseUrl}/api`);
	await page.waitForLoadState("networkidle");
	const apiHtml = await page.evaluate(() => document.documentElement.outerHTML);
	const apiTitle = await page.title();

	console.log("📄 首頁標題:", homepageTitle);
	console.log("📄 API 頁面標題:", apiTitle);

	// 檢查 HTML 是否相同
	const htmlIsIdentical = homepageHtml === apiHtml;
	console.log("🔍 HTML 是否完全相同:", htmlIsIdentical);

	if (htmlIsIdentical) {
		console.log("❌ 嚴重問題：首頁和API頁面的HTML完全相同！");
		console.log("   這意味著SSG生成時兩個頁面使用了相同的內容");
	}

	// 檢查關鍵差異
	const homepageHasApi = homepageHtml.toLowerCase().includes("api");
	const apiPageHasApi = apiHtml.toLowerCase().includes("api");

	console.log('📋 首頁是否包含 "api":', homepageHasApi);
	console.log('📋 API頁面是否包含 "api":', apiPageHasApi);

	// 檢查 body 內容的差異
	const homepageBodyContent =
		homepageHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || "";
	const apiBodyContent =
		apiHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || "";

	const bodyLengthDiff = Math.abs(
		homepageBodyContent.length - apiBodyContent.length,
	);
	console.log("📏 Body 內容長度差異:", bodyLengthDiff);

	if (bodyLengthDiff < 100) {
		console.log("❌ Body 內容幾乎完全相同，這是個問題！");
	}
});
