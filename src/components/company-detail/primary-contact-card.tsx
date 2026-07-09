"use client";

import { useState } from "react";
import { Star, UserPlus, Mail, Phone, Link2 } from "lucide-react";
import type { Contact } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "@/components/company-detail/contact-dialog";

export function PrimaryContactCard({
  projectId,
  companyName,
  contacts,
}: {
  projectId: string;
  companyName: string;
  contacts: Contact[];
}) {
  const [open, setOpen] = useState(false);
  const primary = contacts.find((c) => c.is_primary) ?? null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="size-4 text-warning" />
          Primary Contact
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <UserPlus className="size-4" />
          Add Manually
        </Button>
      </CardHeader>
      <CardContent>
        {primary ? (
          <div className="space-y-2">
            <div>
              <p className="font-medium">{primary.name}</p>
              {primary.title && (
                <p className="text-sm text-muted-foreground">{primary.title}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {primary.email && (
                <span className="flex items-center gap-1">
                  <Mail className="size-3.5" />
                  {primary.email}
                </span>
              )}
              {primary.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5" />
                  {primary.phone}
                </span>
              )}
              {primary.linkedin_url && (
                <a
                  href={primary.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Link2 className="size-3.5" />
                  LinkedIn
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No primary contact assigned
            </p>
            <p className="text-xs text-muted-foreground">
              Add a key person you&apos;re in contact with at {companyName}
            </p>
          </div>
        )}
      </CardContent>
      <ContactDialog
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
        companyName={companyName}
        makePrimary={!primary}
      />
    </Card>
  );
}
