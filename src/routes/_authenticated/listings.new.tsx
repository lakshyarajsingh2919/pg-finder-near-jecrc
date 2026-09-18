import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AMENITIES, SHARING_TYPES, slugify, type Gender } from "@/lib/pg";

export const Route = createFileRoute("/_authenticated/listings/new")({
  head: () => ({
    meta: [
      { title: "List your PG — PG Near JECRC" },
      {
        name: "description",
        content:
          "Submit your PG near JECRC University for free. Add rooms, rent, amenities, mess details and photos, then get verified.",
      },
      { property: "og:title", content: "List your PG near JECRC University" },
      { property: "og:description", content: "Free listing, verified badge, direct student inquiries." },
    ],
  }),
  component: NewListing,
});

function NewListing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gender, setGender] = useState<Gender>("coed");
  const [amenities, setAmenities] = useState<string[]>(["Wi-Fi", "Mess/Food included"]);
  const [rooms, setRooms] = useState(
    SHARING_TYPES.map((sharing) => ({ sharing, rent: "", deposit: "", enabled: sharing === "Double" })),
  );

  const save = useMutation({
    mutationFn: async ({ form, submit }: { form: HTMLFormElement; submit: boolean }) => {
      const fd = new FormData(form);
      const text = (key: string) => String(fd.get(key) ?? "").trim();
      const chosen = rooms.filter((r) => r.enabled && Number(r.rent) > 0);
      if (chosen.length === 0) throw new Error("Add rent for at least one room type.");
      const minRent = Math.min(...chosen.map((r) => Number(r.rent)));

      const { data: pg, error } = await supabase
        .from("pgs")
        .insert({
          owner_id: user!.id,
          slug: `${slugify(text("name"))}-${Math.random().toString(36).slice(2, 6)}`,
          name: text("name"),
          tagline: text("tagline") || null,
          description: text("description") || null,
          area: text("area"),
          address: text("address"),
          landmark: text("landmark") || null,
          distance_m: Number(fd.get("distance_m")) || 1000,
          gate: text("gate") || "Gate 1",
          gender,
          min_rent: minRent,
          security_deposit: Number(chosen[0]?.deposit) || 5000,
          notice_period: text("notice_period") || "1 month",
          owner_name: text("owner_name"),
          contact_phone: text("contact_phone"),
          whatsapp: text("whatsapp") || text("contact_phone"),
          amenities,
          photos: text("photos")
            .split(/[\n,]/)
            .map((p) => p.trim())
            .filter(Boolean),
          food_included: amenities.includes("Mess/Food included"),
          food_type: text("food_type") || "Veg only",
          meal_timings: text("meal_timings") || null,
          weekly_menu: text("weekly_menu") || null,
          house_rules: text("house_rules")
            .split("\n")
            .map((r) => r.trim())
            .filter(Boolean),
          visiting_hours: text("visiting_hours") || null,
          entry_curfew: text("entry_curfew") || null,
          status: submit ? "pending" : "draft",
        })
        .select("id")
        .single();
      if (error) throw error;

      const { error: roomError } = await supabase.from("room_types").insert(
        chosen.map((r) => ({
          pg_id: pg.id,
          sharing: r.sharing,
          rent: Number(r.rent),
          deposit: Number(r.deposit) || 0,
          ac: amenities.includes("AC"),
          attached_bath: amenities.includes("Attached Washroom"),
          available: 1,
        })),
      );
      if (roomError) throw roomError;
      return submit;
    },
    onSuccess: (submitted) => {
      toast.success(
        submitted
          ? "Submitted! Our team will verify your PG before it goes live."
          : "Saved as a draft. You can submit it anytime.",
      );
      navigate({ to: "/dashboard" });
    },
    onError: (error: Error) => toast.error(error.message || "Could not save the listing."),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">List your PG</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Fill in the details below. Listings go live after our team verifies them.
      </p>

      <form
        className="mt-8 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({ form: e.currentTarget, submit: true });
        }}
      >
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-lg">1. Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">PG name</Label>
              <Input id="name" name="name" required placeholder="e.g. Shree Balaji Boys PG" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tagline">Short tagline</Label>
              <Input id="tagline" name="tagline" placeholder="e.g. 500m from JECRC Gate 1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Who can stay?</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boys">Boys only</SelectItem>
                  <SelectItem value="girls">Girls only</SelectItem>
                  <SelectItem value="coed">Co-ed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-lg">2. Location</CardTitle>
            <CardDescription>Distance from campus is the first thing students check.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="area">Area</Label>
                <Input id="area" name="area" required placeholder="Sitapura / RIICO / Vidhani / Mahal Road" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="landmark">Nearby landmark</Label>
                <Input id="landmark" name="landmark" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Full address</Label>
              <Input id="address" name="address" required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="distance_m">Distance from JECRC (in metres)</Label>
                <Input id="distance_m" name="distance_m" type="number" min={50} defaultValue={1000} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gate">Nearest gate</Label>
                <Input id="gate" name="gate" defaultValue="Gate 1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-lg">3. Rooms & pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rooms.map((room, index) => (
              <div key={room.sharing} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
                <label className="flex w-28 items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={room.enabled}
                    onCheckedChange={(checked) =>
                      setRooms((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, enabled: !!checked } : r)),
                      )
                    }
                  />
                  {room.sharing}
                </label>
                <Input
                  className="w-36"
                  placeholder="Rent ₹"
                  inputMode="numeric"
                  value={room.rent}
                  onChange={(e) =>
                    setRooms((prev) => prev.map((r, i) => (i === index ? { ...r, rent: e.target.value } : r)))
                  }
                />
                <Input
                  className="w-40"
                  placeholder="Deposit ₹"
                  inputMode="numeric"
                  value={room.deposit}
                  onChange={(e) =>
                    setRooms((prev) => prev.map((r, i) => (i === index ? { ...r, deposit: e.target.value } : r)))
                  }
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label htmlFor="notice_period">Notice period</Label>
              <Input id="notice_period" name="notice_period" defaultValue="1 month" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-lg">4. Amenities</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {AMENITIES.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={amenities.includes(a)}
                  onCheckedChange={(checked) =>
                    setAmenities((prev) => (checked ? [...prev, a] : prev.filter((x) => x !== a)))
                  }
                />
                {a}
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-lg">5. Mess, rules & photos</CardTitle>
            <CardDescription>Paste image links (one per line) for your PG photos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="food_type">Food type</Label>
                <Input id="food_type" name="food_type" placeholder="Veg only / Veg & Non-veg" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="meal_timings">Meal timings</Label>
                <Input id="meal_timings" name="meal_timings" placeholder="Breakfast 8-9 AM…" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weekly_menu">Weekly menu preview</Label>
              <Textarea id="weekly_menu" name="weekly_menu" rows={2} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="visiting_hours">Visiting hours</Label>
                <Input id="visiting_hours" name="visiting_hours" placeholder="9 AM - 8 PM" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="entry_curfew">Entry curfew</Label>
                <Input id="entry_curfew" name="entry_curfew" placeholder="11:00 PM" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="house_rules">House rules (one per line)</Label>
              <Textarea id="house_rules" name="house_rules" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="photos">Photo links (one per line)</Label>
              <Textarea id="photos" name="photos" rows={3} placeholder="https://…" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-lg">6. Contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="owner_name">Owner / manager name</Label>
              <Input id="owner_name" name="owner_name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact_phone">Phone</Label>
              <Input id="contact_phone" name="contact_phone" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
              <Input id="whatsapp" name="whatsapp" />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={save.isPending}>
            Submit for verification
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={save.isPending}
            onClick={(e) => {
              const form = e.currentTarget.closest("form");
              if (form?.reportValidity()) save.mutate({ form, submit: false });
            }}
          >
            Save as draft
          </Button>
        </div>
      </form>
    </div>
  );
}
