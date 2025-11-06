# `sandbox-ext`

Good stuff for Deno Deploy Sandboxes.

## Launch a chromium instance with remote CDP control

```ts
import { chromium } from "jsr:@divy/sandbox-ext";

const browser = await chromium(sandbox);
await browser.newPage("https://littledivy.com");

await browser.close();
```

## Create a new desktop enviornment with a VNC viewer

```ts
import { desktop } from "jsr:@divy/sandbox-ext";

const vncUrl = await desktop(sandbox);
console.log(`Desktop VNC: ${vncUrl}`);
```
