import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Minus, Scale, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCompare } from "@/hooks/useCompare";
import { pgsByIdsQuery } from "@/lib/queries";
import {
  AMENITIES,
  distanceLabel,
  FALLBACK_PHOTO,
  GENDER_LABEL,
  rupees,
  walkMinutes,
} from "@/lib/pg";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare PGs near JECRC University — PG Near JECRC" },
      {
        name: "description",
        content:
          "Compare up to three PGs near JECRC University side by side: rent, distance from campus, amenities, mess food and house rules.",
      },
      { property: "og:title", content: "Compare PGs side by side" },
      {
        property: "og:description",
        content: "Rent, distance, amenities, food and rules — all in one table.",
      },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const { ids, toggle, clear } = useCompare();
  const { data } = useQuery(pgsByIdsQuery(ids));
  const pgs = (data?.pgs ?? []).filter((pg) => ids.includes(pg.id));
  const rooms = data?.rooms ?? [];

  if (ids.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Scale className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Nothing to compare yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tap the compare icon on any PG card to add it here — up to three at a time.
        </p>
        <Button asChild className="mt-6">
          <Link to="/pgs">Browse PGs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Compare PGs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Side-by-side on the things that actually matter for a JECRC student.
          </p>
        </div>
        <Button variant="outline" onClick={clear}>
          Clear all
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-40 bg-background p-3 text-left align-bottom text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Details
              </th>
              {pgs.map((pg) => (
                <th key={pg.id} className="p-3 align-bottom">
                  <Card className="overflow-hidden p-0 text-left">
                    <img
                      src={pg.photos?.[0] ?? FALLBACK_PHOTO}
                      alt={pg.name}
                      className="h-28 w-full object-cover"
                    />
                    <CardContent className="space-y-1 p-3">
                      <Link
                        to="/pgs/$slug"
                        params={{ slug: pg.slug }}
                        className="font-display text-base font-semibold hover:text-primary"
                      >
                        {pg.name}
                      </Link>
                      <Badge variant="secondary">{GENDER_LABEL[pg.gender]}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() => toggle(pg.id)}
                      >
                        <X className="size-3.5" /> Remove
                      </Button>
                    </CardContent>
                  </Card>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Starting rent" pgs={pgs} render={(pg) => `${rupees(pg.min_rent)}/month`} />
            <Row
              label="Distance from JECRC"
              pgs={pgs}
              render={(pg) => `${distanceLabel(pg.distance_m, pg.gate)} (~${walkMinutes(pg.distance_m)} min walk)`}
            />
            <Row label="Area" pgs={pgs} render={(pg) => pg.area} />
            <Row
              label="Rating"
              pgs={pgs}
              render={(pg) => (pg.review_count ? `${pg.rating.toFixed(1)} (${pg.review_count})` : "New")}
            />
            <Row
              label="Room options"
              pgs={pgs}
              render={(pg) =>
                rooms
                  .filter((r) => r.pg_id === pg.id)
                  .map((r) => `${r.sharing} ${rupees(r.rent)}`)
                  .join(" · ") || "—"
              }
            />
            <Row label="Security deposit" pgs={pgs} render={(pg) => rupees(pg.security_deposit)} />
            <Row
              label="Mess food"
              pgs={pgs}
              render={(pg) => (pg.food_included ? (pg.food_type ?? "Included") : "Not included")}
            />
            <Row label="Entry curfew" pgs={pgs} render={(pg) => pg.entry_curfew ?? "None"} />
            <Row label="Visiting hours" pgs={pgs} render={(pg) => pg.visiting_hours ?? "Ask owner"} />
            <Row label="Notice period" pgs={pgs} render={(pg) => pg.notice_period ?? "1 month"} />
            {AMENITIES.map((amenity) => (
              <tr key={amenity} className="border-t border-border">
                <td className="sticky left-0 z-10 bg-background p-3 font-medium text-muted-foreground">
                  {amenity}
                </td>
                {pgs.map((pg) => (
                  <td key={pg.id} className="p-3">
                    {pg.amenities.includes(amenity) ? (
                      <Check className="size-4 text-success" />
                    ) : (
                      <Minus className="size-4 text-muted-foreground/50" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row<T extends { id: string }>({
  label,
  pgs,
  render,
}: {
  label: string;
  pgs: T[];
  render: (pg: T) => string;
}) {
  return (
    <tr className="border-t border-border">
      <td className="sticky left-0 z-10 bg-background p-3 font-medium text-muted-foreground">
        {label}
      </td>
      {pgs.map((pg) => (
        <td key={pg.id} className="p-3">
          {render(pg)}
        </td>
      ))}
    </tr>
  );
}
