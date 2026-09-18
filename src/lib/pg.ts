export type Gender = "boys" | "girls" | "coed";
export type PgStatus = "draft" | "pending" | "active" | "inactive" | "rejected";

export type Pg = {
  id: string;
  owner_id: string | null;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  area: string;
  address: string;
  landmark: string | null;
  distance_m: number;
  gate: string | null;
  latitude: number | null;
  longitude: number | null;
  gender: Gender;
  min_rent: number;
  security_deposit: number;
  notice_period: string | null;
  owner_name: string | null;
  contact_phone: string | null;
  whatsapp: string | null;
  amenities: string[];
  photos: string[];
  food_included: boolean;
  food_type: string | null;
  meal_timings: string | null;
  weekly_menu: string | null;
  house_rules: string[];
  visiting_hours: string | null;
  entry_curfew: string | null;
  status: PgStatus;
  verified: boolean;
  featured: boolean;
  rating: number;
  review_count: number;
  admin_note: string | null;
  created_at: string;
};

export type RoomType = {
  id: string;
  pg_id: string;
  sharing: string;
  rent: number;
  deposit: number;
  ac: boolean;
  attached_bath: boolean;
  available: number;
};

export type Review = {
  id: string;
  pg_id: string;
  author_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Inquiry = {
  id: string;
  pg_id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  visit_date: string | null;
  status: string;
  created_at: string;
};

export const AMENITIES = [
  "Wi-Fi",
  "AC",
  "Mess/Food included",
  "Laundry",
  "Power Backup",
  "Attached Washroom",
  "RO Water",
  "Parking",
  "CCTV security",
  "Biometric entry",
] as const;

export const SHARING_TYPES = ["Single", "Double", "Triple", "4+ Sharing"] as const;

export const GENDER_LABEL: Record<Gender, string> = {
  boys: "Boys",
  girls: "Girls",
  coed: "Co-ed",
};

export const STATUS_LABEL: Record<PgStatus, string> = {
  draft: "Draft",
  pending: "Pending verification",
  active: "Active",
  inactive: "Inactive",
  rejected: "Changes requested",
};

export const DISTANCE_OPTIONS = [
  { value: "500", label: "Within 500m" },
  { value: "1000", label: "Within 1 km" },
  { value: "2000", label: "Within 2 km" },
  { value: "3000", label: "Within 3 km" },
  { value: "all", label: "Any distance" },
] as const;

export const JECRC = { lat: 26.7805, lng: 75.8223 };

export function rupees(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function distanceLabel(meters: number, gate?: string | null) {
  const d = meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)} km`;
  return `${d} from JECRC ${gate ?? "Gate 1"}`;
}

export function walkMinutes(meters: number) {
  return Math.max(1, Math.round(meters / 80));
}

export function mapEmbedUrl(pg: Pick<Pg, "latitude" | "longitude" | "address">) {
  const dest =
    pg.latitude && pg.longitude ? `${pg.latitude},${pg.longitude}` : encodeURIComponent(pg.address);
  return `https://www.google.com/maps?q=${dest}&z=15&output=embed`;
}

export function directionsUrl(pg: Pick<Pg, "latitude" | "longitude" | "address">) {
  const dest =
    pg.latitude && pg.longitude ? `${pg.latitude},${pg.longitude}` : encodeURIComponent(pg.address);
  return `https://www.google.com/maps/dir/?api=1&origin=JECRC+University+Jaipur&destination=${dest}`;
}

export function waLink(phone: string | null, pgName: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  const number = digits.length === 10 ? `91${digits}` : digits;
  const text = encodeURIComponent(
    `Hi, I found ${pgName} on PG Near JECRC. Is a room available? I am a student at JECRC University.`,
  );
  return `https://wa.me/${number}?text=${text}`;
}

export function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "pg"
  );
}

export const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200";
