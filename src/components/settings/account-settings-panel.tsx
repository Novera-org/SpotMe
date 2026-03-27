"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateDisplayName, revokeSessionById } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/shared/password-input";

type SessionRecord = {
  id: string;
  device: string;
  location: string;
  lastActiveLabel: string;
  isCurrent: boolean;
};

interface AccountSettingsPanelProps {
  initialName: string;
  email: string;
  sessions: SessionRecord[];
}

export function AccountSettingsPanel({
  initialName,
  email,
  sessions,
}: AccountSettingsPanelProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [namePending, startNameTransition] = useTransition();

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordPending, startPasswordTransition] = useTransition();

  const [sessionError, setSessionError] = useState<string | null>(null);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [sessionPending, startSessionTransition] = useTransition();

  const visibleSessions = useMemo(() => sessions, [sessions]);

  const handleDisplayNameSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNameError(null);

    startNameTransition(async () => {
      try {
        await updateDisplayName({ name: displayName });
        toast.success("Display name updated.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update display name.";
        setNameError(message);
        toast.error(message);
      }
    });
  };

  const handlePasswordPlaceholder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);

    startPasswordTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const message = "Password change is placeholder UI for now.";
      setPasswordError(message);
      toast.info(message);
    });
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessionError(null);
    setRevokingSessionId(sessionId);

    startSessionTransition(async () => {
      try {
        await revokeSessionById({ sessionId });
        toast.success("Session revoked.");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to revoke session.";
        setSessionError(message);
        toast.error(message);
      } finally {
        setRevokingSessionId(null);
      }
    });
  };

  return (
    <div className="space-y-8">
      <section className="border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Personal info</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile details.
        </p>

        <form className="mt-5 space-y-4 max-w-xl" onSubmit={handleDisplayNameSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          {nameError && (
            <p className="text-sm text-destructive" role="alert">
              {nameError}
            </p>
          )}

          <LoadingButton type="submit" isLoading={namePending} loadingText="Saving...">
            Save changes
          </LoadingButton>
        </form>
      </section>

      <section className="border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Security</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Password change UI is available as a placeholder.
        </p>

        <form className="mt-5 space-y-4 max-w-xl" onSubmit={handlePasswordPlaceholder}>
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
            />
          </div>

          {passwordError && (
            <p className="text-sm text-destructive" role="alert">
              {passwordError}
            </p>
          )}

          <LoadingButton
            type="submit"
            isLoading={passwordPending}
            loadingText="Updating..."
          >
            Update password
          </LoadingButton>
        </form>
      </section>

      <section className="border border-border bg-card p-5">
        <h2 className="text-lg font-semibold">Active sessions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review where your account is signed in.
        </p>

        {sessionError && (
          <p className="text-sm text-destructive mt-4" role="alert">
            {sessionError}
          </p>
        )}

        <ul className="mt-5 space-y-3">
          {visibleSessions.length === 0 && (
            <li className="text-sm text-muted-foreground border border-dashed border-border p-4">
              No active sessions found.
            </li>
          )}

          {visibleSessions.map((activeSession) => (
            <li
              key={activeSession.id}
              className="border border-border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold">{activeSession.device}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeSession.location}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last active {activeSession.lastActiveLabel}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {activeSession.isCurrent && (
                  <span className="text-xs border border-border px-2 py-1">Current</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activeSession.isCurrent || (sessionPending && revokingSessionId === activeSession.id)}
                  onClick={() => handleRevokeSession(activeSession.id)}
                >
                  {sessionPending && revokingSessionId === activeSession.id
                    ? "Revoking..."
                    : "Revoke"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
