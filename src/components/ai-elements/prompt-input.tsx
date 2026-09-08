import type { ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function PromptInput({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: (message: { text?: string }) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.querySelector("textarea") as HTMLTextAreaElement | null;
        if (input?.value.trim()) {
          onSubmit({ text: input.value });
          input.value = "";
        }
      }}
    >
      {children}
    </form>
  );
}

export function PromptInputTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}

export function PromptInputFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mt-2 flex items-center justify-end gap-2", className)}>{children}</div>
  );
}

export function PromptInputSubmit({ disabled, status }: { disabled?: boolean; status?: string }) {
  const isStreaming = status === "streaming" || status === "submitted";
  return (
    <button
      type="submit"
      disabled={disabled || isStreaming}
      className="btn-base btn-primary hover:btn-primary-hover h-10 px-4 text-sm disabled:opacity-50"
    >
      {isStreaming ? "..." : "Send"}
    </button>
  );
}
