-- Remove foreign key constraint and update download_logs to use file names
ALTER TABLE download_logs DROP CONSTRAINT IF EXISTS download_logs_pdf_id_fkey;

-- Add file_name column to download_logs
ALTER TABLE download_logs ADD COLUMN file_name TEXT;

-- Drop the pdf_id column from download_logs
ALTER TABLE download_logs DROP COLUMN pdf_id;

-- Make file_name required
ALTER TABLE download_logs ALTER COLUMN file_name SET NOT NULL;

-- Drop the pdf_files table since we're using storage buckets
DROP TABLE IF EXISTS pdf_files;

-- Create storage policy to allow authenticated users to list files
CREATE POLICY "Authenticated users can list PDF files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'PDF Library' 
  AND auth.role() = 'authenticated'
);

-- Create storage policy to allow authenticated users to download files
CREATE POLICY "Authenticated users can download PDF files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'PDF Library' 
  AND auth.role() = 'authenticated'
);