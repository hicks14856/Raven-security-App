
-- Create a storage bucket for emergency recordings if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'emergency-recordings', 'emergency-recordings', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'emergency-recordings');

-- Set up a policy to allow authenticated users to upload to this bucket
INSERT INTO storage.policies (name, definition, bucket_id)
SELECT 'Allow users to upload their recordings', 
'(auth.uid() = storage.foldername(name)::uuid)',
'emergency-recordings'
WHERE NOT EXISTS (SELECT 1 FROM storage.policies WHERE bucket_id = 'emergency-recordings' AND name = 'Allow users to upload their recordings');

-- Add a policy to allow public access to the files for playback
INSERT INTO storage.policies (name, definition, bucket_id)
SELECT 'Allow public access to recordings', 
'true',
'emergency-recordings'
WHERE NOT EXISTS (SELECT 1 FROM storage.policies WHERE bucket_id = 'emergency-recordings' AND name = 'Allow public access to recordings');
