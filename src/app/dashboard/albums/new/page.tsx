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
    <div className="dashboard-page flex flex-col gap-8">
      <div>
        <h2 className="dashboard-page-title">Create Album</h2>
        <p className="dashboard-page-desc">
          Add a new photo album to share with your audience.
        </p>
      </div>

      <form action={formAction} className="auth-form w-full max-w-lg">
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

        <div className="flex items-center gap-3 mt-4">
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
