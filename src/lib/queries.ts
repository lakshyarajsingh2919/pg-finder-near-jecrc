import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Pg, Review, RoomType } from "@/lib/pg";

export const activePgsQuery = queryOptions({
  queryKey: ["pgs", "active"],
  queryFn: async (): Promise<Pg[]> => {
    const { data, error } = await supabase
      .from("pgs")
      .select("*")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("distance_m", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Pg[];
  },
  staleTime: 60_000,
});

export function pgDetailQuery(slug: string) {
  return queryOptions({
    queryKey: ["pg", slug],
    queryFn: async () => {
      const { data: pg, error } = await supabase.from("pgs").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      if (!pg) return null;
      const [rooms, reviews] = await Promise.all([
        supabase.from("room_types").select("*").eq("pg_id", pg.id).order("rent", { ascending: true }),
        supabase
          .from("reviews")
          .select("*")
          .eq("pg_id", pg.id)
          .order("created_at", { ascending: false }),
      ]);
      return {
        pg: pg as Pg,
        rooms: (rooms.data ?? []) as RoomType[],
        reviews: (reviews.data ?? []) as Review[],
      };
    },
  });
}

export function pgsByIdsQuery(ids: string[]) {
  return queryOptions({
    queryKey: ["pgs", "by-ids", [...ids].sort().join(",")],
    enabled: ids.length > 0,
    queryFn: async (): Promise<{ pgs: Pg[]; rooms: RoomType[] }> => {
      const [pgs, rooms] = await Promise.all([
        supabase.from("pgs").select("*").in("id", ids),
        supabase.from("room_types").select("*").in("pg_id", ids),
      ]);
      if (pgs.error) throw pgs.error;
      return { pgs: (pgs.data ?? []) as Pg[], rooms: (rooms.data ?? []) as RoomType[] };
    },
  });
}
