import { test, expect } from '@playwright/test';

const baseUrl = 'https://leaf.sylphx.com';

test('檢查 CSS 變數和樣式', async ({ page }) => {
  console.log('🔍 檢查 CSS 變數和樣式...');

  await page.goto(`${baseUrl}/`);
  await page.waitForLoadState('networkidle');

  // 檢查 CSS 變數是否定義
  const cssVariables = await page.evaluate(() => {
    const root = document.documentElement;
    const computedStyle = window.getComputedStyle(root);

    return {
      // 檢查 computed values
      computed: {
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
        lineHeight: computedStyle.lineHeight,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor
      },

      // 檢查 CSS 變數值
      variables: {
        fontFamily: getComputedStyle(root).getPropertyValue('--font-family'),
        fontSize: getComputedStyle(root).getPropertyValue('--font-size'),
        lineHeight: getComputedStyle(root).getPropertyValue('--line-height')
      },

      // 檢查 style 屬性
      style: {
        fontFamily: root.style.getPropertyValue('--font-family'),
        fontSize: root.style.getPropertyValue('--font-size'),
        lineHeight: root.style.getPropertyValue('--line-height')
      },

      // 檢查 CSS 規則
      cssRules: (() => {
        const rules = [];
        try {
          const styleSheets = Array.from(document.styleSheets);
          for (const sheet of styleSheets) {
            try {
              const cssRules = Array.from(sheet.cssRules || []);
              for (const rule of cssRules) {
                if (rule.cssText.includes('--font-family') ||
                    rule.cssText.includes(':root') ||
                    rule.cssText.includes('theme-')) {
                  rules.push(rule.cssText);
                }
              }
            } catch (e) {
              // 跨域 CSS 無法讀取
            }
          }
        } catch (e) {
          console.log('Cannot access CSS rules:', e);
        }
        return rules;
      })()
    };
  });

  console.log('📊 Computed styles:', cssVariables.computed);
  console.log('📊 CSS variables:', cssVariables.variables);
  console.log('📊 Style properties:', cssVariables.style);
  console.log('📊 CSS rules count:', cssVariables.cssRules.length);

  // 顯示前幾個 CSS 規則
  if (cssVariables.cssRules.length > 0) {
    console.log('📋 Sample CSS rules:');
    cssVariables.cssRules.slice(0, 3).forEach((rule, i) => {
      console.log(`  ${i}: ${rule.substring(0, 100)}...`);
    });
  }

  // 點擊 Blog 主題並檢查變化
  console.log('\n🎨 測試 Blog 主題切換...');

  // 點擊主題切換器
  await page.locator('button[aria-label="Switch theme"]').click();
  await page.waitForTimeout(500);

  // 點擊 Blog
  await page.locator('button:has-text("Blog")').click();
  await page.waitForTimeout(1000);

  // 再次檢查樣式
  const afterThemeChange = await page.evaluate(() => {
    const root = document.documentElement;
    return {
      bodyClass: document.body.className,
      rootClass: root.className,
      variables: {
        fontFamily: getComputedStyle(root).getPropertyValue('--font-family'),
        fontSize: getComputedStyle(root).getPropertyValue('--font-size'),
        lineHeight: getComputedStyle(root).getPropertyValue('--line-height')
      },
      style: {
        fontFamily: root.style.getPropertyValue('--font-family'),
        fontSize: root.style.getPropertyValue('--font-size'),
        lineHeight: root.style.getPropertyValue('--line-height')
      },
      computed: {
        fontFamily: window.getComputedStyle(root).fontFamily,
        fontSize: window.getComputedStyle(root).fontSize,
        lineHeight: window.getComputedStyle(root).lineHeight
      }
    };
  });

  console.log('📋 主題切換後:');
  console.log(`  Body class: "${afterThemeChange.bodyClass}"`);
  console.log(`  Root class: "${afterThemeChange.rootClass}"`);
  console.log('  CSS variables:', afterThemeChange.variables);
  console.log('  Style properties:', afterThemeChange.style);
  console.log('  Computed styles:', afterThemeChange.computed);

  // 檢查預期值
  const expectedGeorgia = 'Georgia, serif';
  const hasGeorgia =
    afterThemeChange.style.fontFamily.includes('Georgia') ||
    afterThemeChange.computed.fontFamily.includes('Georgia');

  console.log(`🎯 是否包含 Georgia 字體: ${hasGeorgia}`);

  // 截圖
  await page.screenshot({ path: 'test-results/css-debug.png', fullPage: true });
});