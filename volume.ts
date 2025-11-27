import { Client, Sandbox } from "jsr:@deno/sandbox@0.2.1";
import { apt } from "./main.ts";


const client = new Client();
try {
  await client.volumes.delete("doom-volume");
} catch (err) {
  console.error("Error deleting existing volume:", err);
}

const volume = await client.volumes.create({
  slug: "doom-volume",
  region: "ams",
  capacity: "1GB",
});

await using sandbox = await Sandbox.create({
  memoryMb: 3 * 1024,
	region: "ams",
	volumes: {
    "/data/volume": volume.slug,
  },
});

await apt(sandbox, "chocolate-doom");

await sandbox.sh`cp /usr/games/doom /data/volume/doom`;

await sandbox.sh`ls -la /data/`;
await sandbox.sh`ls -la /data/volume/`;


