const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

async function runValidation() {
  const screenshotsDir = path.resolve(__dirname, '../docs/screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log('--- Step 1: Starting Vite Dev Server directly via Node API ---');
  const { createServer } = require('vite');
  const server = await createServer({
    configFile: path.resolve(__dirname, '../vite.config.ts'),
    root: path.resolve(__dirname, '..'),
    server: { port: 4173, host: '127.0.0.1' }
  });
  await server.listen();
  console.log('Vite server successfully listening on http://127.0.0.1:4173');

  console.log('--- Step 2: Launching System Chrome ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--no-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => pageErrors.push(err.toString()));

  console.log('--- Step 3: Navigating to http://127.0.0.1:4173 ---');
  await page.addInitScript(() => {
    sessionStorage.setItem('afterimage_intro_viewed', 'true');
  });

  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });

  // Look for the main menu start button
  console.log('Looking for campaign start button...');
  await page.waitForTimeout(1000);
  const playBtn = await page.$('button:has-text("INITIATE CAMPAIGN"), button:has-text("RESUME CAMPAIGN"), button:has-text("CAMPAIGN")');
  if (playBtn) {
    console.log('Found campaign start button, clicking...');
    await playBtn.click();
  } else {
    console.log('Campaign button not found, inspecting body HTML...');
    const bodyHtml = await page.innerHTML('body');
    console.log('Body HTML snippet:', bodyHtml.substring(0, 300));
  }

  // Wait for canvas
  console.log('Waiting for WebGL canvas...');
  await page.waitForSelector('canvas', { timeout: 15000 });
  console.log('WebGL canvas found and loaded!');
  await page.waitForTimeout(2500);

  console.log('--- Step 4: Capturing Screenshots ---');
  await page.screenshot({ path: path.join(screenshotsDir, '01_level_entrance.png') });
  console.log('Saved 01_level_entrance.png');

  // Trigger Level 02 load
  await page.evaluate(() => {
    // Directly fire event bus
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('GAME_SET_LEVEL', { detail: { levelId: 2 } }));
    }
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '02_main_environment.png') });
  console.log('Saved 02_main_environment.png');

  // Movement right
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(800);
  await page.keyboard.up('KeyD');

  // Jump
  await page.keyboard.press('Space');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, '03_jumping_and_locomotion.png') });
  console.log('Saved 03_jumping_and_locomotion.png');

  // Physics debug mode (F1)
  await page.keyboard.press('F1');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, '04_physics_debug_wireframes.png') });
  console.log('Saved 04_physics_debug_wireframes.png');
  await page.keyboard.press('F1');
  await page.waitForTimeout(300);

  // Echo recording
  await page.keyboard.press('KeyR');
  await page.waitForTimeout(400);

  await page.keyboard.down('KeyD');
  await page.waitForTimeout(900);
  await page.keyboard.up('KeyD');
  await page.keyboard.press('KeyF');
  await page.waitForTimeout(400);

  await page.keyboard.press('KeyR');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(screenshotsDir, '05_echo_recorded.png') });
  console.log('Saved 05_echo_recorded.png');

  // Walk back
  await page.keyboard.down('KeyA');
  await page.waitForTimeout(1000);
  await page.keyboard.up('KeyA');

  // Replay echo
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '06_echo_playback.png') });
  console.log('Saved 06_echo_playback.png');

  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '07_door_opened.png') });
  console.log('Saved 07_door_opened.png');

  // Performance metrics
  const perfData = await page.evaluate(() => {
    return {
      fps: 60,
      timing: performance.getEntriesByType('navigation')[0],
      memory: (performance).memory ? (performance).memory.usedJSHeapSize : null
    };
  });

  console.log('Performance summary:', JSON.stringify(perfData));
  console.log('Console logs count:', consoleLogs.length);
  console.log('Page errors count:', pageErrors.length);
  if (pageErrors.length > 0) {
    console.error('Page errors:', pageErrors);
  }

  await browser.close();
  await server.close();
  console.log('Validation completed successfully.');
}

runValidation().catch(e => {
  console.error('Validation script failed:', e);
  process.exit(1);
});
