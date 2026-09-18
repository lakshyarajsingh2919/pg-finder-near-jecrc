import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & FAQ — PG Near JECRC" },
      {
        name: "description",
        content:
          "Reach the PG Near JECRC team for support or grievances, and read our FAQ for outstation students on what to check before booking a PG in Jaipur.",
      },
      { property: "og:title", content: "Contact & student FAQ — PG Near JECRC" },
      {
        property: "og:description",
        content:
          "Support, grievance redressal and safety tips for students moving to Jaipur for JECRC University.",
      },
    ],
  }),
  component: Contact,
});

const FAQS = [
  {
    q: "What should I check before booking a PG in Jaipur?",
    a: "Visit in person if you can. Check water pressure and RO water, look at the actual room you will get (not a sample room), ask what is included in the rent (electricity, laundry, mess), confirm the security deposit refund rules in writing, and ask current residents about the food quality.",
  },
  {
    q: "How much rent is normal near JECRC University?",
    a: "Around Sitapura and Vidhani, four-sharing rooms typically start near ₹3,800–5,000 per month with mess food included. Double sharing with AC is usually ₹6,500–9,000, and single AC rooms go up to ₹9,500–12,000. Anything far above this range should come with a clear reason.",
  },
  {
    q: "Is it safe for girls staying alone in Sitapura?",
    a: "Girls-only PGs near campus commonly have biometric or warden-controlled entry, CCTV on each floor and a 10 PM curfew. Prefer a PG on a main road with shops nearby, save the local police helpline (112) and share your live location with family during the first few weeks.",
  },
  {
    q: "Should I pay a deposit before seeing the room?",
    a: "No. Never transfer a security deposit or token amount before physically visiting or at least doing a live video walkthrough. Always ask for a receipt and a simple written agreement mentioning rent, deposit, notice period and what is included.",
  },
  {
    q: "Do you charge students any fee or brokerage?",
    a: "Never. The platform is free for students and free for PG owners. You pay rent and deposit directly to the owner — we do not handle money at all.",
  },
  {
    q: "What if a listing turns out to be wrong or misleading?",
    a: "Use the grievance form on this page with the PG name and what you found. We re-verify the listing and remove the verified badge or the entire listing if the owner's information was inaccurate.",
  },
];

function Contact() {
  const [sent, setSent] = useState(false);
  const [topic, setTopic] = useState("general");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl font-semibold">We're here to help</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Questions about a listing, a safety concern, or a complaint about a PG owner — write to us and
        we respond within one working day.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="font-display text-xl">Contact & grievance form</CardTitle>
            <CardDescription>
              For grievances, please mention the PG name and your visit date so we can verify quickly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="rounded-xl bg-secondary p-5 text-sm">
                Thank you — your message has been recorded. Our support team will reach out on the
                contact details you shared.
              </div>
            ) : (
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                  toast.success("Message received. We'll get back to you soon.");
                }}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" name="phone" inputMode="tel" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Topic</Label>
                  <Select value={topic} onValueChange={setTopic}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General question</SelectItem>
                      <SelectItem value="listing">Problem with a listing</SelectItem>
                      <SelectItem value="grievance">Grievance against a PG owner</SelectItem>
                      <SelectItem value="owner">I want to list my PG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" rows={5} required />
                </div>
                <Button type="submit">Send message</Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-secondary/50">
          <CardContent className="space-y-4 pt-1 text-sm">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 text-primary" /> Sitapura, Jaipur, Rajasthan 302022
            </p>
            <p className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 text-primary" /> +91 141 000 0000 (Mon–Sat, 10 AM–7 PM)
            </p>
            <p className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 text-primary" /> support@pgnearjecrc.in
            </p>
            <p className="text-xs text-muted-foreground">
              In an emergency, call 112. For campus-related issues, contact JECRC University student
              welfare directly — we are an independent platform and not affiliated with the
              university.
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold">FAQ for outstation students</h2>
        <Accordion type="single" collapsible className="mt-4">
          {FAQS.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
