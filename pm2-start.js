const { spawn } = require("child_process");

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const child = spawn(npm, ["run", "start"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("close", (code) => process.exit(code));
