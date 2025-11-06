import { desktop } from "../main.ts";
import { Sandbox } from "jsr:@deno/sandbox";

await using sandbox = await Sandbox.create({
  memoryMb: 3 * 1024,
});

const s = await sandbox.vscode();

const url = await desktop(sandbox);
console.log(url);

await s.status;
