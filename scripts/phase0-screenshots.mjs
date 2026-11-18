import { mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

// Captures the actual learner route at the three required viewport sizes.
// Inputs must be built HTML artifacts: baseline main and proposed phase-0 build.
const [beforeFile, afterFile, outputDir] = process.argv.slice(2);
if (!beforeFile || !afterFile || !outputDir) {
  throw new Error('Usage: node scripts/phase0-screenshots.mjs BEFORE.html AFTER.html OUTPUT_DIR');
}
const browser = await chromium.launch({ headless: true });
try {
  for (const [size, file] of [['before', beforeFile], ['after', afterFile]]) {
    for (const [width, height] of [[1366,768], [1024,768], [390,844]]) {
      const label = width + 'x' + height;
      const dir = resolve(outputDir, size);
      await mkdir(dir, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height },
        reducedMotion: 'reduce'
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'load' });
      await page.locator('.op1-brand').waitFor();
      await page.screenshot({ path: join(dir, label + '-start.png'), animations: 'disabled' });

      await page.locator('.op1-card[data-action="world-open"][data-world="sport"]').click();
      await page.locator('.instruction-card').waitFor();
      await page.screenshot({ path: join(dir, label + '-exercise.png'), animations: 'disabled' });

      // Mute before completing the round; speech is independently regression-tested.
      await page.locator('[data-action="settings"]').first().click();
      await page.locator('[data-action="sound"]').click();
      await page.locator('[data-action="settings"]').first().click();
      for (let step = 0; step < 5; step++) {
        const item = await page.evaluate(() => window.__zinsbouwerTest.getCurrent());
        if (item.tiles) {
          for (const id of item.solutions[0]) {
            await page.locator('[data-action="tile"][data-id="' + id + '"]').click();
          }
        } else {
          await page.locator('[data-action="ending"][data-ending="' + item.ending + '"]').click();
        }
        await page.locator('[data-action="check"]').click();
        await page.locator('[data-action="next"]').click();
      }
      await page.screenshot({ path: join(dir, label + '-end.png'), animations: 'disabled' });
      if (errors.length) throw new Error(size + '/' + label + ': ' + errors.join(' | '));
      await context.close();
    }
  }
  console.log('Phase 0 screenshots: before/after at 1366x768, 1024x768, 390x844 (start, exercise, end)');
} finally {
  await browser.close();
}
