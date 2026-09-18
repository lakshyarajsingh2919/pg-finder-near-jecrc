import { Link } from "@tanstack/react-router";
import { Heart, MapPin, MessageCircle, Scale, Star, BadgeCheck, Utensils } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  distanceLabel,
  FALLBACK_PHOTO,
  GENDER_LABEL,
  rupees,
  waLink,
  walkMinutes,
  type Pg,
} from "@/lib/pg";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompare } from "@/hooks/useCompare";
import { InquiryDialog } from "@/components/site/InquiryDialog";

export function PgCard({ pg, view = "grid" }: { pg: Pg; view?: "grid" | "list" }) {
  const { isSaved, toggle } = useFavorites();
  const compare = useCompare();
  const photo = pg.photos?.[0] ?? FALLBACK_PHOTO;

  function onCompare() {
    const result = compare.toggle(pg.id);
    if (result === "full") toast.error(`You can compare up to ${compare.max} PGs at a time`);
    else if (result === "added") toast.success(`${pg.name} added to compare`);
  }

  return (
    <Card
      className={cn(
        "group gap-0 overflow-hidden border-border/80 p-0 transition-shadow hover:shadow-warm",
        view === "list" && "sm:flex-row",
      )}
    >
      <Link
        to="/pgs/$slug"
        params={{ slug: pg.slug }}
        className={cn("relative block overflow-hidden", view === "list" && "sm:w-72 sm:shrink-0")}
      >
        <img
          src={photo}
          alt={`${pg.name} in ${pg.area}`}
          loading="lazy"
          className={cn(
            "h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105",
            view === "list" && "sm:h-full sm:min-h-44",
          )}
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {pg.verified && (
            <Badge className="gap-1 bg-success text-success-foreground">
              <BadgeCheck className="size-3" /> Verified
            </Badge>
          )}
          <Badge variant="secondary" className="bg-background/90">
            {GENDER_LABEL[pg.gender]}
          </Badge>
        </div>
        <Badge className="absolute bottom-3 left-3 gap-1 bg-primary/95">
          <MapPin className="size-3" /> {distanceLabel(pg.distance_m, pg.gate)}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-2">
          <Link to="/pgs/$slug" params={{ slug: pg.slug }} className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg font-semibold leading-snug">{pg.name}</h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {pg.area} · {walkMinutes(pg.distance_m)} min walk
            </p>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Save to shortlist"
            onClick={() => toggle(pg.id)}
          >
            <Heart className={cn("size-4", isSaved(pg.id) && "fill-primary text-primary")} />
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm">
          {pg.review_count > 0 ? (
            <span className="flex items-center gap-1 font-medium">
              <Star className="size-3.5 fill-accent text-accent" /> {pg.rating.toFixed(1)}
              <span className="text-xs font-normal text-muted-foreground">
                ({pg.review_count} reviews)
              </span>
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">New listing</span>
          )}
          {pg.food_included && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Utensils className="size-3.5" /> {pg.food_type ?? "Mess included"}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {pg.amenities.slice(0, 4).map((a) => (
            <span key={a} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
              {a}
            </span>
          ))}
          {pg.amenities.length > 4 && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium">
              +{pg.amenities.length - 4} more
            </span>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border/70 pt-3">
          <p className="text-sm text-muted-foreground">
            From <span className="font-display text-xl font-semibold text-foreground">{rupees(pg.min_rent)}</span>
            /month
          </p>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" aria-label="Add to compare" onClick={onCompare}>
              <Scale className={cn("size-4", compare.isComparing(pg.id) && "text-primary")} />
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={waLink(pg.whatsapp ?? pg.contact_phone, pg.name)} target="_blank" rel="noreferrer">
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </Button>
            <InquiryDialog pg={pg} trigger={<Button size="sm">Book a visit</Button>} />
          </div>
        </div>
      </div>
    </Card>
  );
}
