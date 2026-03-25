"use client";

import { useState } from "react";

export default function TestErrorPage() {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error("This is a test error to verify the error boundary.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Error Boundary Test
        </h1>
        <p className="text-muted-foreground font-sans">
          Click the button below to throw an error and trigger the error boundary.
        </p>
        <button
          onClick={() => setShouldThrow(true)}
          className="rounded-lg bg-destructive/10 text-destructive px-6 py-3 font-medium hover:bg-destructive/20 transition-colors"
        >
          Trigger Error
        </button>
      </div>
    </div>
  );
}
