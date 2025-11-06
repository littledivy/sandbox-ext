import { desktop } from "../main.ts";
import { Sandbox } from "jsr:@deno/sandbox";

await using sandbox = await Sandbox.create({
  memoryMb: 3 * 1024,
});

const url = await desktop(sandbox);
console.log(url);
