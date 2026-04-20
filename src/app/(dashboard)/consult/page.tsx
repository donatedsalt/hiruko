"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useAuth } from "@clerk/nextjs";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ui/ai/conversation";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from "@/components/ui/ai/prompt-input";
import { SiteHeader } from "@/components/site-header";
import { Message, MessageContent } from "@/components/ui/ai/message";
import { Suggestion, Suggestions } from "@/components/ui/ai/suggestion";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";

const Response = dynamic(
  () =>
    import("@/components/ui/ai/response").then((m) => ({
      default: m.Response,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

const SUGGESTIONS = [
  "Build me a monthly budget using the 50/30/20 rule",
  "How big should my emergency fund be, and how do I start one?",
  "Give me 5 concrete ways to cut my grocery bill",
  "Should I pay off high-interest debt or invest first?",
  "Explain compound interest with a realistic savings example",
  "Walk me through choosing between a Roth IRA and a 401(k)",
];

const HISTORY_PREFIX = "chatHistory:";

function historyKey(userId: string | null | undefined) {
  return `${HISTORY_PREFIX}${userId ?? "anon"}`;
}

function loadHistory(userId: string | null | undefined): UIMessage[] {
  try {
    const raw = localStorage.getItem(historyKey(userId));
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function renderText(msg: UIMessage): string {
  return msg.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

export default function Page() {
  const { userId, isLoaded } = useAuth();
  const [input, setInput] = useState("");
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(
    null,
  );

  useEffect(() => {
    if (!isLoaded) return;
    setInitialMessages(loadHistory(userId));
  }, [isLoaded, userId]);

  if (initialMessages === null) {
    return (
      <>
        <SiteHeader title="Consult" />
        <main className="text-muted-foreground flex flex-1 items-center justify-center p-6 text-sm">
          Loading…
        </main>
      </>
    );
  }

  return (
    <Chat
      userId={userId}
      initialMessages={initialMessages}
      input={input}
      setInput={setInput}
    />
  );
}

function Chat({
  userId,
  initialMessages,
  input,
  setInput,
}: {
  userId: string | null | undefined;
  initialMessages: UIMessage[];
  input: string;
  setInput: (v: string) => void;
}) {
  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    try {
      localStorage.setItem(historyKey(userId), JSON.stringify(messages));
    } catch {
      // quota exceeded — ignore
    }
  }, [messages, userId]);

  const isBusy = status === "submitted" || status === "streaming";

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    sendMessage({ text });
    setInput("");
  };

  const handleSuggestionClick = (prompt: string) => {
    if (isBusy) return;
    sendMessage({ text: prompt });
    setInput("");
  };

  const handlePrimaryClick = () => {
    if (status === "streaming" || status === "submitted") stop();
  };

  return (
    <>
      <SiteHeader title="Consult" />

      <main className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        <Conversation className="relative min-h-0 w-full flex-1">
          <ConversationContent className="px-0">
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.role === "assistant" ? (
                    <Response>{renderText(message)}</Response>
                  ) : (
                    renderText(message)
                  )}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" &&
              messages[messages.length - 1]?.role === "user" && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex space-x-1">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce [animation-delay:150ms]">
                        .
                      </span>
                      <span className="animate-bounce [animation-delay:300ms]">
                        .
                      </span>
                    </div>
                  </MessageContent>
                </Message>
              )}
            {status === "error" && (
              <Message from="system">
                <MessageContent>
                  <div className="flex flex-col gap-2">
                    <span>{error?.message ?? "Something went wrong."}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => regenerate()}
                    >
                      <IconRefresh className="size-4" />
                      Retry
                    </Button>
                  </div>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {messages.length === 0 && (
          <Suggestions>
            {SUGGESTIONS.map((prompt) => (
              <Suggestion
                key={prompt}
                suggestion={prompt}
                onClick={handleSuggestionClick}
              />
            ))}
          </Suggestions>
        )}

        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Type your message..."
            disabled={isBusy && status !== "streaming"}
          />
          <PromptInputToolbar className="justify-end">
            <PromptInputSubmit
              status={status}
              disabled={!isBusy && !input.trim()}
              onClick={isBusy ? handlePrimaryClick : undefined}
              type={isBusy ? "button" : "submit"}
            />
          </PromptInputToolbar>
        </PromptInput>
      </main>
    </>
  );
}
