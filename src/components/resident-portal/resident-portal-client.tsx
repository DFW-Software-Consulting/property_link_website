"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ResidentPortalOverview } from "@/lib/resident-portal/schema";

function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatUtcDate(iso: string | null): string {
  if (!iso) return "TBD";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "TBD";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

async function postPortalApi<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as { data?: T; error?: string };
  if (!response.ok) {
    throw new Error(payload.error || "Request failed");
  }
  return payload.data as T;
}

export function ResidentPortalClient({ initialToken }: { initialToken?: string }) {
  const [overview, setOverview] = useState<ResidentPortalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [renewalEndDate, setRenewalEndDate] = useState("");
  const [renewalNotes, setRenewalNotes] = useState("");
  const [renewalSubmitted, setRenewalSubmitted] = useState(false);

  async function refreshOverview() {
    const res = await fetch("/api/resident-portal/overview");
    if (!res.ok) {
      setOverview(null);
      return;
    }
    const payload = (await res.json()) as { data?: ResidentPortalOverview };
    setOverview(payload.data ?? null);
  }

  useEffect(() => {
    let active = true;
    async function bootstrap() {
      try {
        if (initialToken) {
          await postPortalApi("/api/resident-portal/verify", { token: initialToken });
        }
        if (active) {
          await refreshOverview();
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to open resident portal");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    void bootstrap();
    return () => {
      active = false;
    };
  }, [initialToken]);

  async function handleRequestLink(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setLinkSent(false);
    try {
      await postPortalApi("/api/resident-portal/request-link", { email });
      setLinkSent(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send link");
    }
  }

  async function handleSignOut() {
    await fetch("/api/resident-portal/logout", { method: "POST" });
    setOverview(null);
  }

  async function handleReplySubmit(requestId: number) {
    const draft = (replyDrafts[requestId] ?? "").trim();
    if (!draft) return;
    await postPortalApi(`/api/resident-portal/maintenance/${requestId}/reply`, { body: draft });
    setReplyDrafts(prev => ({ ...prev, [requestId]: "" }));
    await refreshOverview();
  }

  async function handleRenewalSubmit(event: React.FormEvent) {
    event.preventDefault();
    const primaryStay = overview?.stays[0];
    if (!primaryStay) return;
    await postPortalApi("/api/resident-portal/renewal-request", {
      reservationId: primaryStay.reservationId,
      preferredEndDate: renewalEndDate || undefined,
      notes: renewalNotes || undefined,
    });
    setRenewalSubmitted(true);
    setRenewalNotes("");
  }

  if (loading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Loading resident portal...</p>;
  }

  if (!overview) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Resident Self-Service Portal</CardTitle>
          <CardDescription>
            Enter the email address on your lease or reservation for a secure sign-in link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRequestLink} className="space-y-4">
            <Input
              type="email"
              required
              placeholder="resident@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full">
              Email Sign-In Link
            </Button>
            {linkSent ? (
              <p className="text-sm text-emerald-700">
                If an active or recent stay matches that email, a sign-in link has been sent.
              </p>
            ) : null}
            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
          </form>
        </CardContent>
      </Card>
    );
  }

  const primaryStay = overview.stays[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {overview.residentName}</h1>
          <p className="text-sm text-muted-foreground">{overview.residentEmail}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {overview.stays.map(stay => (
          <Card key={stay.reservationId}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{stay.propertyName}</CardTitle>
                <Badge variant="outline">{stay.checkedIn ? "Checked In" : "Upcoming"}</Badge>
              </div>
              <CardDescription>
                {formatUtcDate(stay.arrivalDate)} – {formatUtcDate(stay.departureDate)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {stay.wifiNetwork || stay.wifiPassword ? (
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="font-medium">Wi-Fi</p>
                  {stay.wifiNetwork ? <p>Network: {stay.wifiNetwork}</p> : null}
                  {stay.wifiPassword ? <p>Password: {stay.wifiPassword}</p> : null}
                </div>
              ) : null}
              {stay.accessCodes.map((code, index) => (
                <div key={`${code.label}-${index}`} className="flex justify-between rounded border px-3 py-2">
                  <span>{code.label}</span>
                  <span className="font-mono font-medium">{code.value}</span>
                </div>
              ))}
              {stay.accessInstructions ? <p className="text-muted-foreground">{stay.accessInstructions}</p> : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices & Statements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {overview.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices available.</p>
          ) : (
            overview.invoices.map(inv => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3 text-sm">
                <div>
                  <p className="font-medium">Invoice #{inv.invoiceNumber}</p>
                  <p className="text-xs text-muted-foreground">Due {formatUtcDate(inv.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Balance: {formatUsd(inv.balanceAmount)}</p>
                  <Badge variant="secondary">{inv.status}</Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maintenance Threads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {overview.maintenanceRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No maintenance requests found.</p>
          ) : (
            overview.maintenanceRequests.map(req => (
              <div key={req.id} className="space-y-2 rounded border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{req.title}</p>
                  <Badge variant="outline">{req.status}</Badge>
                </div>
                {req.messages.map(msg => (
                  <div key={msg.id} className="rounded bg-muted/40 px-3 py-2 text-sm">
                    <p className="text-xs text-muted-foreground">{msg.direction === "inbound" ? "You" : "Staff"}</p>
                    <p>{msg.body}</p>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={replyDrafts[req.id] ?? ""}
                    onChange={e => setReplyDrafts(prev => ({ ...prev, [req.id]: e.target.value }))}
                    placeholder="Reply to maintenance team..."
                  />
                  <Button type="button" size="sm" onClick={() => handleReplySubmit(req.id)}>
                    Send
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {primaryStay ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Request Lease Extension</CardTitle>
            <CardDescription>Interested in extending your stay at {primaryStay.propertyName}?</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRenewalSubmit} className="space-y-3">
              <Input type="date" value={renewalEndDate} onChange={e => setRenewalEndDate(e.target.value)} />
              <Textarea
                rows={2}
                value={renewalNotes}
                onChange={e => setRenewalNotes(e.target.value)}
                placeholder="Optional notes for our leasing team..."
              />
              <Button type="submit" size="sm">
                Request Extension
              </Button>
              {renewalSubmitted ? <p className="text-sm text-emerald-700">Renewal inquiry submitted.</p> : null}
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
