import puppeteer from 'puppeteer-core';
import path from 'path';

async function main() {
  console.log('🚀 Launching Chrome to verify sculpted corner Nandis...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,900'],
    defaultViewport: { width: 1600, height: 900 },
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));

  // Dismiss permission modal
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Use mouse instead')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1500));

  // Navigate to 93% progress (Historical Timeline / Summit with corner Nandis)
  console.log('🏛️ Navigating to Summit / Historical Timeline milestone (93% progress)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const summitBtn = buttons.find(b => b.textContent && b.textContent.includes('Historical Timeline'));
    if (summitBtn) summitBtn.click();
  });
  await new Promise(r => setTimeout(r, 3500));

  const screenPathSummit = path.resolve('public/corner_nandi_summit_view.png');
  await page.screenshot({ path: screenPathSummit });
  console.log('📸 Captured summit view to:', screenPathSummit);

  await browser.close();
  console.log('✅ Corner Nandi verification complete!');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
