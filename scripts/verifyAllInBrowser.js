import puppeteer from 'puppeteer-core';
import path from 'path';

async function main() {
  console.log('🚀 Launching Chrome with puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,900'],
    defaultViewport: { width: 1600, height: 900 },
  });

  const page = await browser.newPage();
  console.log('🌐 Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  // Wait for 3D canvas and components to mount
  await new Promise(r => setTimeout(r, 3000));

  // 1. Dismiss the modal by clicking "Use mouse instead"
  console.log('👆 Dismissing entrance permission modal...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && text.includes('Use mouse instead')) {
      await b.click();
      console.log('   Clicked "Use mouse instead"');
      break;
    }
  }

  await new Promise(r => setTimeout(r, 2000));

  // 2. Capture Chapter 1 (Entrance Gopuram matching entrance.jpg)
  const screen1Path = path.resolve('public/chapter1_entrance_verified.png');
  await page.screenshot({ path: screen1Path });
  console.log('📸 Captured Chapter 1 entrance to:', screen1Path);

  // 3. Jump to Chapter 5 (Garbhagriha Sanctum with Maha Lingam matching lingam.jpg)
  console.log('🏛️ Navigating to Garbhagriha Sanctum (72% progress)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const sanctumBtn = buttons.find(b => b.textContent && b.textContent.includes('Garbhagriha Sanctum'));
    if (sanctumBtn) {
      sanctumBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 3500));

  const screenSanctumPath = path.resolve('public/chapter5_garbhagriha_lingam_verified.png');
  await page.screenshot({ path: screenSanctumPath });
  console.log('📸 Captured Chapter 5 Garbhagriha Lingam to:', screenSanctumPath);

  // 4. Jump to Chapter 6 (Granite Monoliths - Unobstructed Nandi Bull)
  console.log('🐂 Navigating to Granite Monoliths (85% progress)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const nandiBtn = buttons.find(b => b.textContent && b.textContent.includes('Granite Monoliths'));
    if (nandiBtn) {
      nandiBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 3500));

  const screenNandiPath = path.resolve('public/chapter6_unobstructed_nandi_verified.png');
  await page.screenshot({ path: screenNandiPath });
  console.log('📸 Captured Chapter 6 Unobstructed Nandi to:', screenNandiPath);

  // 5. Open the Photo Modal for Lingam
  console.log('🖼️ Navigating back to Sanctum and opening Photo Modal for Peruvudaiyar Maha Lingam...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const sanctumBtn = buttons.find(b => b.textContent && b.textContent.includes('Garbhagriha Sanctum'));
    if (sanctumBtn) sanctumBtn.click();
  });
  await new Promise(r => setTimeout(r, 2500));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const viewPhotoBtn = buttons.find(b => b.textContent && b.textContent.toLowerCase().includes('sanctum photo'));
    if (viewPhotoBtn) {
      viewPhotoBtn.click();
    } else {
      // Fallback: look for hotspot or gallery button
      const galBtn = buttons.find(b => b.textContent && b.textContent.includes('GALLERY'));
      if (galBtn) galBtn.click();
    }
  });

  await new Promise(r => setTimeout(r, 2000));

  const screenModalPath = path.resolve('public/lingam_photo_modal_verified.png');
  await page.screenshot({ path: screenModalPath });
  console.log('📸 Captured Photo Modal with lingam.jpg to:', screenModalPath);

  await browser.close();
  console.log('✅ All screenshots captured and browser closed successfully!');
}

main().catch(err => {
  console.error('❌ Error during browser verification:', err);
  process.exit(1);
});
