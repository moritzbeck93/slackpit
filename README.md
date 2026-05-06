# Slackpit - Slack message testing for developers

Slackpit is a small, zero-configuration Slack message testing tool & API for developers.

It captures Slack API calls during development and displays them in a web UI with full [Block Kit](https://api.slack.com/block-kit) rendering. No messages are sent to real Slack — everything stays local.

Slackpit is inspired by [Mailpit](https://github.com/axllent/mailpit) which does the same for email.

![Slackpit UI](https://github.com/moritzbeck93/slackpit/assets/screenshot.png)

## Features

- Runs entirely from a single static binary
- Modern web UI to view captured Slack messages with full Block Kit rendering (headers, sections, actions, context, dividers, markdown formatting)
- REST API for automated integration testing
- Real-time web UI updates using polling for new messages
- Optional browser notifications for new messages
- Message type badges (DM, Channel, Webhook)
- Dark theme matching Slack's interface
- Configurable port via CLI flag or environment variable

## Installation

The Slackpit web UI listens by default on `http://0.0.0.0:9025` and the API on the same port.

Slackpit runs as a single binary and can be installed in different ways:

### Install via Homebrew (Mac & Linux)

```bash
brew install moritzbeck93/tap/slackpit
```

To run automatically in the background:

```bash
brew services start slackpit
```

### Build from source

```bash
git clone https://github.com/moritzbeck93/slackpit.git
cd slackpit
bun install
npm run build:release
./dist/slackpit
```

## Usage

```
slackpit [options]

Options:
  -p, --port <port>  Port for UI and API (default: 9025, env: SLACKPIT_PORT)
  -v, --version      Show version
  -h, --help         Show help
```

If installed using Homebrew, you may run `brew services start slackpit` to always run slackpit automatically in the background.

## Configuration

| Flag / Env Variable | Default | Description |
|---|---|---|
| `-p, --port` / `SLACKPIT_PORT` | `9025` | Port for both UI and API |

## Sending messages to Slackpit

Configure your application to POST Slack messages to Slackpit instead of the real Slack API:

```bash
curl -X POST http://localhost:9025/api/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "type": "dm",
    "to": "user@example.com",
    "text": "Hello!",
    "blocks": [
      { "type": "section", "text": { "type": "mrkdwn", "text": "*Bold* message" } }
    ]
  }'
```

## API

### `POST /api/v1/messages`

Send a message to Slackpit.

```json
{
  "type": "dm",
  "to": "user@example.com",
  "text": "Hello!",
  "blocks": [...],
  "metadata": {}
}
```

| Field | Required | Description |
|---|---|---|
| `type` | Yes | `"dm"`, `"channel"`, or `"webhook"` |
| `to` | Yes | Recipient (email, channel name, or webhook URL) |
| `text` | No | Plain text fallback |
| `blocks` | No | Slack Block Kit blocks array |
| `metadata` | No | Additional metadata object |

### `GET /api/v1/messages`

List all captured messages.

### `GET /api/v1/messages/:id`

Get a single message by ID.

### `DELETE /api/v1/messages`

Clear all messages.

### `GET /api/v1/health`

Health check endpoint.

```json
{ "status": "ok", "version": "0.1.0", "messages": 5 }
```

## Supported Block Kit elements

- Header blocks
- Section blocks (with text, fields, and accessories)
- Divider blocks
- Actions blocks (buttons, selects, overflow menus)
- Context blocks (text and images)
- Image blocks
- Mrkdwn formatting (bold, italic, strikethrough, code, links, blockquotes, lists, emoji)

## Programmatic usage

Slackpit can also be used as a library:

```typescript
import { createServer } from "slackpit";

const { app, storage, port } = createServer({ port: 9025 });
app.listen(port);
```

## Comparison with Mailpit

| | Mailpit | Slackpit |
|-|---------|----------|
| **Captures** | Emails (SMTP) | Slack messages (HTTP) |
| **Protocol** | SMTP server | REST API |
| **UI** | HTML email viewer | Slack Block Kit renderer |
| **Storage** | SQLite | In-memory |
| **Background** | `brew services start mailpit` | `brew services start slackpit` |

## License

MIT
