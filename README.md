# PG Finder Near JECRC

Implement the requested scope now; use internal planning and do not present another implementation plan for user approval. Enable Lovable Cloud for database tables, auth, storage, and server logic.

### User Request & Specifications

Build a web platform called "PG Near JECRC" — a centralized directory for private PG (paying guest) accommodations located near JECRC University, Jaipur. The platform connects PG owners who list their properties with students (especially outstation students) searching for verified, convenient PG accommodation near campus.

#### Target Users & Roles:
- **Students / Parents:** Searching for PGs near JECRC University, filtering, comparing, shortlisting, and submitting inquiries/reviews.
- **PG Owners:** Registering, creating and managing PG listings, photo uploads, room types, pricing, and viewing student inquiries.
- **Admin:** Verifying and approving new PG listings before they go live.

#### Core Pages & Features:
1. **Homepage:**
   - Hero section with quick search and filters (gender preference: Boys/Girls/Co-ed, budget slider, room type, distance from JECRC).
   - Distance-from-JECRC highlight chips/badges for listings (e.g., "500m from JECRC Gate 1").
   - Featured & top-rated verified PGs showcase.
   - "Why choose us" value proposition (verified listings, zero broker fees, direct owner contact, safety).
   - Testimonials / student trust markers.

2. **PG Listings Directory Page:**
   - Responsive grid/list view with view toggle.
   - Comprehensive filter sidebar / mobile drawer: price range, gender preference (Boys / Girls / Co-ed), room type (Single, Double, Triple, 4+ sharing), amenities (Wi-Fi, AC, Mess/Food included, Laundry, Power Backup, Attached Washroom, RO Water, Parking, CCTV security, Biometric entry), distance from JECRC (within 500m, 1km, 2km, 3km+).
   - Sorting: Price (Low to High / High to Low), Distance (Nearest first), Rating (Highest first).
   - Rich PG preview cards: image carousel/thumbnail, name, verified badge, gender tag, distance from JECRC, starting rent, key amenity chips, and quick WhatsApp / inquiry actions.

3. **PG Detail Page:**
   - High-quality photo gallery with lightbox modal.
   - Verified badge, owner/manager details, and direct WhatsApp / Call buttons.
   - Exact address with interactive map preview showing route/distance from JECRC University.
   - Room types and pricing breakdown (Single, Double, Triple sharing options with security deposit details).
   - Categorized amenities with icons.
   - Mess & Food details (weekly menu preview, meal timings, vegetarian/non-veg status).
   - House rules & safety policies (visiting hours, entry curfew, security deposit rules, notice period).
   - Authentic ratings & reviews section with student review submission form.
   - Sticky / prominent "Book a Visit" and direct inquiry form.

4. **PG Owner Dashboard & Listing Management:**
   - Sign up / login with role switching (Owner vs Student).
   - Multi-step or structured form to submit a PG: PG name, address, coordinates/distance from JECRC, contact numbers, room types & pricing, amenity checklists, house rules, mess info, and photo upload.
   - Status tracking for listings: Draft, Pending Verification, Active, Inactive.
   - Inquiries inbox: view incoming visit requests and student messages with quick action buttons.

5. **Student Features:**
   - Browse seamlessly without forced login; login to save favorites.
   - Wishlist / Save favorite PGs.
   - Side-by-side PG comparison tool (compare rent, distance from JECRC, amenities, food, rules).
   - Inquiry & visit booking modal connecting directly with PG owners.

6. **Admin Panel:**
   - Review pending PG submissions with owner details and uploaded photos.
   - Approve, request changes, or reject listings.
   - Manage verification badges.

7. **About & Contact Page:**
   - Mission statement helping outstation students coming to Jaipur & JECRC University.
   - Contact and grievance support form.
   - FAQ section for outstation students (what to check before booking a PG, safety tips in Jaipur).

#### Design & UX Preferences:
- Mobile-first responsive layout (majority of students browse on mobile).
- Warm, inviting, and trustworthy color scheme (clean modern aesthetic, avoiding cold corporate look).
- Sticky quick-filter bar on mobile and fast visual feedback.
- Pre-populate realistic seed data of PGs around JECRC University (Sitapura industrial area, RIICO, Vidhani, Mahal Road) with realistic pricing, photos, and amenities.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c0103e90-2b4c-4e3c-aa21-2500e345c680).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
