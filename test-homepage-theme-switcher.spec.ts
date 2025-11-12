import { test, expect } from '@playwright/test';

const baseUrl = 'https://leaf.sylphx.com';

test('檢查首頁主題切換器', async ({ page }) => {
  console.log('🔍 檢查首頁主題切換器...');

  await page.goto(`${baseUrl}/`);
  await page.waitForLoadState('networkidle');

  // 檢查所有按鈕
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log(`👋 找到 ${buttonCount} 個按鈕`);

  // 詳細檢查每個按鈕
  for (let i = 0; i < buttonCount; i++) {
    const button = buttons.nth(i);
    const text = await button.textContent();
    const ariaLabel = await button.getAttribute('aria-label');
    const className = await button.getAttribute('class');

    console.log(`\n按鈕 ${i}:`);
    console.log(`  文本: "${text}"`);
    console.log(`  aria-label: "${ariaLabel}"`);
    console.log(`  className: "${className}"`);

    // 如果包含主題相關詞彙
    if (text && (
      text.includes('Default') ||
      text.includes('Blog') ||
      text.includes('Business') ||
      text.includes('Minimal') ||
      text.includes('Theme') ||
      text.toLowerCase().includes('theme')
    )) {
      console.log(`  🎯 主題相關按鈕！`);

      try {
        // 點擊按鈕
        await button.click();
        console.log(`  ✅ 成功點擊`);
        await page.waitForTimeout(1000);

        // 檢查是否有變化
        const bodyClass = await page.evaluate(() => document.body.className);
        const rootClass = await page.evaluate(() => document.documentElement.className);

        console.log(`  📋 點擊後 body class: "${bodyClass}"`);
        console.log(`  📋 點擊後 root class: "${rootClass}"`);

        // 檢查 computed styles
        const computedStyle = await page.evaluate(() => {
          const root = document.documentElement;
          return {
            fontFamily: window.getComputedStyle(root).fontFamily,
            fontSize: window.getComputedStyle(root).fontSize,
            lineHeight: window.getComputedStyle(root).lineHeight
          };
        });
        console.log(`  🎨 Computed styles:`, computedStyle);

      } catch (clickError) {
        console.log(`  ❌ 點擊失敗: ${clickError}`);
      }
    }
  }

  // 檢查 console
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(msg.text());
    console.log('📢', msg.text());
  });

  // 等待 console 顯示
  await page.waitForTimeout(2000);
  console.log('\n📊 Console logs:', consoleLogs);

  // 檢查錯誤
  const errors = consoleLogs.filter(log => log.toLowerCase().includes('error'));
  console.log('❌ Errors:', errors);

  // 截圖
  await page.screenshot({ path: 'test-results/homepage-theme-debug.png', fullPage: true });
  console.log('\n📸 已拍攝截圖: test-results/homepage-theme-debug.png');
});