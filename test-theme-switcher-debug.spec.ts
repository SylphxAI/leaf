import { test } from "@playwright/test";

const baseUrl = "https://leaf.sylphx.com";

test("Debug theme switcher HTML structure", async ({ page }) => {
	console.log("🔍 詳細檢查主題切換器 HTML 結構...");

	await page.goto(`${baseUrl}/themes.html`);
	await page.waitForLoadState("networkidle");

	// 檢查所有可能的選擇器
	const selectors = [
		"button",
		"button[aria-label]",
		'button[aria-label*="theme"]',
		'button[aria-label*="Switch"]',
		"header button",
		"nav button",
		".theme-switcher",
		'[class*="theme"]',
		'div[class*="relative"] button',
		'div:has-text("Default")',
		'div:has-text("Blog")',
		'div:has-text("Business")',
		'div:has-text("Minimal")',
		'div[role="button"]',
		"*:has(svg)",
		'*:has-text("🎨")',
		'*:has-text("mdi:")',
	];

	for (const selector of selectors) {
		try {
			const elements = page.locator(selector);
			const count = await elements.count();
			if (count > 0) {
				console.log(`✅ 找到 ${count} 個元素: ${selector}`);

				// 獲取第一個元素的詳情
				const first = elements.first();
				const text = await first.textContent();
				const ariaLabel = await first.getAttribute("aria-label");
				const className = await first.getAttribute("class");
				const id = await first.getAttribute("id");

				console.log(`   文本: "${text}"`);
				console.log(`   aria-label: "${ariaLabel}"`);
				console.log(`   className: "${className}"`);
				console.log(`   id: "${id}"`);

				// 檢查是否包含 "Default", "Blog", "Business", "Minimal"
				const hasThemeWords =
					text &&
					(text.includes("Default") ||
						text.includes("Blog") ||
						text.includes("Business") ||
						text.includes("Minimal"));

				if (hasThemeWords) {
					console.log(`   🎯 這個元素包含主題詞彙！`);

					// 檢查點擊
					try {
						await first.click();
						console.log(`   ✅ 成功點擊`);
						await page.waitForTimeout(500);

						// 檢查是否有下拉菜單出現
						const dropdowns = await page
							.locator(
								'div:has-text("Default"), div:has-text("Blog"), div:has-text("Business"), div:has-text("Minimal")',
							)
							.count();
						console.log(`   📋 點擊後找到 ${dropdowns} 個可能的主題元素`);
					} catch (clickError) {
						console.log(`   ❌ 點擊失敗: ${clickError}`);
					}

					break;
				}
			}
		} catch (_e) {
			// 繼續下一個選擇器
		}
	}

	// 檢查完整 HTML 片段
	const headerHtml = await page.evaluate(() => {
		const header = document.querySelector("header");
		if (header) {
			return header.innerHTML.substring(0, 2000);
		}
		const nav = document.querySelector("nav");
		if (nav) {
			return nav.innerHTML.substring(0, 2000);
		}
		return document.body.innerHTML.substring(0, 2000);
	});

	console.log("📋 HTML 片段:", headerHtml.substring(0, 500));

	// 截圖
	await page.screenshot({
		path: "test-results/theme-switcher-debug.png",
		fullPage: true,
	});
	console.log("📸 已拍攝截圖: test-results/theme-switcher-debug.png");
});
