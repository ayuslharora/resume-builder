import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  // Wait a bit for React to render
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const content = await page.evaluate(() => {
    return {
      rootVisible: window.getComputedStyle(document.getElementById('root')).display !== 'none',
      html: document.body.innerHTML.substring(0, 500),
      consoleErrors: window.errors || []
    }
  });
  console.log(content);
  await browser.close();
})();
