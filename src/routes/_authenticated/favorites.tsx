import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PgCard } from "@/components/site/PgCard";
import { useFavorites } from "@/hooks/useFavorites";
import { pgsByIdsQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/favorites")({
  head: () => ({
    meta: [
      { title: "My shortlist — PG Near JECRC" },
      {
        name: "description",
        content: "Your saved PGs near JECRC University, ready to compare and visit.",
      },
      { property: "og:title", content: "My PG shortlist" },
      { property: "og:description", content: "Saved PGs near JECRC University, Jaipur." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { ids } = useFavorites();
  const { data } = useQuery(pgsByIdsQuery(ids));
  const pgs = data?.pgs ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">My shortlist</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {pgs.length} saved {pgs.length === 1 ? "PG" : "PGs"}
      </p>

      {ids.length === 0 ? (
        <div className="mt-12 text-center">
          <Heart className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-display text-xl font-semibold">No saved PGs yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap the heart on any listing to keep it here.
          </p>
          <Button asChild className="mt-5">
            <Link to="/pgs">Browse PGs</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {pgs.map((pg) => (
            <PgCard key={pg.id} pg={pg} />
          ))}
        </div>
      )}
    </div>
  );
}
