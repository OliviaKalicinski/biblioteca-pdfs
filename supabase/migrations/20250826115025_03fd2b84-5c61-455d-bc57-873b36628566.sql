-- Update storage policies to allow public access to PDF Library bucket
-- This is appropriate since it's a lead generation tool where PDFs should be accessible

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "PDF Library files are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "PDF Library files can be listed publicly" ON storage.objects;

-- Create new policies for public access to PDF Library bucket
CREATE POLICY "PDF Library files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'PDF Library');

CREATE POLICY "PDF Library files can be listed publicly" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'PDF Library');

-- Also ensure we can download the files
CREATE POLICY "Anyone can download PDF Library files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'PDF Library');