import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type AuthSearch = { mode?: string; role?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search.mode === "signup" ? "signup" : undefined,
    role: search.role === "owner" ? "owner" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create an account — PG Near JECRC" },
      {
        name: "description",
        content:
          "Sign in as a student to save and compare PGs near JECRC University, or as a PG owner to list and manage your property.",
      },
      { property: "og:title", content: "Sign in — PG Near JECRC" },
      {
        property: "og:description",
        content: "Students save favourites. PG owners manage listings and visit requests.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode === "signup" ? "signup" : "signin");
  const [role, setRole] = useState<"student" | "owner">(search.role === "owner" ? "owner" : "student");
  const [busy, setBusy] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: role === "owner" ? "/dashboard" : "/", replace: true });
  }, [user, navigate, role]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "").trim();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, role },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setSentEmail(true);
          toast.success("Check your email to confirm your account.");
          return;
        }
        toast.success("Account created!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function googleSignIn() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 lg:grid-cols-2">
      <div className="hidden lg:block">
        <h1 className="font-display text-3xl font-semibold leading-tight">
          One account for your whole PG hunt around JECRC
        </h1>
        <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <GraduationCap className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <strong className="text-foreground">Students:</strong> save favourites, compare PGs
              side-by-side and track your visit requests.
            </span>
          </li>
          <li className="flex gap-3">
            <Building2 className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <strong className="text-foreground">PG owners:</strong> publish your listing free, get
              verified and receive student inquiries directly.
            </span>
          </li>
        </ul>
        <p className="mt-8 rounded-xl bg-secondary p-4 text-xs text-muted-foreground">
          Browsing does not need an account. Sign in only when you want to save, compare or list a PG.
        </p>
      </div>

      <Card className="border-border/70 shadow-warm">
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            {mode === "signup" ? "Create your account" : "Sign in"}
          </CardTitle>
          <CardDescription>
            {mode === "signup"
              ? "Tell us whether you are looking for a PG or listing one."
              : "Welcome back — pick up where you left off."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { key: "student", label: "I'm a student / parent", icon: GraduationCap },
                  { key: "owner", label: "I'm a PG owner", icon: Building2 },
                ] as const
              ).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setRole(option.key)}
                  className={cn(
                    "rounded-xl border p-3 text-left text-sm transition-colors",
                    role === option.key
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  <option.icon className="mb-1.5 size-4 text-primary" />
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {sentEmail ? (
            <div className="rounded-xl bg-secondary p-4 text-sm">
              We've emailed you a confirmation link. Click it, then come back and sign in.
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" name="full_name" required placeholder="Your name" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {mode === "signup" ? "Create account" : "Sign in"}
              </Button>
            </form>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={googleSignIn} disabled={busy}>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => {
                setSentEmail(false);
                setMode(mode === "signup" ? "signin" : "signup");
              }}
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
