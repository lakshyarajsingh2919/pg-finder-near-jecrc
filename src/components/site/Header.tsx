import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, LogOut, Menu, Scale, ShieldCheck, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { useCompare } from "@/hooks/useCompare";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/pgs", label: "Browse PGs" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { user } = useAuth();
  const { data } = useProfile();
  const { ids } = useCompare();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const isOwner = data?.roles.includes("owner") || data?.profile?.role === "owner";
  const isAdmin = data?.roles.includes("admin");

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="mr-auto flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <Home className="size-4" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold">PG Near JECRC</span>
            <span className="block text-[11px] text-muted-foreground">Verified stays in Jaipur</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link to="/compare" className="relative hidden sm:block">
          <Button variant="ghost" size="icon" aria-label="Compare PGs">
            <Scale className="size-4" />
          </Button>
          {ids.length > 0 && (
            <Badge className="pointer-events-none absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px]">
              {ids.length}
            </Badge>
          )}
        </Link>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                {data?.profile?.full_name?.split(" ")[0] ?? "Account"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
                {user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/favorites">
                  <Heart className="mr-2 size-4" /> My shortlist
                </Link>
              </DropdownMenuItem>
              {isOwner && (
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Owner dashboard</Link>
                </DropdownMenuItem>
              )}
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link to="/admin">
                    <ShieldCheck className="mr-2 size-4" /> Admin panel
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup", role: "owner" }}>
                List your PG
              </Link>
            </Button>
          </div>
        )}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-6">
            <SheetTitle className="font-display">Menu</SheetTitle>
            <nav className="mt-6 flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/compare"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Compare ({ids.length})
              </Link>
              {user ? (
                <>
                  <Link
                    to="/favorites"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                  >
                    My shortlist
                  </Link>
                  {isOwner && (
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      Owner dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
                    >
                      Admin panel
                    </Link>
                  )}
                  <Button variant="outline" className="mt-3" onClick={signOut}>
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild className="mt-3" onClick={() => setOpen(false)}>
                    <Link to="/auth">Sign in / Sign up</Link>
                  </Button>
                  <Button asChild variant="outline" className="mt-2" onClick={() => setOpen(false)}>
                    <Link to="/auth" search={{ mode: "signup", role: "owner" }}>
                      List your PG
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
