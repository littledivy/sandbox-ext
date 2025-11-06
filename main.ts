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

export async function chromium() {
  await initializeSandbox(sandbox);
  // TODO: Add an option to run headless.
  //
  // Running with a desktop env makes sense for AI agents use case they would want to
  // show whats happening in the browser to the user and also allow them to control it via VNC.
  await desktop(sandbox);
}

export async function desktop(sandbox: Sandbox) {
  await initializeSandbox(sandbox);

  if (sandbox[_internalState]?.desktop == null) {
    await sandbox.sh`
export DISPLAY=:1
Xvfb $DISPLAY -screen 0 1024x768x16 &
fluxbox &
x11vnc -display $DISPLAY -bg -forever -nopw -listen localhost -xkb&
websockify -D --web=/usr/share/novnc/ --cert=/home/ubuntu/novnc.pem 6080 localhost:5900
`;
    sandbox[_internalState].desktop = await sandbox.exposeHttp({ port: 6080 });
  }

  return sandbox[_internalState].desktop;
}
