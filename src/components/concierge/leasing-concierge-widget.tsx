"use client";

import { useState } from "react";
import { MessageSquare, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { ConciergeReply } from "@/lib/concierge/schema";

interface ChatMessage {
  role: "visitor" | "assistant";
  text: string;
}

export function LeasingConciergeWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi! Ask me about furnished NYC buildings, layouts, amenities, or share your email to connect with our leasing team.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [moveInDate, setMoveInDate] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || sending) return;

    setSending(true);
    setErrorMessage(null);
    setMessages(prev => [...prev, { role: "visitor", text: message }]);
    setDraft("");

    try {
      const response = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          lead: leadEmail.trim()
            ? { email: leadEmail.trim(), moveInDate: moveInDate.trim() || undefined }
            : undefined,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        data?: ConciergeReply;
        error?: string;
      };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error || "Unable to send message");
      }
      setMessages(prev => [...prev, { role: "assistant", text: payload.data!.answer }]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open ? (
        <Card className="w-80 shadow-xl sm:w-96">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold">24/7 Leasing Concierge</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Close leasing concierge"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-60 space-y-2 overflow-y-auto pr-1 text-xs">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={
                    msg.role === "visitor"
                      ? "ml-6 rounded-lg bg-primary px-3 py-2 text-primary-foreground"
                      : "mr-6 rounded-lg bg-muted px-3 py-2 text-foreground"
                  }
                >
                  {msg.text}
                </div>
              ))}
            </div>
            {errorMessage ? <p className="text-xs text-destructive">{errorMessage}</p> : null}
            <form onSubmit={handleSend} className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <Input
                  type="email"
                  value={leadEmail}
                  onChange={e => setLeadEmail(e.target.value)}
                  placeholder="Email (optional)"
                  aria-label="Contact email"
                  className="h-8 text-xs"
                />
                <Input
                  type="date"
                  value={moveInDate}
                  onChange={e => setMoveInDate(e.target.value)}
                  aria-label="Target move-in date"
                  className="h-8 text-xs"
                />
              </div>
              <div className="flex gap-1.5">
                <Input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder="Ask about residences..."
                  aria-label="Ask leasing concierge"
                  className="h-9 text-xs"
                />
                <Button type="submit" size="sm" disabled={sending || !draft.trim()}>
                  {sending ? "..." : "Ask"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button type="button" onClick={() => setOpen(true)} className="shadow-lg">
          <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
          Leasing Concierge
        </Button>
      )}
    </div>
  );
}
