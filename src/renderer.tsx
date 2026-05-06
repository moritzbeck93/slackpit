import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Message } from "slack-blocks-to-jsx";

const LOGO_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Crect width='36' height='36' rx='8' fill='%234A154B'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-size='18' fill='white'%3ES%3C/text%3E%3C/svg%3E";

export function renderBlocks(blocks: unknown[]): string {
  const element = React.createElement(Message, {
    blocks: blocks as any,
    logo: LOGO_SVG,
    name: "Slackpit",
    theme: "dark",
  });

  return renderToStaticMarkup(element);
}
