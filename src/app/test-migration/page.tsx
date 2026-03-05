"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/client";
import { createTestData, getSessionData } from "@/actions/test-data";

interface SessionItem {
  id: string;
  album: {
    title: string;
  };
}

interface DownloadItem {
  id: string;
  image: {
    filename: string;
  };
  downloadType: string;
}

interface TestMigrationData {
  type: string;
  userId: string | null;
  guestId: string | null;
  sessions: SessionItem[];
  downloads: DownloadItem[];
}

export default function TestMigrationPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<TestMigrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Security Guard: Allow in dev OR if user is admin
  const isAllowed = process.env.NODE_ENV === "development" || (session?.user as any)?.role === "admin";

  async function loadData() {
    setLoading(true);
    try {
      const res = await getSessionData();
      setData(res as TestMigrationData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [session?.user?.id]);

  async function handleCreateTest() {
    if (!isAllowed) return; // Client-side safety
    setCreating(true);
    try {
      await createTestData();
      await loadData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create test data");
    } finally {
      setCreating(false);
    }
  }

  async function handleCreateDownloadTest() {
    if (!isAllowed) return; // Client-side safety
    setCreating(true);
    try {
      await createTestData(); // Also create a session just in case
      const { createDownloadTestData } = await import("@/actions/test-data");
      await createDownloadTestData();
      await loadData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create download test data");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="p-10 text-zinc-500">Loading identity and session data...</div>;
  if (!data) return <div className="p-10 text-red-500">Error: Could not load data.</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Migration Test Page</h1>

      {!isAllowed && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-amber-800 text-sm">
          <strong>Security Notice:</strong> Test data mutations are restricted in production environments. Only administrators can perform these actions.
        </div>
      )}
      
      <div className="bg-zinc-100 p-4 rounded-lg space-y-2">
        <p><strong>Identity Type:</strong> <span className="capitalize">{data.type}</span></p>
        <p><strong>User ID:</strong> <code className="text-xs bg-white px-1 rounded">{data.userId || "None"}</code></p>
        <p><strong>Guest ID:</strong> <code className="text-xs bg-white px-1 rounded">{data.guestId || "None"}</code></p>
      </div>

      <div className="space-y-6">
        {/* Search Sessions Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Search Sessions ({data.sessions.length})</h2>
            {isAllowed && (
              <button 
                onClick={handleCreateTest}
                disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {creating ? "Creating..." : "Create Mock Search"}
              </button>
            )}
          </div>

          {data.sessions.length === 0 ? (
            <p className="text-zinc-500 italic text-sm p-4 bg-zinc-50 rounded-md border border-dashed">No sessions found.</p>
          ) : (
            <div className="border rounded-md divide-y overflow-hidden shadow-sm">
              {data.sessions.map((s) => (
                <div key={s.id} className="p-3 text-sm flex justify-between items-center bg-white hover:bg-zinc-50 transition-colors">
                  <span className="font-medium text-zinc-700">{s.album.title}</span>
                  <span className="text-zinc-400 font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded">{s.id.slice(0, 8)}...</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Downloads Section */}
        <div className="space-y-4 pt-6 border-t">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Downloads ({data.downloads.length})</h2>
            {isAllowed && (
              <button 
                onClick={handleCreateDownloadTest}
                disabled={creating}
                className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50 text-sm font-medium hover:bg-green-700 transition-colors"
              >
                {creating ? "Creating..." : "Create Mock Download"}
              </button>
            )}
          </div>

          {data.downloads.length === 0 ? (
            <p className="text-zinc-500 italic text-sm p-4 bg-zinc-50 rounded-md border border-dashed">No downloads found.</p>
          ) : (
            <div className="border rounded-md divide-y overflow-hidden shadow-sm">
              {data.downloads.map((d) => (
                <div key={d.id} className="p-3 text-sm flex justify-between items-center bg-white hover:bg-zinc-50 transition-colors">
                  <span className="font-medium text-zinc-700">{d.image.filename} <span className="text-zinc-400 font-normal">({d.downloadType})</span></span>
                  <span className="text-zinc-400 font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded">{d.id.slice(0, 8)}...</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-8 border-t space-y-4">
        <h2 className="text-xl font-semibold text-zinc-800">Test the Migration</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-zinc-600">
          <li>Ensure you are in an <strong>incognito window</strong> as a Guest.</li>
          <li>Click both <strong>&quot;Create Mock Search&quot;</strong> and <strong>&quot;Create Mock Download&quot;</strong>.</li>
          <li>Navigate to <a href="/sign-up" className="text-blue-600 hover:text-blue-800 underline transition-colors">Sign Up</a> and create an account.</li>
          <li>Return to this page <code>/test-migration</code>.</li>
          <li><strong>Check Result:</strong> Both sections should still show the exact same records!</li>
        </ol>
      </div>

      <div className="flex gap-4 pt-4">
        <a href="/sign-up" className="px-4 py-2 border border-zinc-200 rounded-md hover:bg-zinc-50 text-zinc-600 text-sm font-medium transition-colors">Sign Up</a>
        <a href="/sign-in" className="px-4 py-2 border border-zinc-200 rounded-md hover:bg-zinc-50 text-zinc-600 text-sm font-medium transition-colors">Sign In</a>
      </div>
    </div>
  );
}
