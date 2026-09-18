import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  BadgeCheck,
  Bed,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Scale,
  ShieldAlert,
  Star,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InquiryDialog } from "@/components/site/InquiryDialog";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import { pgDetailQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import {
  directionsUrl,
  distanceLabel,
  FALLBACK_PHOTO,
  GENDER_LABEL,
  mapEmbedUrl,
  rupees,
  waLink,
  walkMinutes,
} from "@/lib/pg";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pgs/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(pgDetailQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "PG not found — PG Near JECRC" }, { name: "robots", content: "noindex" }],
      };
    }
    const { pg } = loaderData;
    const title = `${pg.name} — ${distanceLabel(pg.distance_m, pg.gate)} | PG Near JECRC`;
    const description = `${GENDER_LABEL[pg.gender]} PG in ${pg.area}, Jaipur. Rent from ${rupees(
      pg.min_rent,
    )}/month. ${pg.food_included ? "Mess food included." : ""} ${distanceLabel(pg.distance_m, pg.gate)}.`;
    const image = pg.photos?.[0];
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div role="alert" className="px-4 py-20 text-center text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="px-4 py-20 text-center">
      <p className="font-display text-2xl font-semibold">This PG is no longer listed</p>
      <Button asChild className="mt-4">
        <Link to="/pgs">Browse other PGs</Link>
      </Button>
    </div>
  ),
  component: PgDetail,
});

function PgDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(pgDetailQuery(slug));
  const { isSaved, toggle } = useFavorites();
  const compare = useCompare();
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (!data) return null;
  const { pg, rooms, reviews } = data;
  const photos = pg.photos?.length ? pg.photos : [FALLBACK_PHOTO];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-4 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>{" "}
        /{" "}
        <Link to="/pgs" className="hover:text-foreground">
          PGs
        </Link>{" "}
        / <span className="text-foreground">{pg.name}</span>
      </nav>

      {/* Gallery */}
      <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => setLightbox(photos[0] ?? null)}
          className="overflow-hidden rounded-xl sm:col-span-2 sm:row-span-2"
        >
          <img
            src={photos[0]}
            alt={pg.name}
            className="h-64 w-full object-cover transition-transform hover:scale-[1.02] sm:h-full"
          />
        </button>
        {photos.slice(1, 5).map((photo, i) => (
          <button
            key={photo + i}
            type="button"
            onClick={() => setLightbox(photo)}
            className="hidden overflow-hidden rounded-xl sm:block"
          >
            <img
              src={photo}
              alt={`${pg.name} photo ${i + 2}`}
              className="h-full min-h-32 w-full object-cover transition-transform hover:scale-[1.02]"
            />
          </button>
        ))}
      </div>

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl p-2">
          <DialogTitle className="sr-only">{pg.name} photo</DialogTitle>
          {lightbox && <img src={lightbox} alt={pg.name} className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {pg.verified && (
                <Badge className="gap-1 bg-success text-success-foreground">
                  <BadgeCheck className="size-3" /> Verified listing
                </Badge>
              )}
              <Badge variant="secondary">{GENDER_LABEL[pg.gender]}</Badge>
              <Badge className="gap-1">
                <MapPin className="size-3" /> {distanceLabel(pg.distance_m, pg.gate)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ~{walkMinutes(pg.distance_m)} min walk
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{pg.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{pg.address}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
              {pg.review_count > 0 && (
                <span className="flex items-center gap-1 font-medium">
                  <Star className="size-4 fill-accent text-accent" /> {pg.rating.toFixed(1)}
                  <span className="font-normal text-muted-foreground">
                    ({pg.review_count} student reviews)
                  </span>
                </span>
              )}
              <span className="text-muted-foreground">
                Starting <strong className="text-foreground">{rupees(pg.min_rent)}</strong>/month
              </span>
            </div>
            {pg.description && <p className="mt-4 text-sm leading-relaxed">{pg.description}</p>}
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toggle(pg.id)}>
                <Heart className={cn("size-4", isSaved(pg.id) && "fill-primary text-primary")} />
                {isSaved(pg.id) ? "Saved" : "Save"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const r = compare.toggle(pg.id);
                  if (r === "full") toast.error(`Compare up to ${compare.max} PGs at a time`);
                }}
              >
                <Scale className="size-4" />
                {compare.isComparing(pg.id) ? "In compare" : "Compare"}
              </Button>
            </div>
          </div>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-xl">
                <Bed className="size-5 text-primary" /> Rooms & pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sharing</TableHead>
                    <TableHead>Monthly rent</TableHead>
                    <TableHead>Security deposit</TableHead>
                    <TableHead className="hidden sm:table-cell">Features</TableHead>
                    <TableHead className="text-right">Beds left</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.sharing}</TableCell>
                      <TableCell>{rupees(room.rent)}</TableCell>
                      <TableCell>{rupees(room.deposit)}</TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                        {[room.ac ? "AC" : "Non-AC", room.attached_bath ? "Attached washroom" : "Common washroom"].join(
                          " · ",
                        )}
                      </TableCell>
                      <TableCell className="text-right">{room.available}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="mt-3 text-xs text-muted-foreground">
                Notice period: {pg.notice_period ?? "1 month"}. Deposit is refundable as per the
                owner's policy after room inspection.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display text-xl">Amenities</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {pg.amenities.map((a) => (
                <span key={a} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium">
                  {a}
                </span>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-xl">
                <Utensils className="size-5 text-primary" /> Mess & food
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Food included:</strong> {pg.food_included ? "Yes" : "No"} ·{" "}
                {pg.food_type ?? "Veg only"}
              </p>
              {pg.meal_timings && (
                <p>
                  <strong>Meal timings:</strong> {pg.meal_timings}
                </p>
              )}
              {pg.weekly_menu && (
                <div>
                  <p className="font-semibold">Weekly menu preview</p>
                  <p className="mt-1 text-muted-foreground">{pg.weekly_menu}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-xl">
                <ShieldAlert className="size-5 text-primary" /> House rules & safety
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" /> Visiting hours:{" "}
                  {pg.visiting_hours ?? "Ask owner"}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" /> Entry curfew:{" "}
                  {pg.entry_curfew ?? "None"}
                </p>
              </div>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                {pg.house_rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/70">
            <CardHeader>
              <CardTitle className="font-display text-xl">Location & route from JECRC</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-border">
                <iframe
                  title={`Map of ${pg.name}`}
                  src={mapEmbedUrl(pg)}
                  className="h-64 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="text-muted-foreground">
                  {pg.landmark ? `${pg.landmark} · ` : ""}
                  {distanceLabel(pg.distance_m, pg.gate)}
                </p>
                <Button asChild variant="outline" size="sm">
                  <a href={directionsUrl(pg)} target="_blank" rel="noreferrer">
                    Get directions from campus
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <ReviewsSection pgId={pg.id} slug={pg.slug} reviews={reviews} />
        </div>

        {/* Sticky contact rail */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card className="border-border/70 shadow-warm">
            <CardContent className="space-y-3 pt-1">
              <p className="text-sm text-muted-foreground">Managed by</p>
              <p className="font-display text-lg font-semibold">{pg.owner_name ?? "PG owner"}</p>
              <Separator />
              <p className="text-sm">
                Rent from{" "}
                <span className="font-display text-2xl font-semibold">{rupees(pg.min_rent)}</span>
                /month
              </p>
              <p className="text-xs text-muted-foreground">
                Security deposit {rupees(pg.security_deposit)} · No brokerage
              </p>
              <InquiryDialog pg={pg} trigger={<Button className="w-full" size="lg">Book a visit</Button>} />
              <Button asChild variant="outline" className="w-full">
                <a href={waLink(pg.whatsapp ?? pg.contact_phone, pg.name)} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" /> WhatsApp owner
                </a>
              </Button>
              {pg.contact_phone && (
                <Button asChild variant="ghost" className="w-full">
                  <a href={`tel:${pg.contact_phone.replace(/\s/g, "")}`}>
                    <Phone className="size-4" /> {pg.contact_phone}
                  </a>
                </Button>
              )}
              <p className="text-center text-[11px] text-muted-foreground">
                Always visit in person and never pay a deposit before seeing the room.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ReviewsSection({
  pgId,
  slug,
  reviews,
}: {
  pgId: string;
  slug: string;
  reviews: { id: string; author_name: string; rating: number; comment: string | null; created_at: string }[];
}) {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);

  const submit = useMutation({
    mutationFn: async (comment: string) => {
      if (!user) throw new Error("Sign in to post a review.");
      const { error } = await supabase.from("reviews").insert({
        pg_id: pgId,
        user_id: user.id,
        author_name: profile?.profile?.full_name ?? user.email?.split("@")[0] ?? "Student",
        rating,
        comment: comment || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks! Your review is live.");
      queryClient.invalidateQueries({ queryKey: ["pg", slug] });
      queryClient.invalidateQueries({ queryKey: ["pgs"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <Card className="border-border/70">
      <CardHeader>
        <CardTitle className="font-display text-xl">Student reviews ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No reviews yet. Be the first student to share your experience.
          </p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl bg-secondary/60 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{review.author_name}</p>
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "size-3.5",
                      i < review.rating ? "fill-accent text-accent" : "text-muted-foreground/40",
                    )}
                  />
                ))}
              </span>
            </div>
            {review.comment && <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>}
            <p className="mt-2 text-[11px] text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        ))}

        <Separator />

        {user ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const comment = String(new FormData(form).get("comment") ?? "").trim();
              submit.mutate(comment, { onSuccess: () => form.reset() });
            }}
          >
            <Label>Your rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} stars`}>
                  <Star
                    className={cn(
                      "size-6",
                      value <= rating ? "fill-accent text-accent" : "text-muted-foreground/40",
                    )}
                  />
                </button>
              ))}
            </div>
            <Textarea
              name="comment"
              rows={3}
              placeholder="How was the food, cleanliness, Wi-Fi and the owner's response?"
            />
            <Button type="submit" disabled={submit.isPending}>
              Post review
            </Button>
          </form>
        ) : (
          <div className="rounded-xl bg-secondary p-4 text-sm">
            <Link to="/auth" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{" "}
            to write a review for this PG.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
