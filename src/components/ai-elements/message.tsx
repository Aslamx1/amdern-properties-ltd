import type { ReactNode } from "react";
import { type UIMessage } from "ai";

export function Message({
  children,
  from,
}: {
  children: ReactNode;
  from: "user" | "assistant" | "system";
}) {
  if (from === "system") return null;
  return (
    <div className={`flex ${from === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          from === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-surface-1 text-foreground-strong"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function MessageContent({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function MessageResponse({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
