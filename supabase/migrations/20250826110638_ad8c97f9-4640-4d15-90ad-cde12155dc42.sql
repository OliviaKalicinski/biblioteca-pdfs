-- Create leads table for user tracking
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_access TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  access_count INTEGER NOT NULL DEFAULT 1
);

-- Create pdf_files table for PDF metadata
CREATE TABLE public.pdf_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_size TEXT NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create download_logs table for tracking downloads
CREATE TABLE public.download_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  pdf_id UUID NOT NULL REFERENCES public.pdf_files(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads table
CREATE POLICY "Users can view their own record" 
ON public.leads 
FOR SELECT 
USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own record" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own record" 
ON public.leads 
FOR UPDATE 
USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- RLS Policies for pdf_files table (public read access)
CREATE POLICY "Anyone can view PDF files" 
ON public.pdf_files 
FOR SELECT 
USING (true);

-- RLS Policies for download_logs table
CREATE POLICY "Users can view their own download logs" 
ON public.download_logs 
FOR SELECT 
USING (lead_id IN (
  SELECT id FROM public.leads 
  WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
));

CREATE POLICY "Users can insert their own download logs" 
ON public.download_logs 
FOR INSERT 
WITH CHECK (lead_id IN (
  SELECT id FROM public.leads 
  WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on pdf_files
CREATE TRIGGER update_pdf_files_updated_at
BEFORE UPDATE ON public.pdf_files
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample PDF data
INSERT INTO public.pdf_files (title, description, category, file_size) VALUES
('Manual do React', 'Guia completo para desenvolvimento com React', 'Tecnologia', '2.5 MB'),
('Estratégias de Marketing Digital', 'Como criar campanhas eficazes online', 'Marketing', '1.8 MB'),
('Gestão Financeira Pessoal', 'Controle suas finanças de forma inteligente', 'Finanças', '3.1 MB'),
('Design Thinking na Prática', 'Metodologia para inovação e criatividade', 'Design', '2.2 MB'),
('Python para Iniciantes', 'Aprenda programação do zero', 'Tecnologia', '4.0 MB'),
('Liderança e Gestão de Equipes', 'Desenvolva suas habilidades de liderança', 'Gestão', '2.8 MB');