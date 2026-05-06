import express from "express";
import { SlackpitStorage } from "./storage";
import { renderUI } from "./ui";

export interface SlackpitOptions {
  port?: number;
}

export function createServer(options: SlackpitOptions = {}) {
  const port = options.port || Number(process.env.SLACKPIT_PORT) || 9025;
  const storage = new SlackpitStorage();
  const app = express();

  app.use(express.json({ limit: "1mb" }));

  app.post("/api/v1/messages", (req, res) => {
    const { type, to, text, blocks, metadata } = req.body;

    if (!type || !to) {
      res.status(400).json({ error: "Missing required fields: type, to" });
      return;
    }

    const message = storage.addMessage({ type, to, text: text || "", blocks, metadata });
    res.status(201).json({ id: message.id });
  });

  app.get("/api/v1/messages", (_req, res) => {
    const messages = storage.getMessages();
    res.json({ messages, total: messages.length });
  });

  app.get("/api/v1/messages/:id", (req, res) => {
    const message = storage.getMessageById(req.params.id);
    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    res.json(message);
  });

  app.delete("/api/v1/messages", (_req, res) => {
    storage.clear();
    res.json({ success: true });
  });

  app.get("/", (_req, res) => {
    res.send(renderUI(storage.getMessages()));
  });

  app.get("/api/v1/health", (_req, res) => {
    res.json({ status: "ok", version: "0.1.0", messages: storage.count() });
  });

  return { app, storage, port };
}

export function startServer(options: SlackpitOptions = {}) {
  const { app, port } = createServer(options);

  app.listen(port, () => {
    console.log("");
    console.log("  ┌─────────────────────────────────────────┐");
    console.log("  │                                         │");
    console.log("  │   📬 Slackpit v0.1.0                    │");
    console.log("  │                                         │");
    console.log(`  │   UI:   http://localhost:${port}          │`);
    console.log(`  │   API:  http://localhost:${port}/api/v1   │`);
    console.log("  │                                         │");
    console.log("  └─────────────────────────────────────────┘");
    console.log("");
  });

  return app;
}
