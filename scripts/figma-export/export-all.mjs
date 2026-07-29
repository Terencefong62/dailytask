import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const FILE_URL =
  "https://www.figma.com/slides/fzzMkZ4FCXIGXeduFtkpZ5/LKK-%E2%80%93-Delivery";
const OUTPUT_DIR = "/workspace/exports";
const LOG_FILE = path.join(OUTPUT_DIR, "export.log");
const PROFILE_SRC = "/home/ubuntu/.config/google-chrome";
const PROFILE_DST = "/tmp/figma-chrome-export";

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + "\n");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function prepareProfile() {
  fs.rmSync(PROFILE_DST, { recursive: true, force: true });
  fs.mkdirSync(path.join(PROFILE_DST, "Default"), { recursive: true });
  for (const f of ["Local State", "Default/Cookies", "Default/Preferences", "Default/Network Persistent State"]) {
    const src = path.join(PROFILE_SRC, f);
    const dst = path.join(PROFILE_DST, f);
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
    }
  }
}

async function tryNativeExport(page) {
  log("Attempting native File > Export slides to PDF...");
  await page.keyboard.press("Escape").catch(() => {});
  await sleep(500);

  // Open main menu via top-left
  await page.mouse.click(20, 20);
  await sleep(1200);

  const fileMenu = page.locator('[role="menuitem"]:has-text("File")').first();
  if (await fileMenu.count()) {
    await fileMenu.click({ timeout: 5000 });
    await sleep(600);
  }

  const exportSelectors = [
    '[role="menuitem"]:has-text("Export slides to")',
    '[role="menuitem"]:has-text("Export all slides")',
    'text=Export slides to',
    'text=Export all slides to PDF',
  ];
  for (const sel of exportSelectors) {
    const item = page.locator(sel).first();
    if (await item.count()) {
      await item.click({ timeout: 8000 });
      await sleep(1500);
      break;
    }
  }

  const pdf = page.locator('text=PDF, [role="radio"]:has-text("PDF"), label:has-text("PDF")').first();
  if (await pdf.count()) await pdf.click().catch(() => {});

  const all = page.locator('text=All slides, label:has-text("All slides")').first();
  if (await all.count()) await all.click().catch(() => {});

  const high = page.locator('text=High, label:has-text("High")').first();
  if (await high.count()) await high.click().catch(() => {});

  const downloadPromise = page.waitForEvent("download", { timeout: 180000 });
  const exportBtn = page.locator('button:has-text("Export")').last();
  await exportBtn.click({ timeout: 20000 });
  const download = await downloadPromise;
  const ext = path.extname(download.suggestedFilename()) || ".pdf";
  const out = path.join(OUTPUT_DIR, `LKK-Delivery${ext}`);
  await download.saveAs(out);
  return out;
}

async function screenshotSlidesToPdf(page) {
  log("Fallback: capturing slides via presentation/screenshots...");
  const shotsDir = path.join(OUTPUT_DIR, "slide-shots");
  fs.mkdirSync(shotsDir, { recursive: true });

  // Enter presentation mode
  await page.keyboard.press("Escape").catch(() => {});
  await sleep(300);
  await page.keyboard.press("Control+Alt+KeyP").catch(() => page.keyboard.press("F5"));
  await sleep(3000);

  const maxSlides = 120;
  const files = [];
  for (let i = 0; i < maxSlides; i++) {
    const shot = path.join(shotsDir, `slide-${String(i + 1).padStart(3, "0")}.png`);
    await page.screenshot({ path: shot, fullPage: false });
    files.push(shot);

    const before = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => "");
    await page.keyboard.press("ArrowRight");
    await sleep(1200);
    const after = await page.evaluate(() => document.body.innerText.slice(0, 500)).catch(() => "");
    if (i > 0 && before === after) {
      fs.unlinkSync(shot);
      files.pop();
      break;
    }
  }

  if (files.length < 2) {
    throw new Error("Presentation mode screenshot capture failed.");
  }

  log(`Captured ${files.length} slide screenshots, building PDF...`);
  const out = path.join(OUTPUT_DIR, "LKK-Delivery.pdf");
  const py = spawnSync(
    "python3",
    [
      "-c",
      `
from PIL import Image
import sys, glob
paths = sorted(glob.glob('${shotsDir}/slide-*.png'))
imgs = [Image.open(p).convert('RGB') for p in paths]
imgs[0].save('${out}', save_all=True, append_images=imgs[1:], resolution=300.0)
print(len(paths))
`,
    ],
    { encoding: "utf-8" }
  );
  if (py.status !== 0) throw new Error(py.stderr || "PDF build failed");
  log(`Built PDF from ${py.stdout.trim()} images`);
  return out;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(LOG_FILE, "");
  prepareProfile();

  log("Launching Chrome with copied profile...");
  const context = await chromium.launchPersistentContext(PROFILE_DST, {
    channel: "chrome",
    headless: false,
    acceptDownloads: true,
    viewport: { width: 1920, height: 1080 },
    args: ["--no-first-run", "--no-default-browser-check", "--disable-dev-shm-usage"],
    timeout: 120000,
  });

  const page = context.pages()[0] ?? (await context.newPage());
  page.setDefaultTimeout(120000);

  log("Loading Figma Slides...");
  await page.goto(FILE_URL, { waitUntil: "domcontentloaded", timeout: 120000 });
  await sleep(10000);

  const url = page.url();
  log(`Current URL: ${url}`);
  if (/login|accounts\.google/i.test(url)) {
    await page.screenshot({ path: path.join(OUTPUT_DIR, "auth-blocked.png") });
    throw new Error("Browser not authenticated to Figma.");
  }

  await page.screenshot({ path: path.join(OUTPUT_DIR, "editor-loaded.png") });

  let out;
  try {
    out = await tryNativeExport(page);
    log(`Native export succeeded: ${out}`);
  } catch (e) {
    log(`Native export failed: ${e.message}`);
    out = await screenshotSlidesToPdf(page);
  }

  const stat = fs.statSync(out);
  log(`DONE ${out} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  await context.close();
  return out;
}

main().catch((err) => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
