import { test, expect } from '@playwright/test';

test.describe('Leaf 主題切換 & SSR 問題測試', () => {
  const baseUrl = 'https://leaf.sylphx.com';

  test('主題切換功能測試', async ({ page }) => {
    console.log('🎨 開始測試主題切換功能...');

    // 訪問主題頁面
    await page.goto(`${baseUrl}/themes.html`);
    await page.waitForLoadState('networkidle');

    // 檢查 ThemeSwitcher - 嘗試多種選擇器
    const themeSwitcherSelectors = [
      'button[aria-label="Switch theme"]',
      'button:has-text("Default")',
      'button:has-text("🎨")',
      'button:has(svg)',
      'header button'
    ];

    let themeSwitcher = null;
    for (const selector of themeSwitcherSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          themeSwitcher = element;
          console.log(`✅ 找到 ThemeSwitcher: ${selector}`);
          break;
        }
      } catch (e) {
        // 繼續嘗試下一個選擇器
      }
    }

    if (!themeSwitcher) {
      // 如果找不到，拍攝頁面截圖同 HTML
      console.log('❌ 找不到 ThemeSwitcher，拍攝診斷信息...');

      // 拍攝截圖
      await page.screenshot({ path: 'test-results/theme-switcher-debug.png', fullPage: true });
      console.log('📸 已拍攝截圖: test-results/theme-switcher-debug.png');

      // 獲取 header HTML
      const headerHtml = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header ? header.innerHTML : 'No header found';
      });
      console.log('📋 Header HTML:', headerHtml.substring(0, 500));

      // 獲取所有 button
      const allButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.map((b, i) => `${i}: ${b.textContent?.substring(0, 50)}`);
      });
      console.log('📋 所有 Buttons:', allButtons);

      throw new Error('找不到 ThemeSwitcher 按鈕');
    }

    // 點擊打開主題選擇器
    await themeSwitcher.click();

    // 等待下拉選單出現
    const dropdown = page.locator('div').filter({ hasText: 'Choose Theme' }).first();
    await expect(dropdown).toBeVisible({ timeout: 2000 });

    console.log('✅ 主題選擇器下拉菜單已打開');

    // 獲取當前字體（Default theme）
    const initialFont = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).fontFamily;
    });
    console.log('📝 初始字體:', initialFont);

    // 測試切換到 Blog theme
    const blogThemeButton = page.locator('button').filter({ hasText: 'Blog' }).first();
    await blogThemeButton.click();

    // 等待一下讓變化生效
    await page.waitForTimeout(500);

    // 檢查字體是否改變（應該變成 Georgia）
    const newFont = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).fontFamily;
    });
    console.log('📝 切換後字體:', newFont);

    // 檢查 body class
    const bodyClasses = await page.evaluate(() => {
      return document.body.className;
    });
    console.log('📋 Body classes:', bodyClasses);

    // 檢查 CSS 變數
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        fontFamily: root.style.getPropertyValue('--font-family'),
        fontSize: root.style.getPropertyValue('--font-size'),
        lineHeight: root.style.getPropertyValue('--line-height')
      };
    });
    console.log('🎨 CSS 變數:', cssVariables);

    // 檢查 console 有無錯誤
    const consoleErrors = await page.evaluate(() => {
      return window.__errors || [];
    });

    // 收集 console 訊息
    const messages: string[] = [];
    page.on('console', msg => {
      messages.push(msg.text());
      console.log('📢 Console:', msg.text());
    });

    // 預期 Blog theme 應該有 Georgia 字體
    const expectedBlogFont = 'Georgia, serif';
    const fontChanged = newFont.includes('Georgia') || cssVariables.fontFamily.includes('Georgia');

    if (fontChanged) {
      console.log('✅ 主題切換成功！字體已改變');
    } else {
      console.log('❌ 主題切換失敗！字體無改變');
      console.log('   預期字體:', expectedBlogFont);
      console.log('   實際字體:', newFont);
      console.log('   CSS 變數:', cssVariables);
    }

    expect(fontChanged).toBeTruthy();
  });

  test('直接 URL 訪問 SSR 測試', async ({ page }) => {
    console.log('🌐 開始測試直接 URL 訪問...');

    // 測試直接訪問 installation 頁面
    const directUrl = `${baseUrl}/guide/installation`;
    console.log('📍 訪問 URL:', directUrl);

    await page.goto(directUrl);
    await page.waitForLoadState('networkidle');

    // 檢查頁面標題
    const title = await page.title();
    console.log('📄 頁面標題:', title);

    // 檢查 URL（應該保持不變）
    const currentUrl = page.url();
    console.log('🔗 當前 URL:', currentUrl);

    // 檢查頁面內容是否為 installation 而非首頁
    const pageContent = await page.content();
    const hasInstallationContent = pageContent.includes('Installation') ||
                                  pageContent.includes('installation');

    // 檢查有無首頁內容（唔應該有）
    const hasHomepageContent = pageContent.includes('Leaf') &&
                               pageContent.includes('documentation') &&
                               pageContent.includes('modern');

    console.log('🔍 是否包含 Installation 內容:', hasInstallationContent);
    console.log('🔍 是否包含首頁內容:', hasHomepageContent);

    if (currentUrl.includes('guide/installation') && hasInstallationContent) {
      console.log('✅ SSR 路由正確！直接訪問顯示正確頁面');
    } else {
      console.log('❌ SSR 路由錯誤！直接訪問顯示錯誤頁面');
      console.log('   預期 URL 包含: guide/installation');
      console.log('   實際 URL:', currentUrl);
      console.log('   有 Installation 內容:', hasInstallationContent);
      console.log('   有首頁內容:', hasHomepageContent);
    }

    // 檢查 HTML 源碼
    const htmlSource = await page.evaluate(() => {
      return document.documentElement.outerHTML;
    });

    // 檢查有無特定內容
    const hasGettingStarted = htmlSource.includes('Getting Started') ||
                             htmlSource.includes('Getting started');

    console.log('🔍 是否包含 Getting Started:', hasGettingStarted);

    expect(currentUrl).toContain('guide/installation');
    expect(hasInstallationContent || hasGettingStarted).toBeTruthy();
  });

  test('主題切換 + 導航綜合測試', async ({ page }) => {
    console.log('🔄 綜合測試：主題切換 + 頁面導航...');

    // 先訪問主頁
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');

    // 切換主題
    const themeSwitcher = page.locator('button[aria-label="Switch theme"]').first();
    await themeSwitcher.click();

    const businessThemeButton = page.locator('button').filter({ hasText: 'Business' }).first();
    await businessThemeButton.click();

    await page.waitForTimeout(500);

    // 導航到另一頁
    await page.goto(`${baseUrl}/guide/installation`);
    await page.waitForLoadState('networkidle');

    // 檢查主題是否保持
    const bodyClasses = await page.evaluate(() => {
      return document.body.className;
    });

    console.log('🔄 導航後 body classes:', bodyClasses);

    const hasBusinessTheme = bodyClasses.includes('theme-business');
    console.log('🎯 是否保持 Business theme:', hasBusinessTheme);

    expect(hasBusinessTheme).toBeTruthy();
  });
});

// 設置錯誤收集
if (typeof window !== 'undefined') {
  window.__errors = [];
  window.addEventListener('error', (e) => {
    window.__errors.push(e.message);
  });
}