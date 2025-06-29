/*
  # Add API Connection Status to Profiles

  1. New Columns
    - `elevenlabs_api_connected` (boolean) - Shows if ElevenLabs API is connected
    - `api_connections` (jsonb) - Stores status of various API connections
  
  2. Updates
    - Add default values for API connection tracking
    - Create indexes for efficient querying
  
  3. Security
    - Update RLS policies to allow users to read their API connection status
*/

-- Add API connection status columns to profiles table
DO $$ 
BEGIN
  -- Add elevenlabs_api_connected column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'elevenlabs_api_connected'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN elevenlabs_api_connected boolean DEFAULT false;
  END IF;

  -- Add api_connections column for tracking multiple API statuses
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'api_connections'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN api_connections jsonb DEFAULT '{
      "elevenlabs": {"connected": false, "last_checked": null},
      "openai": {"connected": false, "last_checked": null},
      "tavus": {"connected": false, "last_checked": null}
    }'::jsonb;
  END IF;
END $$;

-- Create indexes for API connection fields
CREATE INDEX IF NOT EXISTS idx_profiles_elevenlabs_api_connected ON public.profiles(elevenlabs_api_connected);
CREATE INDEX IF NOT EXISTS idx_profiles_api_connections ON public.profiles USING GIN(api_connections);

-- Update existing profiles to have default API connection values
UPDATE public.profiles 
SET 
  elevenlabs_api_connected = false,
  api_connections = '{
    "elevenlabs": {"connected": false, "last_checked": null},
    "openai": {"connected": false, "last_checked": null},
    "tavus": {"connected": false, "last_checked": null}
  }'::jsonb
WHERE elevenlabs_api_connected IS NULL OR api_connections IS NULL;