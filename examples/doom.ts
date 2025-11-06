import { apt, desktop } from "../main.ts";
import { Sandbox } from "jsr:@deno/sandbox";

await using sandbox = await Sandbox.create({
  memoryMb: 3 * 1024,
});

const s = await sandbox.vscode();

const url = await desktop(sandbox);
await apt(sandbox, "chocolate-doom");
await sandbox.sh`DISPLAY=:1 /usr/games/doom &`;
console.log("Play doom at", url);

await s.status;
