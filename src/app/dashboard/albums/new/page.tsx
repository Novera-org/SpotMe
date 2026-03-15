"use client";

import { useActionState } from "react";
import { createAlbum } from "@/actions/albums";
import Link from "next/link";

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

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="form-input"
            required
            minLength={2}
            maxLength={100}
            placeholder="e.g. Summer Wedding 2026"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="form-input"
            rows={3}
            maxLength={500}
            placeholder="Optional description for this album..."
            style={{ resize: "vertical" }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "0.5rem",
          }}
        >
          <button type="submit" className="form-button" disabled={isPending}>
            {isPending ? "Creating..." : "Create Album"}
          </button>
          <Link
            href="/dashboard"
            className="form-button"
            style={{
              background: "transparent",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
