import { test, expect } from '@playwright/test';

const baseUrl = 'https://leaf.sylphx.com';

test('尋找正確的主題頁面', async ({ page }) => {
  console.log('🔍 尋找正確的主題頁面...');

  // 嘗試不同的可能 URL
  const possibleUrls = [
    '/themes',
    '/themes/',
    '/guide/theming',
    '/docs/themes',
    '/theme',
    '/theme/',
    '/#themes',
    '/',
  ];

  for (const url of possibleUrls) {
    console.log(`\n📍 嘗試: ${baseUrl}${url}`);

    try {
      await page.goto(`${baseUrl}${url}`);
      await page.waitForLoadState('networkidle');

      const title = await page.title();
      const currentUrl = page.url();

      console.log(`   URL: ${currentUrl}`);
      console.log(`   標題: ${title}`);

      // 檢查是否包含主題相關內容
      const hasThemeContent = await page.evaluate(() => {
        const content = document.documentElement.textContent || '';
        return content.includes('Theme') ||
               content.includes('theme') ||
               content.includes('default') ||
               content.includes('blog') ||
               content.includes('business') ||
               content.includes('minimal');
      });

      console.log(`   包含主題內容: ${hasThemeContent}`);

      // 檢查是否有 ThemeSwitcher 相關內容
      const hasThemeSwitcher = await page.evaluate(() => {
        const content = document.documentElement.textContent || '';
        return content.includes('ThemeSwitcher') ||
               content.includes('switch theme') ||
               content.includes('Choose Theme');
      });

      console.log(`   包含主題切換器: ${hasThemeSwitcher}`);

      // 檢查是否有 button
      const buttonCount = await page.locator('button').count();
      console.log(`   按鈕數量: ${buttonCount}`);

      if (hasThemeContent || hasThemeSwitcher || buttonCount > 0) {
        // 截圖
        await page.screenshot({ path: `test-results/possible-themes-${url.replace(/[\/#]/g, '-')}.png`, fullPage: true });
        console.log(`   📸 已拍攝截圖: test-results/possible-themes-${url.replace(/[\/#]/g, '-')}.png`);
      }

      // 檢查是否首頁
      const isHomepage = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 && h1.textContent?.includes('Modern Documentation Framework');
      });

      console.log(`   是否首頁: ${isHomepage}`);

    } catch (error) {
      console.log(`   ❌ 錯誤: ${error}`);
    }
  }

  // 檢查首頁是否有主題切換器
  console.log(`\n🔍 檢查首頁是否包含主題切換器...`);
  await page.goto(`${baseUrl}/`);
  await page.waitForLoadState('networkidle');

  const homepageButtons = await page.locator('button').count();
  const homepageHasTheme = await page.evaluate(() => {
    const content = document.documentElement.textContent || '';
    return content.includes('Theme') || content.includes('theme');
  });

  console.log(`首頁按鈕數量: ${homepageButtons}`);
  console.log(`首頁包含主題內容: ${homepageHasTheme}`);

  // 截圖
  await page.screenshot({ path: 'test-results/homepage-debug.png', fullPage: true });
});