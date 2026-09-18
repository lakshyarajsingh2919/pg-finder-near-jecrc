create type public.gender_pref as enum ('boys','girls','coed');
create type public.pg_status as enum ('draft','pending','active','inactive','rejected');
create type public.app_role as enum ('admin','owner','student');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'student',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create table public.pgs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  area text not null,
  address text not null,
  landmark text,
  distance_m integer not null default 1000,
  gate text default 'Gate 1',
  latitude double precision,
  longitude double precision,
  gender gender_pref not null default 'coed',
  min_rent integer not null default 6000,
  security_deposit integer not null default 5000,
  notice_period text default '1 month',
  owner_name text,
  contact_phone text,
  whatsapp text,
  amenities text[] not null default '{}',
  photos text[] not null default '{}',
  food_included boolean not null default true,
  food_type text default 'Veg only',
  meal_timings text,
  weekly_menu text,
  house_rules text[] not null default '{}',
  visiting_hours text,
  entry_curfew text,
  status pg_status not null default 'draft',
  verified boolean not null default false,
  featured boolean not null default false,
  rating numeric(2,1) not null default 0,
  review_count integer not null default 0,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.pgs to anon;
grant select, insert, update, delete on public.pgs to authenticated;
grant all on public.pgs to service_role;
alter table public.pgs enable row level security;
create policy "active pgs public" on public.pgs for select using (status = 'active');
create policy "owners read own pgs" on public.pgs for select to authenticated using (auth.uid() = owner_id);
create policy "admins read all pgs" on public.pgs for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "owners insert own pgs" on public.pgs for insert to authenticated with check (auth.uid() = owner_id);
create policy "owners update own pgs" on public.pgs for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "admins update pgs" on public.pgs for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "owners delete own pgs" on public.pgs for delete to authenticated using (auth.uid() = owner_id);
create trigger pgs_updated_at before update on public.pgs for each row execute function public.update_updated_at_column();

create table public.room_types (
  id uuid primary key default gen_random_uuid(),
  pg_id uuid not null references public.pgs(id) on delete cascade,
  sharing text not null,
  rent integer not null,
  deposit integer not null default 0,
  ac boolean not null default false,
  attached_bath boolean not null default false,
  available integer not null default 1,
  created_at timestamptz not null default now()
);
grant select on public.room_types to anon;
grant select, insert, update, delete on public.room_types to authenticated;
grant all on public.room_types to service_role;
alter table public.room_types enable row level security;
create policy "rooms of active pgs public" on public.room_types for select
  using (exists (select 1 from public.pgs p where p.id = pg_id and p.status = 'active'));
create policy "owners read own rooms" on public.room_types for select to authenticated
  using (exists (select 1 from public.pgs p where p.id = pg_id and (p.owner_id = auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "owners manage own rooms" on public.room_types for all to authenticated
  using (exists (select 1 from public.pgs p where p.id = pg_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pgs p where p.id = pg_id and p.owner_id = auth.uid()));

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  pg_id uuid not null references public.pgs(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews public read" on public.reviews for select using (true);
create policy "auth users add reviews" on public.reviews for insert to authenticated with check (auth.uid() = user_id);
create policy "own reviews update" on public.reviews for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own reviews delete" on public.reviews for delete to authenticated using (auth.uid() = user_id);

create or replace function public.refresh_pg_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  target := coalesce(new.pg_id, old.pg_id);
  update public.pgs p set
    rating = coalesce((select round(avg(r.rating)::numeric,1) from public.reviews r where r.pg_id = target),0),
    review_count = (select count(*) from public.reviews r where r.pg_id = target)
  where p.id = target;
  return null;
end; $$;
create trigger reviews_refresh_rating after insert or update or delete on public.reviews
for each row execute function public.refresh_pg_rating();

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  pg_id uuid not null references public.pgs(id) on delete cascade,
  student_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text not null,
  email text,
  message text,
  visit_date date,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant insert on public.inquiries to anon;
grant select, insert, update on public.inquiries to authenticated;
grant all on public.inquiries to service_role;
alter table public.inquiries enable row level security;
create policy "anyone can inquire" on public.inquiries for insert with check (true);
create policy "owners read own inquiries" on public.inquiries for select to authenticated
  using (exists (select 1 from public.pgs p where p.id = pg_id and p.owner_id = auth.uid()) or public.has_role(auth.uid(),'admin') or student_id = auth.uid());
create policy "owners update own inquiries" on public.inquiries for update to authenticated
  using (exists (select 1 from public.pgs p where p.id = pg_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pgs p where p.id = pg_id and p.owner_id = auth.uid()));

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pg_id uuid not null references public.pgs(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, pg_id)
);
grant select, insert, delete on public.favorites to authenticated;
grant all on public.favorites to service_role;
alter table public.favorites enable row level security;
create policy "own favorites" on public.favorites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), coalesce(new.raw_user_meta_data->>'role','student'))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, (case when coalesce(new.raw_user_meta_data->>'role','student') = 'owner' then 'owner' else 'student' end)::app_role)
  on conflict do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.pgs (slug,name,tagline,description,area,address,landmark,distance_m,gate,latitude,longitude,gender,min_rent,security_deposit,owner_name,contact_phone,whatsapp,amenities,photos,food_included,food_type,meal_timings,weekly_menu,house_rules,visiting_hours,entry_curfew,status,verified,featured) values
