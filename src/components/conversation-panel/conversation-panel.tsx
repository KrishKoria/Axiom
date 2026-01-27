"use client";

import { useState, useRef, useEffect } from "react";
import { SendIcon, SparklesIcon, UserIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type MessageRole = "user" | "assistant";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
}

interface ConversationPanelProps {
  isThinking?: boolean;
  onSend?: (message: string) => void;
}

function MessageBubble({
  message,
  isLatest,
}: {
  message: Message;
  isLatest: boolean;
}) {
  const isAI = message.role === "assistant";

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-3 transition-colors",
        isAI && "bg-muted/30",
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 size-7 rounded-lg flex items-center justify-center",
          isAI
            ? "bg-ai/15 text-ai ring-1 ring-ai/20"
            : "bg-primary/10 text-primary ring-1 ring-primary/20",
        )}
      >
        {isAI ? (
          <SparklesIcon className="size-3.5" />
        ) : (
          <UserIcon className="size-3.5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-xs font-medium",
              isAI ? "text-ai" : "text-primary",
            )}
          >
            {isAI ? "Axiom" : "You"}
          </span>
          {message.isStreaming && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground animate-ai-thinking">
              <Loader2Icon className="size-3 animate-spin" />
              thinking...
            </span>
          )}
        </div>
        <div
          className={cn(
            "text-sm leading-relaxed whitespace-pre-wrap",
            message.isStreaming &&
              isLatest &&
              "after:inline-block after:w-1.5 after:h-4 after:bg-ai after:ml-0.5 after:animate-ai-thinking after:rounded-sm",
          )}
        >
          {message.content}
        </div>
      </div>

      {/* AI glow effect for latest AI message */}
      {isAI && isLatest && !message.isStreaming && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-linear-to-b from-transparent via-ai/50 to-transparent" />
        </div>
      )}
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3 bg-muted/30">
      <div className="shrink-0 size-7 rounded-lg flex items-center justify-center bg-ai/15 text-ai ring-1 ring-ai/20 animate-ai-pulse">
        <SparklesIcon className="size-3.5" />
      </div>
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs font-medium text-ai">Axiom</span>
        <div className="flex gap-1">
          <span
            className="size-1.5 rounded-full bg-ai animate-ai-thinking"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="size-1.5 rounded-full bg-ai animate-ai-thinking"
            style={{ animationDelay: "200ms" }}
          />
          <span
            className="size-1.5 rounded-full bg-ai animate-ai-thinking"
            style={{ animationDelay: "400ms" }}
          />
        </div>
      </div>
    </div>
  );
}

export function ConversationPanel({
  isThinking = false,
  onSend,
}: ConversationPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hey! I'm Axiom, your AI co-founder. What are we building today?",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    onSend?.(input.trim());

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-ai/15 flex items-center justify-center">
            <SparklesIcon className="size-3 text-ai" />
          </div>
          <span className="text-sm font-medium">Conversation</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))}
          {isThinking && <ThinkingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 p-3 border-t border-sidebar-border">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            rows={1}
            className={cn(
              "w-full resize-none rounded-lg border border-input bg-background px-4 py-3 pr-12",
              "text-sm placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ai/50 focus:border-ai/50",
              "transition-all duration-200",
            )}
          />
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!input.trim()}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 size-8 p-0",
              "bg-ai hover:bg-ai/90 text-ai-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            <SendIcon className="size-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground text-center">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
            Shift+Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}
