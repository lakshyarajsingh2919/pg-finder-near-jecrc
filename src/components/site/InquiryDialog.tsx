import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Pg } from "@/lib/pg";

export function InquiryDialog({ pg, trigger }: { pg: Pg; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const submit = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const fd = new FormData(form);
      const payload = {
        pg_id: pg.id,
        student_id: user?.id ?? null,
        name: String(fd.get("name") ?? "").trim(),
        phone: String(fd.get("phone") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim() || null,
        visit_date: String(fd.get("visit_date") ?? "") || null,
        message: String(fd.get("message") ?? "").trim() || null,
      };
      if (!payload.name || payload.phone.replace(/\D/g, "").length < 10) {
        throw new Error("Please enter your name and a valid 10-digit phone number.");
      }
      const { error } = await supabase.from("inquiries").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Request sent to ${pg.owner_name ?? "the owner"}. They usually reply within a day.`);
      setOpen(false);
    },
    onError: (error: Error) => toast.error(error.message || "Could not send your request."),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Book a visit — {pg.name}</DialogTitle>
          <DialogDescription>
            Your details go straight to the PG owner. No brokerage, no charges.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit.mutate(e.currentTarget);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" name="name" placeholder="e.g. Ankit Raj" required />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" inputMode="tel" placeholder="10-digit mobile" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visit_date">Preferred visit date</Label>
              <Input id="visit_date" name="visit_date" type="date" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email (optional)</Label>
            <Input id="email" name="email" type="email" defaultValue={user?.email ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={3}
              placeholder="Which sharing type do you need? When do you want to move in?"
            />
          </div>
          <Button type="submit" className="w-full" disabled={submit.isPending}>
            {submit.isPending ? "Sending…" : "Send request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
