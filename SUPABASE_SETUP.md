# Supabase Setup Instructions

## Step 1: Create Database Table

Go to your Supabase Dashboard: https://cinkklpuphkxwtkxtsfi.supabase.co

1. Navigate to **SQL Editor** → **New Query**
2. Copy and paste the following SQL:

```sql
-- Create attendance_sessions table for cross-device session sharing
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_code VARCHAR(6) NOT NULL UNIQUE,
    subject_id VARCHAR(255) NOT NULL,
    subject_name VARCHAR(255) NOT NULL,
    period INTEGER NOT NULL,
    otp VARCHAR(6),
    otp_expiry BIGINT,
    teacher_location JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on session_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_code ON attendance_sessions(session_code);

-- Create index on active status
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_active ON attendance_sessions(active);

-- Enable RLS (Row Level Security)
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
CREATE POLICY "Allow all operations" ON attendance_sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_attendance_sessions_updated_at
    BEFORE UPDATE ON attendance_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

3. Click **Run** to execute the SQL

## Step 2: Configure Environment Variables in Vercel

Add these environment variables in your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=https://cinkklpuphkxwtkxtsfi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Xp9WbLyP8cLOLlcuci-MIg_QkYZ-clo
```

To add them:
1. Go to your Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add both variables above
5. Redeploy your project

## Step 3: Test the Flow

1. Teacher starts a session on their device
2. A QR code appears - students can scan it
3. Student scans QR code with their phone camera
4. Student is taken to verify-attendance page with session auto-loaded
5. Student completes OTP/GPS/Device verification
6. Student marks attendance

## How It Works

- When teacher starts session: Data is stored in Supabase with a unique 6-digit code
- QR code contains a URL with the code: `/student/verify-attendance?code=XXXXXX`
- When student scans QR: Browser opens the URL, app fetches session from Supabase
- Cross-device sync works because Supabase is the central database

## Troubleshooting

If QR code doesn't scan:
- Make sure the QR code is clearly visible on screen
- Ensure student uses their phone camera (not a separate QR app necessarily)
- The link should open in a browser automatically

If session not found:
- Check that the session code is correct
- Sessions expire after 8 hours
- Only one active session per code
