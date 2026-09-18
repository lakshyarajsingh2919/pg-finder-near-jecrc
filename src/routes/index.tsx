import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  HandCoins,
  MapPin,
  PhoneCall,
  Quote,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PgCard } from "@/components/site/PgCard";
import { activePgsQuery } from "@/lib/queries";
import { distanceLabel, rupees, SHARING_TYPES } from "@/lib/pg";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(activePgsQuery),
  head: () => ({
    meta: [
      { title: "PG Near JECRC — Verified PGs near JECRC University, Jaipur" },
      {
        name: "description",
        content:
          "Browse verified boys, girls and co-ed PGs within walking distance of JECRC University, Sitapura. Compare rent, mess food, amenities and distance from campus. Zero broker fees.",
      },
      { property: "og:title", content: "Verified PGs near JECRC University, Jaipur" },
      {
        property: "og:description",
        content:
          "Find a safe, verified PG near JECRC University with direct owner contact and no brokerage.",
      },
    ],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="mx-auto max-w-2xl px-4 py-20 text-center text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="py-20 text-center">Nothing here yet.</div>,
  component: Home,
});

function Home() {
  const { data: pgs = [] } = useQuery(activePgsQuery);
  const navigate = useNavigate();
  const [gender, setGender] = useState("any");
  const [budget, setBudget] = useState(9000);
  const [sharing, setSharing] = useState("any");
  const [dist, setDist] = useState("all");
  const [q, setQ] = useState("");

  const featured = pgs.filter((p) => p.featured).slice(0, 3);
  const topRated = [...pgs].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const nearest = [...pgs].sort((a, b) => a.distance_m - b.distance_m).slice(0, 8);

  function search() {
    navigate({
      to: "/pgs",
      search: {
        q: q || undefined,
        gender: gender === "any" ? undefined : gender,
        max: budget,
        sharing: sharing === "any" ? undefined : sharing,
        dist: dist === "all" ? undefined : dist,
      },
    });
  }

  return (
    <>
      <section className="warm-gradient relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:pb-16 sm:pt-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1 text-xs font-medium shadow-soft">
              <MapPin className="size-3.5 text-primary" /> Sitapura · RIICO · Vidhani · Mahal Road
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] text-balance-tight sm:text-5xl lg:text-6xl">
              Find a verified PG within walking distance of JECRC University
            </h1>
            <p className="mt-4 max-w-xl text-base text-secondary-foreground/90 sm:text-lg">
              Built for outstation students arriving in Jaipur. Real photos, real rent, real owners —
              and absolutely no brokerage.
            </p>
          </div>

          <Card className="mt-8 border-border/60 shadow-warm">
            <CardContent className="grid gap-4 p-4 sm:p-5 lg:grid-cols-12">
              <div className="space-y-1.5 lg:col-span-4">
                <Label htmlFor="q">Search by PG name or area</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && search()}
                    placeholder="e.g. Sitapura, Balaji, girls PG"
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-1.5 lg:col-span-3">
                <Label>Who is it for?</Label>
                <ToggleGroup
                  type="single"
                  value={gender}
                  onValueChange={(v) => v && setGender(v)}
                  className="w-full"
                  variant="outline"
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
              <div className="space-y-2 lg:col-span-3">
                <Label>
                  Budget up to <span className="font-semibold">{rupees(budget)}</span>/month
                </Label>
                <Slider
                  min={3000}
                  max={15000}
                  step={500}
                  value={[budget]}
                  onValueChange={(v) => setBudget(v[0] ?? 9000)}
                />
                <div className="flex gap-2">
                  <Select value={sharing} onValueChange={setSharing}>
                    <SelectTrigger className="h-9 flex-1">
                      <SelectValue placeholder="Room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any room type</SelectItem>
                      {SHARING_TYPES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dist} onValueChange={setDist}>
                    <SelectTrigger className="h-9 flex-1">
                      <SelectValue placeholder="Distance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any distance</SelectItem>
                      <SelectItem value="500">Within 500m</SelectItem>
                      <SelectItem value="1000">Within 1 km</SelectItem>
                      <SelectItem value="2000">Within 2 km</SelectItem>
                      <SelectItem value="3000">Within 3 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-end lg:col-span-2">
                <Button className="w-full" size="lg" onClick={search}>
                  <Search className="size-4" /> Search PGs
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-wrap gap-2">
            {nearest.slice(0, 5).map((pg) => (
              <Link
                key={pg.id}
                to="/pgs/$slug"
                params={{ slug: pg.slug }}
                className="rounded-full bg-background/85 px-3 py-1.5 text-xs font-medium shadow-soft transition-colors hover:bg-background"
              >
                <MapPin className="mr-1 inline size-3 text-primary" />
                {distanceLabel(pg.distance_m, pg.gate)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BadgeCheck,
              title: "Every PG verified",
              body: "Our team checks photos, address and owner identity before a listing goes live.",
            },
            {
              icon: HandCoins,
              title: "Zero broker fees",
              body: "You pay the PG owner directly. We never take a cut from students.",
            },
            {
              icon: PhoneCall,
              title: "Direct owner contact",
              body: "Call or WhatsApp the owner straight from the listing — no middlemen.",
            },
            {
              icon: ShieldCheck,
              title: "Safety first",
              body: "CCTV, biometric entry and curfew details listed upfront for parents.",
            },
          ].map((item) => (
            <Card key={item.title} className="border-border/70">
              <CardContent className="pt-1">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Featured verified PGs</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hand-picked stays with strong student reviews and quick owner response.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/pgs">View all</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.length === 0
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)
            : featured.map((pg) => <PgCard key={pg.id} pg={pg} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Top rated by students</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topRated.map((pg) => (
            <PgCard key={pg.id} pg={pg} />
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            What JECRC students say about us
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              {
                name: "Sneha, B.Tech CSE (Patna)",
                text: "I landed in Jaipur two days before orientation with no place to stay. Shortlisted three PGs here, visited them the same day and moved in.",
              },
              {
                name: "Mr. Verma, parent (Lucknow)",
                text: "Being able to see curfew timings, CCTV and warden details before visiting made the decision much easier for us as parents.",
              },
              {
                name: "Aditya, MBA (Ranchi)",
                text: "Brokers wanted one month rent as commission. Here I contacted the owner on WhatsApp directly and paid nothing extra.",
              },
            ].map((t) => (
              <Card key={t.name} className="border-border/70">
                <CardContent className="pt-1">
                  <Quote className="size-6 text-primary/50" />
                  <p className="mt-3 text-sm leading-relaxed">{t.text}</p>
                  <p className="mt-4 flex items-center gap-1 text-xs font-semibold">
                    <Star className="size-3.5 fill-accent text-accent" /> {t.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <Card className="warm-gradient border-none shadow-warm">
          <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Own a PG near JECRC University?
            </h2>
            <p className="max-w-xl text-sm text-secondary-foreground/90">
              List it free, get verified, and receive visit requests from students directly in your
              dashboard.
            </p>
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "signup", role: "owner" }}>
                List your PG free
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
