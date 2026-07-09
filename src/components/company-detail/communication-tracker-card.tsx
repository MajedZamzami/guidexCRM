"use client";

import { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import type { Contact, Interaction } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InteractionDialog } from "@/components/company-detail/interaction-dialog";
import { timeAgo } from "@/lib/format";

type InteractionWithContact = Interaction & { contact: { name: string } | null };

const TYPE_LABELS: Record<string, string> = {
  call: "Call",
  email: "Email",
  meeting: "Meeting",
  whatsapp: "WhatsApp",
  note: "Note",
  other: "Other",
};

export function CommunicationTrackerCard({
  projectId,
  contacts,
  interactions,
}: {
  projectId: string;
  contacts: Contact[];
  interactions: InteractionWithContact[];
}) {
  const [open, setOpen] = useState(false);
  const hasContacts = contacts.length > 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4 text-primary" />
          Communication Tracker
        </CardTitle>
        <Button size="sm" variant="outline" disabled={!hasContacts} onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Log
        </Button>
      </CardHeader>
      <CardContent>
        {interactions.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No interactions logged yet
            </p>
            <p className="text-xs text-muted-foreground">
              {hasContacts
                ? "Log a call, email, or meeting with this company."
                : "Assign a primary contact first, then log interactions"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="flex gap-3 text-sm">
                <Badge variant="outline" className="h-fit shrink-0">
                  {TYPE_LABELS[interaction.type] ?? interaction.type}
                </Badge>
                <div className="min-w-0 flex-1">
                  {interaction.notes && (
                    <p className="truncate text-foreground">{interaction.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {interaction.contact?.name ?? "No contact"} · {timeAgo(interaction.occurred_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <InteractionDialog
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
        contacts={contacts}
      />
    </Card>
  );
}
