import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold">PG Near JECRC</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A student-first directory of verified paying guest accommodation around JECRC
            University, Sitapura, Jaipur. No brokers, no hidden fees.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">For students</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/pgs" className="hover:text-foreground">
                Browse all PGs
              </Link>
            </li>
            <li>
              <Link to="/compare" className="hover:text-foreground">
                Compare PGs
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                FAQ for outstation students
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">For PG owners</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/auth" search={{ mode: "signup", role: "owner" }} className="hover:text-foreground">
                List your PG free
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                Owner dashboard
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Grievance support
              </Link>
            </li>
            <li>Sitapura, Jaipur 302022</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PG Near JECRC · Built for students coming to Jaipur. Not
        affiliated with JECRC University.
      </div>
    </footer>
  );
}
