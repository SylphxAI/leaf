import { chromium } from 'playwright';

const RUNS = 3;
const WARMUP_RUNS = 1;

async function measureSite(url, name) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    bundleSize: [],
    timeToInteractive: [],
    firstContentfulPaint: [],
    totalJSHeap: [],
    navigationTiming: [],
  };

  // Warmup
  for (let i = 0; i < WARMUP_RUNS; i++) {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
  }

  // Actual measurements
  for (let i = 0; i < RUNS; i++) {
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');

    // Get performance metrics
    const perfMetrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');

      return {
        timeToInteractive: perf.domInteractive - perf.fetchStart,
        firstContentfulPaint: fcp ? fcp.startTime : 0,
        navigationTiming: perf.duration,
      };
    });

    // Get JS heap size
    const metrics = await page.evaluate(() => {
      if (performance.memory) {
        return {
          totalJSHeap: performance.memory.totalJSHeapSize,
        };
      }
      return { totalJSHeap: 0 };
    });

    // Get bundle size (sum of all JS files)
    const resources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const jsResources = resources.filter(r =>
        r.name.endsWith('.js') && r.transferSize > 0
      );
      return jsResources.reduce((sum, r) => sum + r.transferSize, 0);
    });

    results.bundleSize.push(resources);
    results.timeToInteractive.push(perfMetrics.timeToInteractive);
    results.firstContentfulPaint.push(perfMetrics.firstContentfulPaint);
    results.totalJSHeap.push(metrics.totalJSHeap);
    results.navigationTiming.push(perfMetrics.navigationTiming);

    // Wait between runs
    await page.waitForTimeout(1000);
  }

  await browser.close();

  // Calculate averages
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    name,
    bundleSize: Math.round(avg(results.bundleSize)),
    timeToInteractive: Math.round(avg(results.timeToInteractive)),
    firstContentfulPaint: Math.round(avg(results.firstContentfulPaint)),
    totalJSHeap: Math.round(avg(results.totalJSHeap)),
    navigationTiming: Math.round(avg(results.navigationTiming)),
  };
}

async function runBenchmark() {
  console.log('🚀 Starting runtime benchmark...\n');
  console.log(`Running ${RUNS} iterations (${WARMUP_RUNS} warmup)\n`);

  const leafResults = await measureSite('http://localhost:4173', 'Leaf');
  const vitepressResults = await measureSite('http://localhost:4174', 'VitePress');

  console.log('📊 Results:\n');

  console.log('Bundle Size (transferred):');
  console.log(`  Leaf:      ${(leafResults.bundleSize / 1024).toFixed(2)} KB`);
  console.log(`  VitePress: ${(vitepressResults.bundleSize / 1024).toFixed(2)} KB`);
  console.log(`  Difference: ${((leafResults.bundleSize - vitepressResults.bundleSize) / 1024).toFixed(2)} KB\n`);

  console.log('Time to Interactive:');
  console.log(`  Leaf:      ${leafResults.timeToInteractive} ms`);
  console.log(`  VitePress: ${vitepressResults.timeToInteractive} ms`);
  console.log(`  Difference: ${leafResults.timeToInteractive - vitepressResults.timeToInteractive} ms\n`);

  console.log('First Contentful Paint:');
  console.log(`  Leaf:      ${leafResults.firstContentfulPaint} ms`);
  console.log(`  VitePress: ${vitepressResults.firstContentfulPaint} ms`);
  console.log(`  Difference: ${leafResults.firstContentfulPaint - vitepressResults.firstContentfulPaint} ms\n`);

  console.log('Total JS Heap:');
  console.log(`  Leaf:      ${(leafResults.totalJSHeap / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  VitePress: ${(vitepressResults.totalJSHeap / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Difference: ${((leafResults.totalJSHeap - vitepressResults.totalJSHeap) / 1024 / 1024).toFixed(2)} MB\n`);

  console.log('Navigation Timing:');
  console.log(`  Leaf:      ${leafResults.navigationTiming} ms`);
  console.log(`  VitePress: ${vitepressResults.navigationTiming} ms`);
  console.log(`  Difference: ${leafResults.navigationTiming - vitepressResults.navigationTiming} ms\n`);
}

runBenchmark().catch(console.error);
