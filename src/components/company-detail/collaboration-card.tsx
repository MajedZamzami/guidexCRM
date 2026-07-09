"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Comment, CompanyTeamMember, FollowUp, Profile } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users2, CalendarPlus, Send, X } from "lucide-react";
import { formatDate, timeAgo } from "@/lib/format";

const CONTACT_METHODS = ["Email", "Phone", "WhatsApp", "In Person", "Other"];

export function CollaborationCard({
  projectId,
  createdAt,
  createdByName,
  contactMethod,
  teamMembers,
  profiles,
  followUps,
  comments,
}: {
  projectId: string;
  createdAt: string;
  createdByName: string;
  contactMethod: string | null;
  teamMembers: CompanyTeamMember[];
  profiles: Profile[];
  followUps: FollowUp[];
  comments: Comment[];
}) {
  const router = useRouter();
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const [method, setMethod] = useState(contactMethod ?? "");
  const [memberToAdd, setMemberToAdd] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpNote, setFollowUpNote] = useState("");
  const [addingFollowUp, setAddingFollowUp] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const assignedIds = new Set(teamMembers.map((m) => m.user_id));
  const availableProfiles = profiles.filter((p) => !assignedIds.has(p.id));

  async function handleContactMethodChange(value: string) {
    setMethod(value);
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ contact_method: value })
      .eq("id", projectId);
    if (error) toast.error(error.message);
    else router.refresh();
  }

  async function handleAssign() {
    if (!memberToAdd) return;
    setAssigning(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("company_team_members")
      .insert({ project_id: projectId, user_id: memberToAdd });
    setAssigning(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMemberToAdd("");
    router.refresh();
  }

  async function handleAddNamedMember() {
    const name = newMemberName.trim();
    if (!name) return;
    setAssigning(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("company_team_members")
      .insert({ project_id: projectId, member_name: name });
    setAssigning(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewMemberName("");
    router.refresh();
  }

  async function handleUnassign(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("company_team_members").delete().eq("id", id);
    if (error) toast.error(error.message);
    else router.refresh();
  }

  async function handleAddFollowUp() {
    if (!followUpDate) {
      toast.error("Pick a due date");
      return;
    }
    setAddingFollowUp(true);
    const supabase = createClient();
    const { error } = await supabase.from("follow_ups").insert({
      project_id: projectId,
      due_date: followUpDate,
      note: followUpNote.trim() || null,
    });
    setAddingFollowUp(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setFollowUpDate("");
    setFollowUpNote("");
    router.refresh();
  }

  async function handleToggleFollowUp(id: string, isDone: boolean) {
    const supabase = createClient();
    const { error } = await supabase.from("follow_ups").update({ is_done: !isDone }).eq("id", id);
    if (error) toast.error(error.message);
    else router.refresh();
  }

  async function handleSendComment() {
    if (!commentBody.trim()) return;
    setSendingComment(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("comments").insert({
      project_id: projectId,
      user_id: user?.id ?? null,
      body: commentBody.trim(),
    });
    setSendingComment(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setCommentBody("");
    router.refresh();
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users2 className="size-4 text-primary" />
          Collaboration &amp; Tracking
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Registered: {formatDate(createdAt)} · Added by: {createdByName}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium">Contact Method</p>
          <Select value={method || undefined} onValueChange={handleContactMethodChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select contact method..." />
            </SelectTrigger>
            <SelectContent>
              {CONTACT_METHODS.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Assigned Team Members ({teamMembers.length})</p>
          {teamMembers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No team members assigned yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {teamMembers.map((member) => (
                <Badge key={member.id} variant="secondary" className="gap-1 pr-1">
                  {member.user_id
                    ? (profileById.get(member.user_id)?.full_name ?? "Unknown")
                    : member.member_name}
                  <button
                    type="button"
                    onClick={() => handleUnassign(member.id)}
                    className="rounded-full p-0.5 hover:bg-accent"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Select value={memberToAdd || undefined} onValueChange={setMemberToAdd}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Assign existing user..." />
              </SelectTrigger>
              <SelectContent>
                {availableProfiles.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name ?? "Unnamed"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleAssign} disabled={!memberToAdd || assigning}>
              Assign
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add a team member by name..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddNamedMember();
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddNamedMember}
              disabled={!newMemberName.trim() || assigning}
            >
              Add
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Follow-up Dates ({followUps.length})</p>
          {followUps.length === 0 ? (
            <p className="text-xs text-muted-foreground">No follow-up dates scheduled.</p>
          ) : (
            <div className="space-y-1.5">
              {followUps.map((fu) => (
                <label
                  key={fu.id}
                  className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 text-sm"
                >
                  <Checkbox
                    checked={fu.is_done}
                    onCheckedChange={() => handleToggleFollowUp(fu.id, fu.is_done)}
                  />
                  <span className={fu.is_done ? "text-muted-foreground line-through" : ""}>
                    {formatDate(fu.due_date)}
                    {fu.note ? ` — ${fu.note}` : ""}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-40"
            />
            <Input
              placeholder="Note (optional)"
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" variant="outline" onClick={handleAddFollowUp} disabled={addingFollowUp}>
              <CalendarPlus className="size-4" />
              Add
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Team Discussion ({comments.length})</p>
          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No comments yet. Start the discussion!</p>
          ) : (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-md bg-accent/50 px-3 py-2 text-sm">
                  <p className="text-foreground">{comment.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {profileById.get(comment.user_id ?? "")?.full_name ?? "Unknown"} ·{" "}
                    {timeAgo(comment.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              rows={2}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSendComment();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleSendComment}
              disabled={!commentBody.trim() || sendingComment}
            >
              <Send className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Press Ctrl+Enter to send</p>
        </div>
      </CardContent>
    </Card>
  );
}
