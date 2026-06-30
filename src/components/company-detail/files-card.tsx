"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { CompanyFile } from "@/lib/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { timeAgo } from "@/lib/format";

function formatSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const BUCKET = "company-files";

export function FilesCard({
  companyId,
  files,
}: {
  companyId: string;
  files: CompanyFile[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = createClient();
    const path = `${companyId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
    if (uploadError) {
      toast.error(uploadError.message);
      setUploading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("files").insert({
      company_id: companyId,
      name: file.name,
      storage_path: path,
      size: file.size,
      content_type: file.type || null,
      uploaded_by: user?.id ?? null,
    });

    setUploading(false);
    if (insertError) {
      toast.error(insertError.message);
      return;
    }

    toast.success("File uploaded");
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  async function handleDownload(file: CompanyFile) {
    setBusyId(file.id);
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(file.storage_path, 60);
    setBusyId(null);
    if (error || !data) {
      toast.error(error?.message ?? "Could not generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  async function handleDelete(file: CompanyFile) {
    setBusyId(file.id);
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([file.storage_path]);
    const { error } = await supabase.from("files").delete().eq("id", file.id);
    setBusyId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    router.refresh();
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="size-4 text-primary" />
          Files ({files.length})
        </CardTitle>
        <Button size="sm" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Upload
        </Button>
        <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No files uploaded yet</p>
            <p className="text-xs text-muted-foreground">
              Upload quotations, proposals, or other documents for this company.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)} · {timeAgo(file.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    disabled={busyId === file.id}
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-destructive hover:text-destructive"
                    disabled={busyId === file.id}
                    onClick={() => handleDelete(file)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
