"use client";

import { useActionState } from "react";
import { createAlbum } from "@/actions/albums";
import Link from "next/link";
import { LoadingButton } from "@/components/ui/loading-button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewAlbumPage() {
  const [error, formAction, isPending] = useActionState(
    async (_prevState: string | null, formData: FormData) => {
      const result = await createAlbum(formData);
      if (result && "error" in result) {
        return result.error;
      }
      return null;
    },
    null
  );

  return (
    <div className="dashboard-page">
      <h2 className="dashboard-page-title">Create Album</h2>
      <p className="dashboard-page-desc" style={{ marginBottom: "1.5rem" }}>
        Add a new photo album to share with your audience.
      </p>

      <form action={formAction} className="auth-form" style={{ maxWidth: 500 }}>
        {error && <div className="form-error">{error}</div>}

        <div className="space-y-1.5">
          <Label htmlFor="title">
            Title *
          </Label>
          <Input
            id="title"
            name="title"
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="e.g. Summer Wedding 2026"
          />
        </div>

        <div className="space-y-1.5 mt-4">
          <Label htmlFor="description">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="Optional description for this album..."
            className="resize-y"
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "0.5rem",
          }}
        >
          <LoadingButton type="submit" isLoading={isPending} loadingText="Creating…">
            Create Album
          </LoadingButton>
          <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
