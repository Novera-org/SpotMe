"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/client";
import { createTestData, getSessionData } from "@/actions/test-data";

export default function TestMigrationPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getSessionData();
      setData(res);
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
    setCreating(true);
    await createTestData();
    await loadData();
    setCreating(false);
  }

  async function handleCreateDownloadTest() {
    setCreating(true);
    await createTestData(); // Also create a session just in case
    const { createDownloadTestData } = await import("@/actions/test-data");
    await createDownloadTestData();
    await loadData();
    setCreating(false);
  }

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Migration Test Page</h1>
      
      <div className="bg-zinc-100 p-4 rounded-lg space-y-2">
        <p><strong>Identity Type:</strong> {data.type}</p>
        <p><strong>User ID:</strong> {data.userId || "None"}</p>
        <p><strong>Guest ID:</strong> {data.guestId || "None"}</p>
      </div>

      <div className="space-y-6">
        {/* Search Sessions Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Search Sessions ({data.sessions.length})</h2>
            <button 
              onClick={handleCreateTest}
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 text-sm"
            >
              {creating ? "Creating..." : "Create Mock Search"}
            </button>
          </div>

          {data.sessions.length === 0 ? (
            <p className="text-zinc-500 italic text-sm">No sessions found.</p>
          ) : (
            <div className="border rounded-md divide-y">
              {data.sessions.map((s: any) => (
                <div key={s.id} className="p-3 text-sm flex justify-between bg-white">
                  <span>{s.album.title}</span>
                  <span className="text-zinc-400 font-mono text-xs">{s.id.slice(0, 8)}...</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Downloads Section */}
        <div className="space-y-4 pt-6 border-t">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Downloads ({data.downloads.length})</h2>
            <button 
              onClick={handleCreateDownloadTest}
              disabled={creating}
              className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50 text-sm"
            >
              {creating ? "Creating..." : "Create Mock Download"}
            </button>
          </div>

          {data.downloads.length === 0 ? (
            <p className="text-zinc-500 italic text-sm">No downloads found.</p>
          ) : (
            <div className="border rounded-md divide-y">
              {data.downloads.map((d: any) => (
                <div key={d.id} className="p-3 text-sm flex justify-between bg-white">
                  <span>{d.image.filename} ({d.downloadType})</span>
                  <span className="text-zinc-400 font-mono text-xs">{d.id.slice(0, 8)}...</span>
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
          <li>Click both <strong>"Create Mock Search"</strong> and <strong>"Create Mock Download"</strong>.</li>
          <li>Navigate to <a href="/sign-up" className="text-blue-600 underline">Sign Up</a> and create an account.</li>
          <li>Return to this page <code>/test-migration</code>.</li>
          <li><strong>Check Result:</strong> Both sections should still show the exact same records!</li>
        </ol>
      </div>

      <div className="flex gap-4 pt-4">
        <a href="/sign-up" className="px-4 py-2 border rounded-md hover:bg-zinc-50">Sign Up</a>
        <a href="/sign-in" className="px-4 py-2 border rounded-md hover:bg-zinc-50">Sign In</a>
      </div>
    </div>
  );
}
