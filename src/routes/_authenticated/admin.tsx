import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useAuth";
import { rupees, STATUS_LABEL, type Pg } from "@/lib/pg";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — PG Near JECRC" },
      { name: "description", content: "Review, approve and verify submitted PG listings." },
      { property: "og:title", content: "Admin panel" },
      { property: "og:description", content: "Verify submitted PG listings." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const isAdmin = profile?.roles.includes("admin");

  const listings = useQuery({
    queryKey: ["admin-pgs"],
    enabled: !!isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pgs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Pg[];
    },
  });

  const update = useMutation({
    mutationFn: async (patch: { id: string } & Partial<Pg>) => {
      const { id, ...rest } = patch;
      const { error } = await supabase.from("pgs").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Listing updated");
      queryClient.invalidateQueries({ queryKey: ["admin-pgs"] });
      queryClient.invalidateQueries({ queryKey: ["pgs"] });
    },
    onError: () => toast.error("Could not update the listing"),
  });

  if (isLoading) return <div className="px-4 py-20 text-center text-sm text-muted-foreground">Loading…</div>;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <ShieldCheck className="mx-auto size-10 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-semibold">Admin access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have the admin role for this platform.
        </p>
        <Button asChild className="mt-5">
          <Link to="/">Back home</Link>
        </Button>
      </div>
    );
  }

  const pending = (listings.data ?? []).filter((pg) => pg.status === "pending");
  const others = (listings.data ?? []).filter((pg) => pg.status !== "pending");

  const card = (pg: Pg) => (
    <Card key={pg.id} className="border-border/70">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          {pg.name}
          <Badge variant="secondary">{STATUS_LABEL[pg.status]}</Badge>
          {pg.verified && (
            <Badge className="gap-1 bg-success text-success-foreground">
              <BadgeCheck className="size-3" /> Verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          {pg.address} · {pg.distance_m}m from {pg.gate} · from {rupees(pg.min_rent)}/month
        </p>
        <p className="text-muted-foreground">
          Owner: {pg.owner_name ?? "—"} · {pg.contact_phone ?? "—"}
        </p>
        <div className="flex gap-2 overflow-x-auto">
          {pg.photos.map((photo) => (
            <img key={photo} src={photo} alt={pg.name} className="size-24 rounded-lg object-cover" />
          ))}
        </div>
        <Input
          placeholder="Note to the owner (needed when requesting changes)"
          value={notes[pg.id] ?? pg.admin_note ?? ""}
          onChange={(e) => setNotes((prev) => ({ ...prev, [pg.id]: e.target.value }))}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() =>
              update.mutate({ id: pg.id, status: "active", verified: true, admin_note: null })
            }
          >
            Approve & verify
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              update.mutate({
                id: pg.id,
                status: "rejected",
                admin_note: notes[pg.id] ?? "Please review and resubmit with clearer details.",
              })
            }
          >
            Request changes
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => update.mutate({ id: pg.id, verified: !pg.verified })}
          >
            {pg.verified ? "Remove badge" : "Give badge"}
          </Button>
          {pg.status === "active" && (
            <Button asChild size="sm" variant="ghost">
              <Link to="/pgs/$slug" params={{ slug: pg.slug }}>
                View live
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Admin panel</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Verify submissions before students can see them.
      </p>
      <Tabs defaultValue="pending" className="mt-8">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="all">All listings ({others.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6 space-y-4">
          {pending.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing waiting for review right now.
            </p>
          ) : (
            pending.map(card)
          )}
        </TabsContent>
        <TabsContent value="all" className="mt-6 space-y-4">
          {others.map(card)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
