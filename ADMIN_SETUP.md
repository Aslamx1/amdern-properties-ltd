# Admin Control Suite Setup

## Initial Admin User Creation

The Admin Control Suite uses Supabase Auth for authentication. You need to create the initial admin user.

### Step 1: Create Admin User in Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/wfctuujqszubwjpnldrs/auth/users
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - **Email**: `amdern@smc.com`
   - **Password**: `amdern@`
   - **Auto-confirm email**: ON
4. Click **"Create user"**
5. Copy the **User UUID** from the created user

### Step 2: Insert Admin Record

Run this SQL in the Supabase SQL Editor (https://supabase.com/dashboard/project/wfctuujqszubwjpnldrs/sql/new):

```sql
INSERT INTO public.admins (user_id, email, role, permissions)
VALUES (
  'PASTE_USER_UUID_HERE',
  'amdern@smc.com',
  'super_admin',
  ARRAY['*']
);
```

Replace `PASTE_USER_UUID_HERE` with the UUID from Step 1.

### Step 3: Run Migrations

If you haven't already, run the migration:

```bash
supabase migration up
```

Or apply it manually via the Supabase SQL Editor using the file:
`supabase/migrations/20260820210000_admin_system.sql`

### Step 4: Access Admin Panel

1. Start the dev server: `npm run dev`
2. Navigate to: http://localhost:5173/admin
3. Sign in with `amdern@smc.com` / `amdern@`

## Admin Roles

| Role | Permissions |
|------|-------------|
| super_admin | Full system access |
| content_moderator | listings.read, listings.update, listings.delete, photos.upload, agents.verify |
| lead_manager | enquiries.read, enquiries.update, requests.read, requests.update |
| finance_controller | billing.read, billing.update, subscriptions.read, subscriptions.update |
| support_specialist | enquiries.read, enquiries.update, users.read |
