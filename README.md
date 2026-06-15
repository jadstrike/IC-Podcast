# IC Podcast Recorder

Two hosts. One room. One file.

## What it does

IC Podcast Recorder lets two people record a podcast together from their browsers — no external software, no file merging afterwards.

1. Both hosts create an account and sign in
2. You land in the **Lobby** — share the room code with your co-host and wait for them to appear
3. Once you're both there, click **Both joined** to enter the **Room**
4. When you're ready, hit the **red record button** — a 3-second countdown fires for both of you simultaneously
5. Talk. The timer runs.
6. Hit **Stop** — your browser encodes the audio to MP3 and uploads it
7. Head to **Sessions** to download your recording

That's it.

## How it's built

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router) |
| Auth | Supabase Auth (email + password) |
| Real-time sync | Supabase Realtime Presence |
| File storage | Supabase Storage |
| Audio encoding | `lamejs` (in-browser WebM → MP3) |
| Hosting | Vercel |

## Running locally

**1. Clone and install**
```bash
git clone https://github.com/jadstrike/IC-Podcast.git
cd IC-Podcast
npm install
```

**2. Set up Supabase**

Create a project at [supabase.com](https://supabase.com), then copy your URL and anon key into a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You'll also need to run the following SQL in your Supabase project (via the SQL editor):

```sql
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own" on public.profiles for select using (auth.uid() = id);
create policy "own_update" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles(id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Recordings table
create table public.recordings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  room_code text not null,
  status text not null default 'pending',
  storage_path text,
  duration_seconds integer,
  uploaded_by uuid references auth.users(id)
);
alter table public.recordings enable row level security;
create policy "read" on public.recordings for select using (auth.role() = 'authenticated');
create policy "insert" on public.recordings for insert with check (auth.role() = 'authenticated');
create policy "update" on public.recordings for update using (auth.role() = 'authenticated');

-- Storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recordings', 'recordings', false, 524288000,
  array['audio/mpeg','audio/webm','audio/ogg','audio/wav','audio/mp4']);
create policy "upload" on storage.objects for insert with check (
  bucket_id = 'recordings' and auth.role() = 'authenticated');
create policy "download" on storage.objects for select using (
  bucket_id = 'recordings' and auth.role() = 'authenticated');
```

Disable email confirmation: **Supabase dashboard → Authentication → Providers → Email → turn off "Confirm email"**

**3. Start the dev server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

- Max 2 accounts — a database trigger blocks a third registration
- Each browser records and uploads its own track independently
- The app works without Supabase configured (solo mode — no sync, local save only)