('shree-balaji-boys-pg','Shree Balaji Boys PG','500m from JECRC Gate 1','Purpose-built boys PG with airy rooms, home-style mess and 24x7 power backup. Walking distance to JECRC Gate 1.','Sitapura','Plot 21, Vidhani Road, Sitapura, Jaipur 302022','Opposite Vidhani Mandir',500,'Gate 1',26.7791,75.8215,'boys',6500,6000,'Rajesh Sharma','+91 98290 11223','+91 98290 11223','{"Wi-Fi","AC","Mess/Food included","Laundry","Power Backup","Attached Washroom","RO Water","Parking","CCTV security"}','{"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"}',true,'Veg only','Breakfast 8-9:30 AM, Lunch 1-2:30 PM, Dinner 8-9:30 PM','Mon: Poha & Chole Chawal | Tue: Paratha & Rajma | Wed: Idli & Kadhi Chawal | Thu: Upma & Paneer | Fri: Poori & Dal Fry | Sat: Sandwich & Chowmein | Sun: Special Thali','{"No smoking or alcohol","Guests allowed only in common area","Rent due by 5th of every month","One month notice before leaving"}','9 AM - 8 PM','11:00 PM','active',true,true),
('maa-saraswati-girls-pg','Maa Saraswati Girls PG','Biometric entry, 700m from campus','Girls-only PG with biometric entry, resident warden and CCTV on every floor. Parents'' favourite for safety.','RIICO Sitapura','B-14, RIICO Industrial Area, Sitapura, Jaipur 302022','Near Sitapura Bus Stand',700,'Gate 2',26.7762,75.8281,'girls',7500,7000,'Sunita Agarwal','+91 94140 33445','+91 94140 33445','{"Wi-Fi","AC","Mess/Food included","Laundry","Power Backup","Attached Washroom","RO Water","CCTV security","Biometric entry"}','{"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200","https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200","https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200"}',true,'Veg only','Breakfast 8-9 AM, Lunch 1-2 PM, Dinner 8-9 PM','Mon: Aloo Paratha & Mix Veg | Tue: Poha & Rajma | Wed: Dosa & Paneer | Thu: Upma & Kadhi | Fri: Sandwich & Chole | Sat: Bread Butter & Pulao | Sun: Puri Sabzi & Thali','{"Entry closed after 10 PM","No male visitors above ground floor","Biometric ID mandatory","Warden permission for night-outs"}','10 AM - 7 PM','10:00 PM','active',true,true),
('gurukul-co-living','Gurukul Co-Living','Co-ed studios, 1.2km from JECRC','Modern co-living with private studios, shared lounges and a rooftop study deck. Ideal for final-year students.','Mahal Road','Mahal Road, Near Pratap Nagar Sector 28, Jaipur 302033','Behind D-Mart',1200,'Gate 1',26.7845,75.8402,'coed',9000,9000,'Amit Jain','+91 99280 55667','+91 99280 55667','{"Wi-Fi","AC","Mess/Food included","Laundry","Power Backup","Attached Washroom","RO Water","Parking","CCTV security","Biometric entry"}','{"https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200","https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200","https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200"}',true,'Veg & Non-veg','Breakfast 8-10 AM, Lunch 1-3 PM, Dinner 8-10 PM','Mon: Sandwich & Dal Makhani | Tue: Poha & Chicken Curry (Wed non-veg) | Wed: Dosa & Paneer | Thu: Paratha & Egg Curry | Fri: Idli & Rajma | Sat: Pasta & Biryani | Sun: Brunch Thali','{"Quiet hours after 11 PM","No cooking in rooms","Deposit refundable after 15 days","15-day notice period"}','24x7 (common lounge)','None (secure access)','active',true,true),
('krishna-kunj-boys-pg','Krishna Kunj Boys PG','Budget stay 900m from Gate 2','No-frills, clean and affordable boys PG with home-cooked meals. Best value near campus.','Vidhani','45, Vidhani Village Road, Sitapura, Jaipur 302022','Near Vidhani Market',900,'Gate 2',26.7735,75.8189,'boys',4800,4000,'Mahesh Gupta','+91 90010 77889','+91 90010 77889','{"Wi-Fi","Mess/Food included","Power Backup","RO Water","Parking","CCTV security"}','{"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200","https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200"}',true,'Veg only','Breakfast 8-9 AM, Lunch 1-2 PM, Dinner 8-9 PM','Simple North-Indian rotation: dal, seasonal sabzi, roti, rice, salad daily','{"No smoking","Rent by 7th of month","Visitors till 7 PM"}','9 AM - 7 PM','10:30 PM','active',true,false),
('shivam-residency-girls','Shivam Residency Girls PG','AC rooms, 1.5km from JECRC','Spacious girls PG with AC double rooms, laundry service and a dedicated study hall.','Sitapura','Plot 88, Sitapura Extension, Jaipur 302022','Near Apex Hospital',1500,'Gate 1',26.7688,75.8333,'girls',6800,6000,'Kavita Meena','+91 93510 22114','+91 93510 22114','{"Wi-Fi","AC","Mess/Food included","Laundry","Attached Washroom","RO Water","CCTV security","Power Backup"}','{"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"}',true,'Veg only','Breakfast 8-9:30 AM, Lunch 1-2:30 PM, Dinner 8-9:30 PM','Weekly rotation with paneer twice a week and Sunday special thali','{"No male visitors inside","Entry by 10 PM","One month notice"}','10 AM - 8 PM','10:00 PM','active',true,false),
('jecrc-scholars-nest','Scholars Nest PG','300m from Gate 1 — closest stay','The closest PG to JECRC Gate 1. Walk to class in 4 minutes. Triple and four-sharing rooms.','Sitapura','Near JECRC Gate 1, Ramchandrapura, Sitapura, Jaipur 302022','Adjacent to JECRC main gate',300,'Gate 1',26.7808,75.8227,'coed',5500,5000,'Deepak Yadav','+91 98870 44556','+91 98870 44556','{"Wi-Fi","Mess/Food included","Laundry","Power Backup","RO Water","Parking","CCTV security"}','{"https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"}',true,'Veg & Non-veg','Breakfast 7:30-9 AM, Lunch 12:30-2:30 PM, Dinner 7:30-9:30 PM','Non-veg on Wednesday and Sunday dinner; rest veg thali','{"No loud music","ID proof mandatory","Rent by 5th"}','9 AM - 9 PM','11:00 PM','active',true,true),
('anand-vihar-boys','Anand Vihar Boys PG','2km from JECRC, bike parking','Roomy boys PG on Tonk Road side with covered bike parking and gym access nearby.','RIICO Sitapura','C-7, RIICO Sitapura, Tonk Road, Jaipur 302022','Near Sitapura Circle',2000,'Gate 2',26.7702,75.8412,'boys',5200,5000,'Vikram Singh','+91 97990 66778','+91 97990 66778','{"Wi-Fi","Mess/Food included","Power Backup","Parking","CCTV security","RO Water","Laundry"}','{"https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200","https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200"}',true,'Veg only','Breakfast 8-9 AM, Lunch 1-2 PM, Dinner 8-9:30 PM','Rotating veg menu with paneer on weekends','{"No smoking in rooms","Parking at own risk","15-day notice"}','9 AM - 8 PM','11:00 PM','active',true,false),
('lotus-girls-hostel','Lotus Girls PG','Single rooms, 1km from campus','Premium single-occupancy girls PG with attached washrooms and in-house laundry.','Vidhani','12, Vidhani Road, Sitapura, Jaipur 302022','Near Vidhani Police Chowki',1000,'Gate 1',26.7773,75.8205,'girls',9500,9000,'Neha Sharma','+91 95490 88990','+91 95490 88990','{"Wi-Fi","AC","Mess/Food included","Laundry","Attached Washroom","RO Water","CCTV security","Biometric entry","Power Backup"}','{"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200"}',true,'Veg only','Breakfast 8-9:30 AM, Lunch 1-2:30 PM, Dinner 8-9:30 PM','Balanced veg menu with salad and curd daily','{"Biometric entry only","No outside guests","Entry by 10 PM","One month notice"}','10 AM - 7 PM','10:00 PM','active',true,false),
('sai-krupa-pg','Sai Krupa PG','Co-ed, 2.5km from JECRC','Affordable co-ed PG near Pratap Nagar with shuttle auto to JECRC every morning.','Mahal Road','Sector 12, Pratap Nagar, Mahal Road, Jaipur 302033','Near Pratap Nagar Metro',2500,'Gate 1',26.7891,75.8461,'coed',4500,4000,'Suresh Choudhary','+91 96800 12345','+91 96800 12345','{"Wi-Fi","Mess/Food included","Power Backup","RO Water","Parking"}','{"https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200","https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200"}',true,'Veg & Non-veg','Breakfast 8-9 AM, Lunch 1-2 PM, Dinner 8-9 PM','Veg daily, non-veg on Sunday','{"No alcohol","Visitors till 8 PM","Rent by 10th"}','9 AM - 8 PM','11:00 PM','active',true,false),
('royal-stay-boys','Royal Stay Boys PG','AC single rooms, 800m away','Upgraded boys PG with AC single rooms, study tables and high-speed fibre internet.','Sitapura','Plot 5, Ramchandrapura, Sitapura, Jaipur 302022','Behind JECRC Gate 2',800,'Gate 2',26.7781,75.8259,'boys',8500,8000,'Arun Verma','+91 99820 34567','+91 99820 34567','{"Wi-Fi","AC","Mess/Food included","Laundry","Power Backup","Attached Washroom","RO Water","Parking","CCTV security"}','{"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200","https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200"}',true,'Veg & Non-veg','Breakfast 8-10 AM, Lunch 1-2:30 PM, Dinner 8-10 PM','Non-veg twice a week, paneer thrice','{"No smoking","Quiet hours after 11 PM","One month notice"}','9 AM - 9 PM','None','active',true,false),
('annapurna-girls-pg','Annapurna Girls PG','Best mess food, 1.8km away','Known for its home-style mess run by the resident family. Warm, safe and friendly.','RIICO Sitapura','A-22, RIICO Sitapura, Jaipur 302022','Near Sanskar School',1800,'Gate 2',26.7721,75.8352,'girls',6200,5000,'Pushpa Devi','+91 94610 45678','+91 94610 45678','{"Wi-Fi","Mess/Food included","Laundry","Power Backup","RO Water","CCTV security"}','{"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200","https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200"}',true,'Veg only','Breakfast 8-9 AM, Lunch 1-2 PM, Dinner 8-9 PM','Rajasthani home-style menu, dal-baati on Sundays','{"Entry by 10 PM","No male visitors","Notice of 1 month"}','10 AM - 7 PM','10:00 PM','active',true,false),
('unity-house-coed','Unity House Co-ed PG','3km from JECRC, lowest rent','Large co-ed PG for budget-conscious students, four-sharing rooms with lockers.','Mahal Road','Mahal Road, Sector 3, Jaipur 302033','Near Mahal Road Bazaar',3000,'Gate 1',26.7934,75.8512,'coed',3800,3000,'Ramesh Saini','+91 90240 56789','+91 90240 56789','{"Wi-Fi","Mess/Food included","Power Backup","RO Water","Parking"}','{"https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"}',true,'Veg only','Breakfast 8-9 AM, Lunch 1-2 PM, Dinner 8-9 PM','Simple veg menu, unlimited roti','{"No smoking or alcohol","Visitors till 7 PM","Rent by 5th"}','9 AM - 7 PM','10:30 PM','active',true,false);

insert into public.room_types (pg_id, sharing, rent, deposit, ac, attached_bath, available)
select p.id, s.sharing, (p.min_rent * s.mult)::int, p.security_deposit, s.ac, s.bath, s.avail
from public.pgs p
cross join (values
  ('Single', 1.9, true, true, 2),
  ('Double', 1.35, true, true, 4),
  ('Triple', 1.0, false, true, 6),
  ('4+ Sharing', 0.82, false, false, 8)
) as s(sharing, mult, ac, bath, avail);

insert into public.reviews (pg_id, author_name, rating, comment) 
select p.id, r.author, r.rating, r.comment from public.pgs p
cross join (values
  ('Ankit R. (B.Tech CSE)', 5, 'Stayed here for two years. Mess food is genuinely home-like and the owner responds fast to any issue.'),
  ('Priya S. (B.Tech ECE)', 4, 'Clean rooms and safe locality. Wi-Fi slows down in the evening but otherwise great for the price.'),
  ('Rahul M. (MBA)', 4, 'Very close to campus so I save a lot on auto fare. Power backup actually works during cuts.')
) as r(author, rating, comment);