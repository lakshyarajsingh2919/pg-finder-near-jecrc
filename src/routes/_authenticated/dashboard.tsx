import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { rupees, STATUS_LABEL, type Inquiry, type Pg } from "@/lib/pg";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Owner dashboard — PG Near JECRC" },
      {
        name: "description",
        content: "Manage your PG listings, verification status and student visit requests.",
      },
      { property: "og:title", content: "PG owner dashboard" },
      { property: "og:description", content: "Manage listings and student inquiries." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const listings = useQuery({
    queryKey: ["my-pgs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pgs")
        .select("*")
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Pg[];
    },
  });

  const inquiries = useQuery({
    queryKey: ["my-inquiries", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Inquiry[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("pgs").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Listing updated");
      queryClient.invalidateQueries({ queryKey: ["my-pgs"] });
      queryClient.invalidateQueries({ queryKey: ["pgs"] });
    },
    onError: () => toast.error("Could not update the listing"),
  });

  const pgName = (id: string) => listings.data?.find((pg) => pg.id === id)?.name ?? "Your PG";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Owner dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your listings and respond to student visit requests.
          </p>
        </div>
        <Button asChild>
          <Link to="/listings/new">
            <Plus className="size-4" /> Add a PG
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="listings" className="mt-8">
        <TabsList>
          <TabsTrigger value="listings">My listings ({listings.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries ({inquiries.data?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6 space-y-4">
          {listings.data?.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-14 text-center">
                <p className="font-display text-lg font-semibold">No listings yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Submit your PG and our team will verify it before it goes live.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/listings/new">Add your first PG</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {listings.data?.map((pg) => (
            <Card key={pg.id} className="border-border/70">
              <CardContent className="flex flex-wrap items-center gap-4 pt-1">
                <img
                  src={pg.photos?.[0]}
                  alt={pg.name}
                  className="size-20 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold">{pg.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {pg.area} · from {rupees(pg.min_rent)}/month
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={pg.status === "active" ? "default" : "secondary"}>
                      {STATUS_LABEL[pg.status]}
                    </Badge>
                    {pg.verified && <Badge className="bg-success text-success-foreground">Verified</Badge>}
                  </div>
                  {pg.admin_note && (
                    <p className="mt-2 text-xs text-destructive">Admin note: {pg.admin_note}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {pg.status === "active" && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/pgs/$slug" params={{ slug: pg.slug }}>
                        View
                      </Link>
                    </Button>
                  )}
                  {(pg.status === "draft" || pg.status === "rejected") && (
                    <Button
                      size="sm"
                      onClick={() => setStatus.mutate({ id: pg.id, status: "pending" })}
                    >
                      Submit for verification
                    </Button>
                  )}
                  {pg.status === "active" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatus.mutate({ id: pg.id, status: "inactive" })}
                    >
                      Pause
                    </Button>
                  )}
                  {pg.status === "inactive" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatus.mutate({ id: pg.id, status: "active" })}
                    >
                      Reactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6 space-y-4">
          {inquiries.data?.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-14 text-center">
                <Inbox className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No inquiries yet. They appear here as soon as a student requests a visit.
                </p>
              </CardContent>
            </Card>
          )}
          {inquiries.data?.map((inq) => (
            <Card key={inq.id} className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {inq.name} · {pgName(inq.pg_id)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  {inq.phone}
                  {inq.email ? ` · ${inq.email}` : ""}
                  {inq.visit_date ? ` · wants to visit on ${inq.visit_date}` : ""}
                </p>
                {inq.message && <p>{inq.message}</p>}
                <div className="flex gap-2 pt-1">
                  <Button asChild size="sm" variant="outline">
                    <a href={`tel:${inq.phone.replace(/\s/g, "")}`}>Call</a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={`https://wa.me/${inq.phone.replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
