import type { SlackpitMessage } from "./storage";
import { renderBlocks } from "./renderer";
import slackBlocksCss from "./slackBlocksCss";

function getSlackBlocksCss(): string {
  return slackBlocksCss;
}

export function renderUI(messages: SlackpitMessage[]): string {
  const messageCards = messages.map((msg) => renderMessageCard(msg)).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Slackpit</title>
  <style>${getSlackBlocksCss()}</style>
  <style>${getStyles()}</style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-left">
      <h1>📬 Slackpit</h1>
      <span class="version">v0.1.0</span>
    </div>
    <div class="topbar-right">
      <span class="message-count">${messages.length} message${messages.length !== 1 ? "s" : ""}</span>
      <button class="btn btn-clear" onclick="clearMessages()">Clear All</button>
    </div>
  </header>

  <main class="container">
    ${messages.length === 0 ? renderEmptyState() : `<div class="messages">${messageCards}</div>`}
  </main>

  <script>
    async function clearMessages() {
      await fetch('/api/v1/messages', { method: 'DELETE' });
      location.reload();
    }

    let lastCount = ${messages.length};
    setInterval(async () => {
      const res = await fetch('/api/v1/health');
      const data = await res.json();
      if (data.messages !== lastCount) location.reload();
    }, 2000);
  </script>
</body>
</html>`;
}

function renderEmptyState(): string {
  return `
    <div class="empty-state">
      <div class="empty-icon">📭</div>
      <h2>No messages yet</h2>
      <p>Waiting for Slack messages...</p>
      <div class="empty-help">
        <p>Configure your app to POST messages to Slackpit:</p>
        <pre>POST http://localhost:9025/api/v1/messages
Content-Type: application/json

{
  "type": "dm",
  "to": "user@example.com",
  "text": "Hello!",
  "blocks": [...]
}</pre>
      </div>
    </div>`;
}

function renderMessageCard(msg: SlackpitMessage): string {
  const time = new Date(msg.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const date = new Date(msg.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const typeConfig: Record<string, { label: string; cssClass: string; icon: string }> = {
    dm: { label: "Direct Message", cssClass: "badge-dm", icon: "💬" },
    channel: { label: "Channel", cssClass: "badge-channel", icon: "#" },
    webhook: { label: "Webhook", cssClass: "badge-webhook", icon: "🔗" },
  };

  const typeInfo = typeConfig[msg.type] || typeConfig.dm;

  let blocksHtml = "";
  if (msg.blocks && Array.isArray(msg.blocks) && msg.blocks.length > 0) {
    blocksHtml = renderBlocks(msg.blocks);
  } else if (msg.text) {
    blocksHtml = `<div class="fallback-text">${escapeHtml(msg.text)}</div>`;
  }

  return `
    <div class="message-card">
      <div class="message-header">
        <div class="message-meta">
          <span class="type-icon">${typeInfo.icon}</span>
          <span class="badge ${typeInfo.cssClass}">${typeInfo.label}</span>
          <span class="recipient">${escapeHtml(msg.to)}</span>
        </div>
        <span class="timestamp">${date} ${time}</span>
      </div>
      <div class="slack-preview">
        ${blocksHtml}
      </div>
    </div>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function getStyles(): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      background: #1a1d21;
      color: #d1d2d3;
      min-height: 100vh;
    }

    .topbar {
      background: #19171d;
      border-bottom: 1px solid #35373b;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .topbar-left { display: flex; align-items: center; gap: 12px; }
    .topbar-left h1 { font-size: 1.25rem; font-weight: 900; color: #fff; }
    .version { font-size: 0.75rem; color: #9a9b9d; background: #35373b; padding: 2px 8px; border-radius: 4px; }
    .topbar-right { display: flex; align-items: center; gap: 16px; }
    .message-count { font-size: 0.875rem; color: #9a9b9d; }

    .btn { border: none; padding: 6px 12px; border-radius: 4px; font-size: 0.8125rem; font-weight: 700; cursor: pointer; }
    .btn-clear { background: #4a154b; color: #fff; }
    .btn-clear:hover { background: #611f69; }

    .container { max-width: 900px; margin: 0 auto; padding: 24px; }
    .messages { display: flex; flex-direction: column; gap: 16px; }

    .message-card {
      background: #222529;
      border: 1px solid #35373b;
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.15s;
    }
    .message-card:hover { border-color: #4a154b; }

    .message-header {
      padding: 12px 16px;
      border-bottom: 1px solid #35373b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1e2126;
    }

    .message-meta { display: flex; align-items: center; gap: 10px; }
    .type-icon { font-size: 1rem; }

    .badge { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 3px 8px; border-radius: 3px; }
    .badge-dm { background: #1d6d37; color: #b8f0c8; }
    .badge-channel { background: #1264a3; color: #b4d5f0; }
    .badge-webhook { background: #e97a35; color: #fff3e6; }

    .recipient { font-size: 0.875rem; color: #e8e8e8; font-weight: 600; }
    .timestamp { font-size: 0.75rem; color: #9a9b9d; }

    .slack-preview {
      padding: 16px;
      background: #1a1d21;
      border-radius: 0 0 8px 8px;
    }

    .slack-preview #slack_blocks_to_jsx {
      max-width: 100%;
    }

    .slack-preview #slack_blocks_to_jsx > section {
      max-width: 100%;
    }

    .slack-preview .slack_blocks_to_jsx--header {
      display: none;
    }

    .slack-preview #slack_blocks_to_jsx > section > .shrink-0 {
      display: none;
    }

    .fallback-text {
      font-size: 0.9375rem;
      line-height: 1.6;
      color: #d1d2d3;
      white-space: pre-wrap;
    }

    .empty-state { text-align: center; padding: 80px 24px; }
    .empty-icon { font-size: 4rem; margin-bottom: 16px; }
    .empty-state h2 { font-size: 1.5rem; color: #fff; margin-bottom: 8px; }
    .empty-state p { color: #9a9b9d; }
    .empty-help { margin-top: 32px; text-align: left; max-width: 500px; margin-left: auto; margin-right: auto; }
    .empty-help pre { background: #222529; border: 1px solid #35373b; border-radius: 6px; padding: 16px; font-size: 0.8125rem; color: #d1d2d3; overflow-x: auto; margin-top: 12px; }
  `;
}
