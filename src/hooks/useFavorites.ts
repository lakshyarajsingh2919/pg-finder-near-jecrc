import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("favorites").select("pg_id").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((row) => row.pg_id as string);
    },
  });

  const toggle = useMutation({
    mutationFn: async (pgId: string) => {
      if (!user) throw new Error("not-signed-in");
      const saved = (query.data ?? []).includes(pgId);
      if (saved) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("pg_id", pgId);
        if (error) throw error;
        return "removed" as const;
      }
      const { error } = await supabase.from("favorites").insert({ user_id: user.id, pg_id: pgId });
      if (error) throw error;
      return "added" as const;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success(result === "added" ? "Saved to your shortlist" : "Removed from shortlist");
    },
    onError: (error: Error) => {
      if (error.message === "not-signed-in") {
        toast.error("Sign in to save PGs to your shortlist");
        return;
      }
      toast.error("Could not update your shortlist. Please try again.");
    },
  });

  return {
    ids: query.data ?? [],
    isSaved: (pgId: string) => (query.data ?? []).includes(pgId),
    toggle: (pgId: string) => toggle.mutate(pgId),
    signedIn: !!user,
  };
}
