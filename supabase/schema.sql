-- ============================================================
-- LaithST Photography — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- COMPETITIONS
-- ============================================================
create table competitions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  location text not null,
  country text not null,
  region text not null check (region in ('uae', 'europe', 'qatar', 'other')),
  event_date date not null,
  status text not null default 'soon' check (status in ('open', 'soon', 'closed', 'past')),
  event_type text not null default 'Show Jumping',
  booking_deadline timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- COMPETITION BOOKINGS
-- ============================================================
create table competition_bookings (
  id uuid primary key default uuid_generate_v4(),
  competition_id uuid references competitions(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  horse_name text not null,
  class_round text,
  package text not null check (package in ('photos', 'reel', 'bundle')),
  package_price numeric(10,2),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- PRIVATE SHOOT ENQUIRIES
-- ============================================================
create table shoot_enquiries (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  email text not null,
  shoot_type text not null,
  preferred_date text,
  location text,
  vision text,
  status text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'completed', 'declined')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- BRAND ENQUIRIES
-- ============================================================
create table brand_enquiries (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  email text not null,
  brand_name text not null,
  instagram_handle text,
  service_interest text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'onboarded', 'declined')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- GENERAL CONTACT
-- ============================================================
create table contact_messages (
  id uuid primary key default uuid_generate_v4(),
  first_name text not null,
  last_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  source text,
  status text not null default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- PORTFOLIO
-- ============================================================
create table portfolio_items (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text not null check (category in ('competition', 'private', 'reel')),
  image_url text,
  video_url text,
  thumbnail_url text,
  storage_path text,
  is_featured boolean default false,
  sort_order integer default 0,
  alt_text text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================
-- ADMIN USERS (Supabase Auth handles this — just a profile table)
-- ============================================================
create table admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Competitions: public read, admin write
alter table competitions enable row level security;
create policy "Public can read competitions" on competitions for select using (true);
create policy "Admins can manage competitions" on competitions for all using (auth.role() = 'authenticated');

-- Bookings: public insert, admin read/update
alter table competition_bookings enable row level security;
create policy "Anyone can submit bookings" on competition_bookings for insert with check (true);
create policy "Admins can manage bookings" on competition_bookings for all using (auth.role() = 'authenticated');

-- Shoot enquiries
alter table shoot_enquiries enable row level security;
create policy "Anyone can submit shoot enquiries" on shoot_enquiries for insert with check (true);
create policy "Admins can manage shoot enquiries" on shoot_enquiries for all using (auth.role() = 'authenticated');

-- Brand enquiries
alter table brand_enquiries enable row level security;
create policy "Anyone can submit brand enquiries" on brand_enquiries for insert with check (true);
create policy "Admins can manage brand enquiries" on brand_enquiries for all using (auth.role() = 'authenticated');

-- Contact messages
alter table contact_messages enable row level security;
create policy "Anyone can submit contact messages" on contact_messages for insert with check (true);
create policy "Admins can manage contact messages" on contact_messages for all using (auth.role() = 'authenticated');

-- Portfolio: public read, admin write
alter table portfolio_items enable row level security;
create policy "Public can read portfolio" on portfolio_items for select using (true);
create policy "Admins can manage portfolio" on portfolio_items for all using (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKETS (run separately in Supabase dashboard)
-- ============================================================
-- Create a bucket called "portfolio" with public access
-- insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger competitions_updated_at before update on competitions for each row execute procedure update_updated_at();
create trigger bookings_updated_at before update on competition_bookings for each row execute procedure update_updated_at();
create trigger shoots_updated_at before update on shoot_enquiries for each row execute procedure update_updated_at();
create trigger brands_updated_at before update on brand_enquiries for each row execute procedure update_updated_at();
create trigger contact_updated_at before update on contact_messages for each row execute procedure update_updated_at();
create trigger portfolio_updated_at before update on portfolio_items for each row execute procedure update_updated_at();

-- ============================================================
-- SEED DATA — sample competitions
-- ============================================================
insert into competitions (name, location, country, region, event_date, status, event_type) values
  ('Abu Dhabi Equestrian Club', 'Abu Dhabi', 'UAE', 'uae', '2026-04-12', 'open', 'Show Jumping'),
  ('Dubai International Show Jumping', 'Dubai', 'UAE', 'uae', '2026-04-24', 'open', 'Show Jumping'),
  ('Al Shaqab International', 'Doha', 'Qatar', 'qatar', '2026-05-08', 'soon', 'Dressage & Jumping'),
  ('Global Champions Tour', 'Madrid', 'Spain', 'europe', '2026-05-22', 'soon', 'Grand Prix'),
  ('Paris Eiffel Jumping', 'Paris', 'France', 'europe', '2026-06-06', 'soon', 'Show Jumping'),
  ('Rotterdam CSIO', 'Rotterdam', 'Netherlands', 'europe', '2026-06-19', 'soon', 'Nations Cup');
