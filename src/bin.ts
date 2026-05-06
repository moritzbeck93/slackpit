#!/usr/bin/env node
import { startServer } from "./server";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log("0.1.0");
  process.exit(0);
}

if (args.includes("--help") || args.includes("-h")) {
  console.log(`slackpit v0.1.0 - Slack message testing tool for developers

Usage: slackpit [options]

Options:
  -p, --port <port>  Port for UI and API (default: 9025, env: SLACKPIT_PORT)
  -v, --version      Show version
  -h, --help         Show this help

UI:   http://localhost:<port>
API:  http://localhost:<port>/api/v1/messages`);
  process.exit(0);
}

const portFlag = args.indexOf("--port") !== -1 ? args.indexOf("--port") : args.indexOf("-p");
const port = portFlag !== -1 ? Number(args[portFlag + 1]) : undefined;

startServer({ port });
