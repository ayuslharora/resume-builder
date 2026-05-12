// Pinned Chromium binary — matches @sparticuz/chromium-min v148
const CHROMIUM_REMOTE_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v148.0.0/chromium-v148.0.0-pack.tar';

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

  // Dynamic imports so vercel dev doesn't crash on startup
  const { default: chromium } = await import('@sparticuz/chromium-min');
  const { default: puppeteerCore } = await import('puppeteer-core');

  let browser;
  try {
    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: process.env.CHROMIUM_EXECUTABLE_PATH
        || await chromium.executablePath(CHROMIUM_REMOTE_URL),
      headless: chromium.headless,
    });

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
  } finally {
    if (browser) await browser.close();
  }
}
