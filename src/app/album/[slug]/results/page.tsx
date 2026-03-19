import { redirect } from "next/navigation";
import Link from "next/link";
import { getPublicAlbum } from "@/actions/public-albums";
import { getSearchSession, getMatchResults } from "@/actions/matching";
import { getSavedImageIds } from "@/actions/favorites";
import { MatchResultsGrid } from "@/components/search/match-results-grid";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { CheckCircle, SearchX, ArrowLeft } from "lucide-react";
import { SEARCH_STATUS } from "@/config/constants";

interface ResultsPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session?: string }>;
}

export default async function ResultsPage({
  params,
  searchParams,
}: ResultsPageProps) {
  const { slug } = await params;
  const { session: sessionId } = await searchParams;

  if (!sessionId) {
    redirect(`/album/${slug}`);
  }

  const [sessionData, album] = await Promise.all([
    getSearchSession(sessionId),
    getPublicAlbum(slug),
  ]);

  if (!sessionData || sessionData.status !== SEARCH_STATUS.COMPLETED) {
    redirect(`/album/${slug}`);
  }

  if (!album) {
    redirect(`/album/${slug}`);
  }

  const [matches, savedImageIds] = await Promise.all([
    getMatchResults(sessionId),
    getSavedImageIds(album.id),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="bg-muted/10 border-b border-border text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-serif text-balance">
              {matches.length > 0 ? (
                <CheckCircle className="text-primary" />
              ) : (
                <SearchX className="text-muted-foreground" />
              )}
              Your Photos
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              {matches.length > 0 ? (
                <>
                  We found{" "}
                  <span className="font-semibold text-foreground">
                    {matches.length}
                  </span>{" "}
                  {matches.length === 1 ? "photo" : "photos"} of you in{" "}
                  <span className="font-semibold text-foreground">
                    {album.title}
                  </span>
                </>
              ) : (
                "We couldn't find any photos of you in this album"
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {matches.length > 0 ? (
              <MatchResultsGrid
                matches={matches}
                albumId={album.id}
                savedImageIds={savedImageIds}
              />
            ) : (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <SearchX className="size-12 text-muted-foreground/50" />
                <p className="text-muted-foreground font-sans">
                  Try uploading a clearer selfie or a different photo of
                  yourself.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border pt-6">
            <Link
              href={`/album/${slug}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <ArrowLeft data-icon="inline-start" />
              Search Again
            </Link>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
