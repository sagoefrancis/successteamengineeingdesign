# S.T.E.D — Supabase setup

Your site used to store proposals/CAD samples in the browser's localStorage,
which is invisible to other visitors. This setup moves that data to a real
hosted Postgres database + file storage (Supabase's free tier), and adds a
login gate on `admin.html`.

## 1. Create a Supabase project

1. Go to https://supabase.com → sign up → "New project".
2. Pick a name/region and a database password (save it somewhere safe).
3. Once created, go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon / public key**
4. Paste both into `config.js`:
   ```js
   const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'ey...';
   ```

## 2. Create the database tables

Go to **SQL Editor** in the Supabase dashboard, paste this, and run it:

```sql
create table proposals (
  id bigint generated always as identity primary key,
  title text not null,
  topic text not null,
  abstract text not null,
  image_path text,
  document_path text,
  document_name text,
  year int not null default extract(year from now()),
  created_at timestamptz not null default now()
);

create table cad_samples (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  image_path text,
  created_at timestamptz not null default now()
);

alter table proposals enable row level security;
alter table cad_samples enable row level security;

-- Anyone can read (needed for index.html / proposals.html)
create policy "Public read proposals" on proposals for select using (true);
create policy "Public read cad samples" on cad_samples for select using (true);

-- Only a signed-in admin can add/edit/delete
create policy "Admin write proposals" on proposals
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Admin write cad samples" on cad_samples
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

## 3. Create storage buckets

Go to **Storage** in the dashboard and create three buckets:

| Bucket name           | Public? |
|------------------------|---------|
| `proposal-images`      | Yes     |
| `cad-images`           | Yes     |
| `proposal-documents`   | No      |

Then in the **SQL Editor**, run this to control who can upload/delete:

```sql
create policy "Public read proposal images" on storage.objects
  for select using (bucket_id = 'proposal-images');
create policy "Public read cad images" on storage.objects
  for select using (bucket_id = 'cad-images');

create policy "Admin manage proposal images" on storage.objects
  for all using (bucket_id = 'proposal-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'proposal-images' and auth.role() = 'authenticated');
create policy "Admin manage cad images" on storage.objects
  for all using (bucket_id = 'cad-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'cad-images' and auth.role() = 'authenticated');
create policy "Admin manage proposal documents" on storage.objects
  for all using (bucket_id = 'proposal-documents' and auth.role() = 'authenticated')
  with check (bucket_id = 'proposal-documents' and auth.role() = 'authenticated');
```

(`proposal-documents` has no public-read policy, so the source files stay
private — matching the current behavior where visitors only request a file
over WhatsApp rather than downloading it directly.)

## 4. Create your admin login

Go to **Authentication → Users → Add user** and create yourself an account
with an email + password. This is the account you'll use to sign in at
`login.html`. (Turn off "Enable email confirmations" under Authentication →
Providers → Email if you don't want to verify the address first.)

## 5. Test locally

Open `login.html` in a browser, sign in, and you should land on `admin.html`
with your dashboard. Publish a test proposal, then open `proposals.html` —
it should now show up (this works even from a different browser/device,
since the data is no longer stuck in one browser's storage).

## 6. Deploy

Any static host works since there's no server-side code — Netlify, Vercel,
or GitHub Pages are all free and give you HTTPS automatically:

- **Netlify**: drag the whole project folder into app.netlify.com/drop, or
  connect your GitHub repo for auto-deploys on push.
- **Vercel**: `vercel` CLI or import the repo at vercel.com/new.
- **GitHub Pages**: push to a repo, enable Pages in repo settings, pick the
  branch/folder.

Add a custom domain from your host's dashboard once you're happy with it —
all three above issue free SSL certificates automatically.

## Notes

- `config.js` contains the Supabase **anon** key only — this is meant to be
  public and is safe as long as the Row Level Security policies above are in
  place (they are what actually stop random people from writing data, not
  the secrecy of this key).
- Never put your Supabase **service_role** key in any file that ships to the
  browser — it bypasses all security rules.
