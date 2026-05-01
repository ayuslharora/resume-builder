import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  try {
    await page.goto('http://localhost:5174/builder/UiizZRqNhLlMfIUNvbiO', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: '/Users/ayush/Desktop/Master_Folder/End-term/resumeforge/error_screenshot.png' });
    console.log("Screenshot saved.");
  } catch(e) {
    console.error('Nav error:', e);
  }
  
  await browser.close();
})();
