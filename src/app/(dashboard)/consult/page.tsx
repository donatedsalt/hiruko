"use client";

import { useState } from "react";

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
import { Response } from "@/components/ui/ai/response";
import { Message, MessageContent } from "@/components/ui/ai/message";
import { Suggestion, Suggestions } from "@/components/ui/ai/suggestion";

interface IMessage {
  from: "user" | "assistant" | "system";
  content: string;
}

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompts, _setPrompts] = useState([
    "How do i reduce my expenses?",
    "How do i increase my income?",
    "How do i save for retirement?",
    "What are some good budgeting tips?",
    "What are the best investment strategies?",
  ]);

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);

    const userMessage = { from: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: currentInput }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    const assistantMessage = { from: "assistant" as const, content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((l) => l.trim());

      for (const line of lines) {
        try {
          const { token } = JSON.parse(line);
          assistantMessage.content += token;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMessage };
            return updated;
          });
        } catch {
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleSuggestionClick = async (prompt: string) => {
    setInput(prompt);
    handleSubmit();
  };

  return (
    <>
      <SiteHeader title="Consult" />

      <div className="@container/main flex flex-col flex-1 gap-4 p-4 md:gap-6 md:p-6">
        <Conversation className="relative w-full" style={{ height: "500px" }}>
          <ConversationContent className="px-0">
            {messages.map((message, idx) => (
              <Message key={idx} from={message.from}>
                <MessageContent>
                  {message.from === "assistant" ? (
                    <Response>{message.content}</Response>
                  ) : (
                    message.content
                  )}
                </MessageContent>
              </Message>
            ))}
            {isLoading && messages[messages.length - 1]?.from === "user" && (
              <Message from="assistant">
                <MessageContent>
                  <div className="flex space-x-1">
                    <span className="animate-bounce">.</span>
                    <span className="animate-bounce delay-75">.</span>
                    <span className="animate-bounce delay-150">.</span>
                  </div>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <Suggestions>
          {prompts.map((prompt) => (
            <Suggestion
              key={prompt}
              suggestion={prompt}
              onClick={handleSuggestionClick}
            />
          ))}
        </Suggestions>
        <PromptInput onSubmit={(e) => handleSubmit(e)}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <PromptInputToolbar className="justify-end">
            <PromptInputSubmit disabled={!input.trim() || isLoading} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </>
  );
}
