import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LayoutGrid, List, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from "@/components/ui/skeleton";
import { PgCard } from "@/components/site/PgCard";
import { activePgsQuery } from "@/lib/queries";
import { AMENITIES, rupees, SHARING_TYPES, type Pg } from "@/lib/pg";
import { cn } from "@/lib/utils";

type SearchParams = {
  q?: string;
  gender?: string;
  max?: number;
  sharing?: string;
  dist?: string;
  amenities?: string;
  sort?: string;
  view?: string;
};

export const Route = createFileRoute("/pgs/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    gender: ["boys", "girls", "coed"].includes(String(search.gender))
      ? String(search.gender)
      : undefined,
    max: Number(search.max) > 0 ? Number(search.max) : undefined,
    sharing: SHARING_TYPES.includes(String(search.sharing) as (typeof SHARING_TYPES)[number])
      ? String(search.sharing)
      : undefined,
    dist: ["500", "1000", "2000", "3000"].includes(String(search.dist))
      ? String(search.dist)
      : undefined,
    amenities: typeof search.amenities === "string" && search.amenities ? search.amenities : undefined,
    sort: ["price-asc", "price-desc", "distance", "rating"].includes(String(search.sort))
      ? String(search.sort)
      : undefined,
    view: search.view === "list" ? "list" : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(activePgsQuery),
  head: () => ({
    meta: [
      { title: "All PGs near JECRC University, Jaipur — PG Near JECRC" },
      {
        name: "description",
        content:
          "Filter verified PGs near JECRC University by rent, gender, sharing type, amenities and distance from campus. Sort by price, distance or student rating.",
      },
      { property: "og:title", content: "All verified PGs near JECRC University" },
      {
        property: "og:description",
        content: "Filter by rent, gender, sharing, amenities and distance from the JECRC gates.",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="px-4 py-20 text-center text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="py-20 text-center">No PGs found.</div>,
  component: Directory,
});

function Directory() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: pgs, isLoading } = useQuery(activePgsQuery);
  const [mobileFilters, setMobileFilters] = useState(false);

  const selectedAmenities = search.amenities ? search.amenities.split(",") : [];
  const maxBudget = search.max ?? 15000;

  function set(patch: Partial<SearchParams>) {
    navigate({ search: (prev) => ({ ...prev, ...patch }) });
  }

  const filtered = filterPgs(pgs ?? [], search, selectedAmenities);
  const activeCount =
    (search.gender ? 1 : 0) +
    (search.sharing ? 1 : 0) +
    (search.dist ? 1 : 0) +
    (search.max ? 1 : 0) +
    selectedAmenities.length;

  const filterPanel = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>
          Max budget: <span className="font-semibold">{rupees(maxBudget)}</span>/month
        </Label>
        <Slider
          min={3000}
          max={15000}
          step={500}
          value={[maxBudget]}
          onValueChange={(v) => set({ max: v[0] })}
        />
      </div>

      <div className="space-y-2">
        <Label>Gender preference</Label>
        <ToggleGroup
          type="single"
          variant="outline"
          className="w-full"
          value={search.gender ?? ""}
          onValueChange={(v) => set({ gender: v || undefined })}
        >
          <ToggleGroupItem value="boys" className="flex-1">
            Boys
          </ToggleGroupItem>
          <ToggleGroupItem value="girls" className="flex-1">
            Girls
          </ToggleGroupItem>
          <ToggleGroupItem value="coed" className="flex-1">
            Co-ed
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label>Room type</Label>
        <div className="grid grid-cols-2 gap-2">
          {SHARING_TYPES.map((s) => (
            <Button
              key={s}
              type="button"
              variant={search.sharing === s ? "default" : "outline"}
              size="sm"
              onClick={() => set({ sharing: search.sharing === s ? undefined : s })}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Distance from JECRC</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: "500", l: "Within 500m" },
            { v: "1000", l: "Within 1 km" },
            { v: "2000", l: "Within 2 km" },
            { v: "3000", l: "3 km & beyond" },
          ].map((d) => (
            <Button
              key={d.v}
              type="button"
              variant={search.dist === d.v ? "default" : "outline"}
              size="sm"
              onClick={() => set({ dist: search.dist === d.v ? undefined : d.v })}
            >
              {d.l}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Amenities</Label>
        <div className="space-y-2">
          {AMENITIES.map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={selectedAmenities.includes(a)}
                onCheckedChange={(checked) => {
                  const next = checked
                    ? [...selectedAmenities, a]
                    : selectedAmenities.filter((x) => x !== a);
                  set({ amenities: next.length ? next.join(",") : undefined });
                }}
              />
              {a}
            </label>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() =>
          navigate({
            search: () => ({}),
          })
        }
      >
        <X className="size-4" /> Clear all filters
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-semibold">PGs near JECRC University</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isLoading ? "Loading listings…" : `${filtered.length} verified PGs match your filters`}
      </p>

      {/* Sticky quick bar (mobile) */}
      <div className="sticky top-16 z-30 -mx-4 mt-4 flex gap-2 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="shrink-0">
              <SlidersHorizontal className="size-4" /> Filters
              {activeCount > 0 && <Badge className="ml-1 px-1.5">{activeCount}</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-6">
            <SheetTitle className="font-display">Filter PGs</SheetTitle>
            <div className="mt-5">{filterPanel}</div>
            <Button className="mt-6 w-full" onClick={() => setMobileFilters(false)}>
              Show {filtered.length} PGs
            </Button>
          </SheetContent>
        </Sheet>
        <Select value={search.sort ?? "distance"} onValueChange={(v) => set({ sort: v })}>
          <SelectTrigger size="sm" className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">Nearest first</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="rating">Highest rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 flex gap-8">
        <aside className="hidden w-72 shrink-0 lg:block">
          <Card className="sticky top-24 border-border/70">
            <CardContent className="pt-1">
              <div className="relative mb-5">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search.q ?? ""}
                  onChange={(e) => set({ q: e.target.value || undefined })}
                  placeholder="Search name or area"
                  className="pl-9"
                />
              </div>
              {filterPanel}
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
            <Select value={search.sort ?? "distance"} onValueChange={(v) => set({ sort: v })}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Nearest first</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="rating">Highest rated</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              <Button
                variant={search.view === "list" ? "ghost" : "secondary"}
                size="icon"
                aria-label="Grid view"
                onClick={() => set({ view: undefined })}
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant={search.view === "list" ? "secondary" : "ghost"}
                size="icon"
                aria-label="List view"
                onClick={() => set({ view: "list" })}
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <MapPin className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 font-display text-lg font-semibold">No PGs match these filters</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try increasing your budget or widening the distance from campus.
                </p>
                <Button className="mt-4" variant="outline" onClick={() => navigate({ search: () => ({}) })}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div
              className={cn(
                "grid gap-5",
                search.view === "list" ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3",
              )}
            >
              {filtered.map((pg) => (
                <PgCard key={pg.id} pg={pg} view={search.view === "list" ? "list" : "grid"} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function filterPgs(pgs: Pg[], search: SearchParams, amenities: string[]) {
  let list = pgs.filter((pg) => {
    if (search.gender && pg.gender !== search.gender) return false;
    if (search.max && pg.min_rent > search.max) return false;
    if (search.dist) {
      const limit = Number(search.dist);
      if (limit === 3000 ? pg.distance_m < 2000 : pg.distance_m > limit) return false;
    }
    if (amenities.length && !amenities.every((a) => pg.amenities.includes(a))) return false;
    if (search.q) {
      const needle = search.q.toLowerCase();
      const haystack = `${pg.name} ${pg.area} ${pg.address} ${pg.landmark ?? ""}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  switch (search.sort) {
    case "price-asc":
      list = [...list].sort((a, b) => a.min_rent - b.min_rent);
      break;
    case "price-desc":
      list = [...list].sort((a, b) => b.min_rent - a.min_rent);
      break;
    case "rating":
      list = [...list].sort((a, b) => b.rating - a.rating);
      break;
    default:
      list = [...list].sort((a, b) => a.distance_m - b.distance_m);
  }
  return list;
}
