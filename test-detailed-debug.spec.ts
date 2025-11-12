import { test, expect } from '@playwright/test';

const baseUrl = 'https://leaf.sylphx.com';

test.describe('詳細問題診斷', () => {
  test('主題切換完全失效診斷', async ({ page }) => {
    console.log('🔍 詳細診斷主題切換問題...');

    // 訪問主題頁面
    await page.goto(`${baseUrl}/themes.html`);
    await page.waitForLoadState('networkidle');

    // 拍攝初始截圖
    await page.screenshot({ path: 'test-results/initial-themes-page.png', fullPage: true });

    // 檢查是否有 JavaScript 錯誤
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log('❌ JS Error:', msg.text());
      } else {
        console.log(`📢 Console [${msg.type()}]:`, msg.text());
      }
    });

    // 檢查 HTML 結構
    const pageHtml = await page.evaluate(() => {
      return document.documentElement.outerHTML;
    });

    // 檢查是否有 ThemeSwitcher
    const hasThemeSwitcher = pageHtml.includes('Switch theme') ||
                           pageHtml.includes('data-leaf-component') ||
                           pageHtml.includes('theme-') ||
                           pageHtml.includes('aria-label="Switch theme"');

    console.log('📋 頁面包含 ThemeSwitcher:', hasThemeSwitcher);

    // 嘗試找到任何按鈕
    const buttons = await page.evaluate(() => {
      const allButtons = Array.from(document.querySelectorAll('button'));
      return allButtons.map(btn => ({
        text: btn.textContent?.substring(0, 100),
        className: btn.className,
        id: btn.id,
        ariaLabel: btn.getAttribute('aria-label')
      }));
    });

    console.log('📋 所有 Buttons:', JSON.stringify(buttons, null, 2));

    // 檢查是否有 header
    const headerContent = await page.evaluate(() => {
      const header = document.querySelector('header');
      return header ? header.innerHTML.substring(0, 500) : 'No header';
    });
    console.log('📋 Header 內容:', headerContent);

    // 檢查 markdown 內容是否渲染
    const hasLiveThemeSelector = pageHtml.includes('LiveThemeSelector');
    const hasComponentPlaceholder = pageHtml.includes('data-leaf-component');

    console.log('📋 包含 LiveThemeSelector:', hasLiveThemeSelector);
    console.log('📋 包含 Component Placeholder:', hasComponentPlaceholder);

    // 如果找到 theme switcher，嘗試點擊
    if (buttons.length > 0) {
      const themeButton = page.locator('button').first();
      await themeButton.click();
      await page.waitForTimeout(500);

      // 拍攝點擊後截圖
      await page.screenshot({ path: 'test-results/after-click-theme-button.png', fullPage: true });

      console.log('✅ 點擊了第一個 button');
    }

    // 檢查 body classes
    const bodyClasses = await page.evaluate(() => {
      return document.body.className;
    });
    console.log('📋 Body classes:', bodyClasses);

    // 檢查 root classes
    const rootClasses = await page.evaluate(() => {
      return document.documentElement.className;
    });
    console.log('📋 Root classes:', rootClasses);

    // 檢查 computed styles
    const computedStyles = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        fontFamily: window.getComputedStyle(root).fontFamily,
        fontSize: window.getComputedStyle(root).fontSize,
        lineHeight: window.getComputedStyle(root).lineHeight
      };
    });
    console.log('📋 Computed styles:', computedStyles);

    // 檢查 CSS 變數是否設置
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement;
      return {
        fontFamily: root.style.getPropertyValue('--font-family') || 'not set',
        fontSize: root.style.getPropertyValue('--font-size') || 'not set',
        lineHeight: root.style.getPropertyValue('--line-height') || 'not set'
      };
    });
    console.log('📋 CSS variables:', cssVariables);

    expect(errors.length).toBe(0);
  });

  test('SSR /guide 路由飛去首頁診斷', async ({ page }) => {
    console.log('🔍 詳細診斷 /guide 路由問題...');

    await page.goto(`${baseUrl}/guide`);
    await page.waitForLoadState('networkidle');

    // 等待一下，看看是否會重定向
    await page.waitForTimeout(2000);

    // 檢查當前 URL
    const currentUrl = page.url();
    console.log('🔗 當前 URL:', currentUrl);

    // 檢查頁面標題
    const title = await page.title();
    console.log('📄 頁面標題:', title);

    // 檢查頁面內容
    const pageContent = await page.content();

    // 檢查是否有特定內容
    const hasGuideContent = pageContent.includes('guide') ||
                           pageContent.includes('Guide') ||
                           pageContent.includes('Guide');

    const hasHomepageContent = pageContent.includes('Leaf - React Documentation Framework');

    console.log('📋 是否包含 Guide 內容:', hasGuideContent);
    console.log('📋 是否包含首頁內容:', hasHomepageContent);

    // 檢查 H1
    const h1Text = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : 'No H1';
    });
    console.log('📋 H1 內容:', h1Text);

    // 拍攝截圖
    await page.screenshot({ path: 'test-results/guide-redirect-issue.png', fullPage: true });

    // 檢查 HTML 源碼
    const htmlSource = await page.evaluate(() => {
      return document.documentElement.outerHTML.substring(0, 2000);
    });
    console.log('📋 HTML 開頭:', htmlSource);

    // 應該顯示 Guide 頁面，但現在顯示首頁
    expect(currentUrl).toContain('/guide');
    expect(hasGuideContent).toBeTruthy();
    expect(hasHomepageContent).toBeFalsy();
  });

  test('比較 /guide/installation vs /guide', async ({ page }) => {
    console.log('🔍 比較正確 vs 錯誤的路由...');

    // 訪問正確的 URL
    await page.goto(`${baseUrl}/guide/installation`);
    await page.waitForLoadState('networkidle');
    const installationUrl = page.url();
    const installationTitle = await page.title();
    const installationH1 = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : 'No H1';
    });

    console.log('✅ /guide/installation:');
    console.log('   URL:', installationUrl);
    console.log('   Title:', installationTitle);
    console.log('   H1:', installationH1);

    // 訪問錯誤的 URL
    await page.goto(`${baseUrl}/guide`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const guideUrl = page.url();
    const guideTitle = await page.title();
    const guideH1 = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : 'No H1';
    });

    console.log('❌ /guide:');
    console.log('   URL:', guideUrl);
    console.log('   Title:', guideTitle);
    console.log('   H1:', guideH1);

    // 拍攝對比截圖
    await page.screenshot({ path: 'test-results/guide-vs-installation.png', fullPage: true });
  });
});