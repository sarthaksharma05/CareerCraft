# Demo User Setup Guide

## Issue
The "Try Demo Credentials" button is failing because the demo user doesn't exist in your Supabase database.

## Solution

### Option 1: Automatic Setup (Recommended)
The app now automatically tries to create the demo user when you click "Try Demo Credentials". This should work if your Supabase configuration is correct.

### Option 2: Manual Setup in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Navigate to **Authentication** → **Users**

2. **Create Demo User**
   - Click **"Add user"**
   - Email: `demo@CareerCraft.com`
   - Password: `demo123456`
   - **Important**: Uncheck "Email confirmation required" or confirm the email manually

3. **Create Demo Profile**
   - Go to **Table Editor** → **profiles**
   - Click **"Insert row"**
   - Fill in the following data:
   ```json
   {
     "id": "[USER_ID_FROM_STEP_2]",
     "email": "demo@CareerCraft.com",
     "full_name": "Demo User",
     "avatar_url": null,
     "niche": "Technology",
     "bio": "Demo user for CareerCraft",
     "social_links": {},
     "follower_count": 1250,
     "is_pro": false
   }
   ```

### Option 3: SQL Script
Run this SQL in your Supabase SQL Editor:

```sql
-- Create demo user (if not exists)
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'demo@CareerCraft.com',
  crypt('demo123456', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Demo User"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Create demo profile (if not exists)
INSERT INTO profiles (
  id,
  email,
  full_name,
  avatar_url,
  niche,
  bio,
  social_links,
  follower_count,
  is_pro,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'demo@CareerCraft.com'),
  'demo@CareerCraft.com',
  'Demo User',
  null,
  'Technology',
  'Demo user for CareerCraft',
  '{}',
  1250,
  false,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;
```

## Testing

1. **Click "Try Demo Credentials"** in the sign-in page
2. **Check the browser console** for detailed logs
3. **Look for success message**: "Logged in as Demo User!"
4. **Verify demo mode**: You should see the demo overlay in the dashboard

## Troubleshooting

### Common Issues:

1. **"Invalid login credentials"**
   - Demo user doesn't exist in database
   - Password is incorrect
   - Email confirmation required

2. **"Email not confirmed"**
   - Demo user exists but email not confirmed
   - Go to Supabase Dashboard → Users → Find demo user → Confirm email

3. **"Supabase not configured"**
   - Check your `.env` file
   - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set

4. **"Too many requests"**
   - Wait a few minutes and try again
   - This is a rate limiting protection

### Debug Steps:

1. **Check browser console** for detailed error messages
2. **Verify Supabase connection** in the console logs
3. **Check if demo user exists** in Supabase Dashboard
4. **Try manual sign-in** with demo credentials
5. **Check email confirmation status** for demo user

## Demo User Details

- **Email**: `demo@CareerCraft.com`
- **Password**: `demo123456`
- **Name**: Demo User
- **Niche**: Technology
- **Followers**: 1,250
- **Pro Status**: False

## Security Note

The demo user is intended for demonstration purposes only. In production:
- Use a more secure password
- Consider disabling demo user after testing
- Monitor for abuse of demo credentials 