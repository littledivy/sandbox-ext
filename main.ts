import { Sandbox } from "jsr:@deno/sandbox";
import { connect } from "jsr:@astral/astral";

const _internalState = Symbol("_sandboxExt");

// Initializing sandbox takes time right now but should be pretty fast when Deploy supports mounting external volumes.
async function initializeSandbox(sandbox: Sandbox) {
  if (typeof sandbox[_internalState] == "object") return;

  await sandbox
    .sh`sudo apt-get update && sudo apt-get -y install x11vnc xvfb fluxbox novnc python3-websockify python3-numpy xterm`;

  sandbox[_internalState] = {
    desktop: null,
  };
}

export async function chromium(sandbox: Sandbox) {
  await initializeSandbox(sandbox);
  // TODO: Add an option to run headless.
  //
  // Running with a desktop env makes sense for AI agents use case they would want to
  // show whats happening in the browser to the user and also allow them to control it via VNC.
  const desktopUrl = await desktop(sandbox);

  await sandbox
    .sh`sudo DEBIAN_FRONTEND=noninteractive apt-get -y install chromium`;

  await sandbox.sh`
		DISPLAY=:1 chromium \
			--remote-debugging-port=9222 \
			--no-sandbox \
			--disable-dev-shm-usage \
			--disable-gpu \
			--disable-software-rasterizer \
			--remote-allow-origins=* \
			--window-size=1280,800 \
      --start-maximized \
      --no-zygote &`;

  await new Promise((r) => setTimeout(r, 2000)); // ts is fine
  const url = await sandbox.exposeHttp({
    port: 9222,
  });

  console.log("Chrome", url);
  console.log("Desktop", desktopUrl);
  return await connect({ endpoint: url.replace("https", "wss") });
}

export async function apt(sandbox: Sandbox, pkg: string) {
  await initializeSandbox(sandbox);
  await sandbox
    .sh`sudo DEBIAN_FRONTEND=noninteractive apt-get -y install ${pkg}`;
}

export async function desktop(sandbox: Sandbox) {
  await initializeSandbox(sandbox);

  if (sandbox[_internalState]?.desktop == null) {
    await sandbox.sh`
export DISPLAY=:1
Xvfb $DISPLAY -screen 0 1024x768x16 &
sleep 2
fluxbox &
x11vnc -display $DISPLAY -bg -forever -nopw -listen localhost -xkb &
websockify -D --web=/usr/share/novnc/ --cert=/home/ubuntu/novnc.pem 6080 localhost:5900
`;
    sandbox[_internalState].desktop = await sandbox.exposeHttp({ port: 6080 });
  }

  return sandbox[_internalState].desktop;
}
