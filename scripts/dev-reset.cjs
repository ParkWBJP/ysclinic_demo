const { spawnSync } = require("node:child_process");

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
  });
  return result.status ?? 0;
}

// Windows local helper: clear stale Node dev servers first.
run("taskkill", ["/F", "/IM", "node.exe"]);

process.exit(run("npm", ["run", "dev"]));
