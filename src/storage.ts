export interface SlackpitMessage {
  id: string;
  timestamp: string;
  type: "dm" | "channel" | "webhook";
  to: string;
  text: string;
  blocks?: unknown[];
  metadata?: Record<string, unknown>;
}

export class SlackpitStorage {
  private messages: SlackpitMessage[] = [];

  addMessage(input: Omit<SlackpitMessage, "id" | "timestamp">): SlackpitMessage {
    const message: SlackpitMessage = {
      ...input,
      id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
      timestamp: new Date().toISOString(),
    };
    this.messages.push(message);
    return message;
  }

  getMessages(): SlackpitMessage[] {
    return [...this.messages].reverse();
  }

  getMessageById(id: string): SlackpitMessage | undefined {
    return this.messages.find((m) => m.id === id);
  }

  clear(): void {
    this.messages = [];
  }

  count(): number {
    return this.messages.length;
  }
}
