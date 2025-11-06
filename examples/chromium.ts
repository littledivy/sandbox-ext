import { chromium } from "../main.ts";

await using sandbox = await Sandbox.create({
  memoryMb: 3 * 1024,
});

const browser = await chromium(sandbox);

const page = await browser.newPage("http://example.com");
console.log(await page.evaluate(() => document.title));

await browser.close();
