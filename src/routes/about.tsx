import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About PG Near JECRC — Helping outstation students settle in Jaipur" },
      {
        name: "description",
        content:
          "PG Near JECRC is a student-first directory of verified PG accommodation around JECRC University, Sitapura. Our mission: no brokers, no surprises for outstation students.",
      },
      { property: "og:title", content: "About PG Near JECRC" },
      {
        property: "og:description",
        content:
          "Why we built a verified, broker-free PG directory for students coming to JECRC University, Jaipur.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
        <Sparkles className="size-3.5 text-primary" /> Our mission
      </span>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">
        Nobody should hunt for a PG in an unfamiliar city with only a broker's word to go on
      </h1>
      <p className="mt-5 text-base leading-relaxed text-muted-foreground">
        Every July, thousands of students reach Jaipur from Bihar, UP, MP, Jharkhand, the North-East
        and beyond to join JECRC University. Most arrive with two suitcases, a hotel booking for
        three nights, and no idea what a fair PG rent in Sitapura looks like. Brokers fill that gap —
        often charging a month's rent for a room the student could have found themselves.
      </p>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        PG Near JECRC exists to remove that guesswork. We collect PGs around Sitapura, RIICO, Vidhani
        and Mahal Road, verify each listing's photos and owner details, publish the real rent, mess
        menu, curfew and distance from the campus gates, and then step out of the way so students
        talk to owners directly.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            title: "Verified before live",
            body: "Our team reviews every submission — address, photos and owner contact — before it appears in search.",
          },
          {
            icon: HeartHandshake,
            title: "Free for students",
            body: "We never charge students or take commission on a booking. Owners list for free too.",
          },
          {
            icon: Compass,
            title: "Distance-first",
            body: "Each listing shows exact walking distance from the JECRC gates, because that matters most at 8 AM.",
          },
        ].map((item) => (
          <Card key={item.title} className="border-border/70">
            <CardContent className="pt-1">
              <item.icon className="size-5 text-primary" />
              <h2 className="mt-3 font-display text-lg font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-10 border-border/70 bg-secondary/50">
        <CardContent className="pt-1">
          <h2 className="font-display text-xl font-semibold">How a listing gets verified</h2>
          <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-muted-foreground">
            <li>The owner submits the PG with address, room types, rent, amenities and photos.</li>
            <li>The listing enters “Pending verification” and stays hidden from students.</li>
            <li>
              Our team checks the location against the JECRC gates, confirms the owner by phone, and
              reviews the photos.
            </li>
            <li>
              Approved PGs go live with a verified badge. Anything unclear is sent back to the owner
              with a note.
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/pgs">Browse verified PGs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/contact">Talk to us</Link>
        </Button>
      </div>
    </div>
  );
}
