"use client";

import {
  CopyIcon,
  HistoryIcon,
  PlusIcon,
  SparklesIcon,
  CheckIcon,
} from "lucide-react";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "../ui/button";
import { DEFAULT_CONVERSATION_TITLE } from "./constants";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "../ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "../ai-elements/prompt-input";
import {
  useConversation,
  useConversations,
  useCreateConversation,
  useMessages,
} from "@/hooks/use-conversation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "../ai-elements/message";
import ky from "ky";
import ThinkingIndicator from "./thinking-indicator";
import { ConversationEmptyState } from "./conversation-empty-state";

interface ConversationPanelProps {
  projectId: Id<"projects">;
}

export function ConversationPanel({ projectId }: ConversationPanelProps) {
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const createConversation = useCreateConversation();

  const conversations = useConversations(projectId);
  const activeConversationId =
    conversationId ?? conversations?.[0]?._id ?? null;

  const activeConversation = useConversation(activeConversationId);
  const conversationMessages = useMessages(activeConversationId);

  const isMessagePending = conversationMessages?.some(
    (msg) => msg.status === "pending",
  );

  const handleCreateConversation = async () => {
    try {
      const newConversationId = await createConversation({
        projectId,
        title: DEFAULT_CONVERSATION_TITLE,
      });
      setConversationId(newConversationId);
      return newConversationId;
    } catch {
      toast.error("Unable to create new conversation");
      return null;
    }
  };

  const handleCopy = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if (isMessagePending && !message.text) {
      setInput("");
      return;
    }

    let conversationId = activeConversationId;

    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) {
        return;
      }
    }

    try {
      await ky.post("/api/messages", {
        json: {
          conversationId,
          message: message.text,
        },
      });
    } catch {
      toast.error("Message failed to send");
    }

    setInput("");
  };

  const hasMessages = conversationMessages && conversationMessages.length > 0;

  return (
    <div className="flex flex-col h-full bg-sidebar relative overflow-hidden">
      {/* Subtle ambient gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-ai/3 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative h-12 flex items-center justify-between border-b bg-sidebar/80 backdrop-blur-sm px-4">
        <div className="flex items-center gap-3">
          <div className="size-6 rounded-md bg-ai/10 flex items-center justify-center ring-1 ring-ai/20">
            <SparklesIcon className="size-3 text-ai" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium truncate max-w-45">
              {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
            onClick={() => {}}
          >
            <HistoryIcon className="size-3.5" />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-muted-foreground hover:text-ai hover:bg-ai/10 transition-all duration-200"
            onClick={handleCreateConversation}
          >
            <PlusIcon className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <Conversation className="flex-1 relative">
        <ConversationContent className="py-6">
          {!hasMessages ? (
            <ConversationEmptyState />
          ) : (
            conversationMessages?.map((message, messageIndex) => (
              <Message key={message._id} from={message.role}>
                <MessageContent>
                  {message.status === "pending" ? (
                    <ThinkingIndicator />
                  ) : message.status === "cancelled" ? (
                    <span className="text-muted-foreground/70 italic text-sm">
                      Request cancelled
                    </span>
                  ) : (
                    <MessageResponse>{message.content}</MessageResponse>
                  )}
                </MessageContent>
                {message.role === "assistant" &&
                  message.status === "completed" &&
                  messageIndex === (conversationMessages?.length ?? 0) - 1 && (
                    <MessageActions>
                      <MessageAction
                        onClick={() => handleCopy(message._id, message.content)}
                        label="Copy"
                        className="transition-all duration-200"
                      >
                        {copiedMessageId === message._id ? (
                          <CheckIcon className="size-3 text-success" />
                        ) : (
                          <CopyIcon className="size-3" />
                        )}
                      </MessageAction>
                    </MessageActions>
                  )}
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input Area */}
      <div className="relative p-4 pt-2">
        <div className="absolute inset-x-0 top-0 h-12 bg-linear-to-t from-sidebar to-transparent pointer-events-none -translate-y-full" />
        <PromptInput
          onSubmit={handleSubmit}
          className="shadow-lg shadow-black/3 dark:shadow-black/20 ring-1 ring-border/50 bg-background/80 backdrop-blur-sm transition-all duration-300 focus-within:ring-ai/30 focus-within:shadow-ai/5"
        >
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Ask anything..."
              onChange={(e) => setInput(e.target.value)}
              value={input}
              disabled={isMessagePending}
              className="placeholder:text-muted-foreground/50"
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit
              disabled={isMessagePending ? false : !input}
              status={isMessagePending ? "streaming" : undefined}
              className="bg-ai hover:bg-ai/90 text-ai-foreground transition-all duration-200 disabled:bg-muted disabled:text-muted-foreground"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
