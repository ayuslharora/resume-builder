import { existsSync } from 'node:fs';

// Pinned Chromium binary — matches @sparticuz/chromium-min v148
const CHROMIUM_REMOTE_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v148.0.0/chromium-v148.0.0-pack.tar';

// Common local Chrome paths for dev machines
const LOCAL_CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', // macOS
  '/usr/bin/google-chrome',                                        // Linux
  '/usr/bin/chromium-browser',                                     // Linux (Chromium)
];

function findLocalChrome() {
  const fromEnv = process.env.CHROMIUM_EXECUTABLE_PATH;
  if (fromEnv) return fromEnv;
  return LOCAL_CHROME_PATHS.find(p => existsSync(p)) ?? null;
}

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html, fileName = 'resume' } = req.body ?? {};
  if (!html || typeof html !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid html field' });
  }

  const { default: puppeteerCore } = await import('puppeteer-core');
  const localChrome = findLocalChrome();

  let browser;
  try {
    if (localChrome) {
      // Local dev — use system Chrome with minimal args
      browser = await puppeteerCore.launch({
        executablePath: localChrome,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });
    } else {
      // Production (Vercel Lambda) — use sparticuz chromium
      const { default: chromium } = await import('@sparticuz/chromium-min');
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(CHROMIUM_REMOTE_URL),
        headless: chromium.headless,
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 20000 });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}.pdf"`
    );
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('[api/pdf] handler error:', err);
    res.status(500).json({ error: err.message || String(err) });
  } finally {
    if (browser) await browser.close();
  }
}
