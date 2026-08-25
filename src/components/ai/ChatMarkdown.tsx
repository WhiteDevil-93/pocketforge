// ============================================================================
// PocketForge — Markdown renderer for assistant chat bubbles
// ============================================================================
//
// Assistant replies are domain-shaped for markdown (damage rolls, EV spreads,
// and set comparisons read naturally as tables/lists), but nothing in the app
// rendered it — model output containing **bold**/tables/lists showed up as
// literal characters. Only assistant bubbles use this; user bubbles stay
// plain text (ChatPanel.tsx). remark-gfm adds table/strikethrough/task-list
// support, which plain react-markdown doesn't include by default.

import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components: Components = {
  p: ({ children }) => <p className="whitespace-pre-wrap [&:not(:first-child)]:mt-2">{children}</p>,
  ul: ({ children }) => <ul className="my-1 list-disc space-y-0.5 pl-4">{children}</ul>,
  ol: ({ children }) => <ol className="my-1 list-decimal space-y-0.5 pl-4">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-primary underline underline-offset-2"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-body-medium">{children}</strong>,
  // h1-h6 collapse to one bold-paragraph treatment — a chat bubble is not a
  // document, so a full heading scale would look out of place at this size.
  h1: ({ children }) => <p className="mt-2 font-body-medium">{children}</p>,
  h2: ({ children }) => <p className="mt-2 font-body-medium">{children}</p>,
  h3: ({ children }) => <p className="mt-2 font-body-medium">{children}</p>,
  h4: ({ children }) => <p className="mt-2 font-body-medium">{children}</p>,
  // react-markdown v9+ dropped the `inline` prop on `code` — a fenced block is
  // always structurally <pre><code>, so styling `pre` for the block case and
  // `code` for the (also-applies-inline) monospace/tint is enough without it.
  pre: ({ children }) => (
    <pre className="my-1 overflow-x-auto rounded-lg bg-bg-elevated p-2 font-jetbrains-mono text-[12px]">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded bg-bg-elevated px-1 py-0.5 font-jetbrains-mono text-[12px]">
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="my-1 overflow-x-auto">
      <table className="border-collapse text-[12px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border-subtle px-2 py-1 text-left font-body-medium">{children}</th>
  ),
  td: ({ children }) => <td className="border border-border-subtle px-2 py-1">{children}</td>,
};

export default function ChatMarkdown({ children }: { children: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </Markdown>
  );
}
