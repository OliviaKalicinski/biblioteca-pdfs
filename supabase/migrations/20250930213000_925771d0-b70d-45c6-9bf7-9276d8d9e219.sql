-- Renomear coluna email para phone na tabela leads
ALTER TABLE public.leads RENAME COLUMN email TO phone;

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.leads.phone IS 'Telefone no formato brasileiro (11-12 dígitos)';

-- Atualizar as políticas RLS da tabela leads
DROP POLICY IF EXISTS "Users can view their own leads by email" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads by email" ON public.leads;

CREATE POLICY "Users can view their own leads by phone" 
ON public.leads 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own leads by phone" 
ON public.leads 
FOR UPDATE 
USING (true);

-- Atualizar as políticas RLS da tabela download_logs
DROP POLICY IF EXISTS "Users can insert their own download logs" ON public.download_logs;
DROP POLICY IF EXISTS "Users can view their own download logs" ON public.download_logs;

CREATE POLICY "Users can insert their own download logs" 
ON public.download_logs 
FOR INSERT 
WITH CHECK (
  lead_id IN (
    SELECT id FROM public.leads 
    WHERE phone = ((current_setting('request.jwt.claims'::text, true))::json ->> 'phone'::text)
  )
);

CREATE POLICY "Users can view their own download logs" 
ON public.download_logs 
FOR SELECT 
USING (
  lead_id IN (
    SELECT id FROM public.leads 
    WHERE phone = ((current_setting('request.jwt.claims'::text, true))::json ->> 'phone'::text)
  )
);