import { chromium } from "../main.ts";
import { Sandbox } from "jsr:@deno/sandbox";

await using sandbox = await Sandbox.create({
  memoryMb: 3 * 1024,
});
const vscode = await sandbox.vscode();

const browser = await chromium(sandbox);

const page = await browser.newPage("http://example.com");
console.log(await page.evaluate(() => document.title));

await vscode.status;
