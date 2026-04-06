import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, FileText, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PDFFile {
  id: string;
  title: string;
  description: string;
  category: string;
  file_size: string;
  file_name: string;
  file_url: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const parseDescription = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} style={{ color: "#CCFF00" }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const getCategory = (fileName: string): string => {
  const f = fileName.toLowerCase();
  if (f.includes("nutrition") || f.includes("digestibility")) return "Nutrição";
  if (f.includes("protein")) return "Proteína";
  if (f.includes("food") || f.includes("feed")) return "Alimentação";
  return "Pesquisa";
};

const CATEGORY_COLORS: Record<string, string> = {
  Nutrição: "#CCFF00",
  Proteína: "#CCFF00",
  Alimentação: "#FF8000",
  Pesquisa: "#CCFF00",
};

const DESCRIPTIONS: Record<string, string> = {
  "Americans Acceptance Of Black Soldier Fly Larvae As Food":
    "**Estudo com 391 americanos** sobre aceitação de BSF como alimento e ração pet. **Resultado:** BSFL são vistas como eficientes, nutritivas e ecológicas. **Forma ideal:** Farinha (maior aceitação). **Sabor:** Comparado à gordura de pato/frango.",
  "Impact Of Insect Meal On Dog Food Allergy Case Report":
    "**Caso clínico:** Beagle de 5 anos com alergia alimentar. **Resultado:** Farinha de BSFL eliminou manifestações gastrointestinais em 12 dias. **Conclusão:** Opção promissora e viável para manejo de alergias alimentares caninas.",
  "An Assessment Of The Impact Of Insect Meal In Dry Food On A Dog With A Food Allergy A Case Report":
    "**Caso clínico:** Beagle de 5 anos com alergia alimentar. **Resultado:** Farinha de BSFL eliminou manifestações gastrointestinais em 12 dias. **Conclusão:** Opção promissora e viável para manejo de alergias alimentares caninas.",
  "Black Soldier Fly Hermetia Illucens Larvae As A Protein Substitute In Adverse Food Reactions For Canine Dermatitis Preliminary Results Among Patients":
    "**Estudo:** 16 cães (8 saudáveis + 8 com alergias) alimentados com BSF por 4 semanas. **Resultado:** Dieta bem tolerada, sem efeitos colaterais. **Descoberta:** Não exacerbou sintomas alérgicos. **Potencial:** Alternativa sustentável para dietas hipoalergênicas.",
  "BSF As Protein Substitute For Canine Dermatitis":
    "**Estudo:** 16 cães (8 saudáveis + 8 com alergias) alimentados com BSF por 4 semanas. **Resultado:** Dieta bem tolerada, sem efeitos colaterais. **Descoberta:** Não exacerbou sintomas alérgicos. **Potencial:** Alternativa sustentável para dietas hipoalergênicas.",
  "Black Soldier Fly Hermetia Illucens Larvae Protein Derivatives Potential To Promote Animal Health":
    "**Pesquisa antioxidante:** Derivados proteicos de BSF vs. farinha de frango/peixe. **Resultado:** BSF mostrou-se eficaz na proteção celular contra dano oxidativo. **Vantagem:** Proteção superior contra resposta imune comparado às proteínas convencionais.",
  "BSF Protein Derivatives Animal Health Promotion":
    "**Pesquisa antioxidante:** Derivados proteicos de BSF vs. farinha de frango/peixe. **Resultado:** BSF mostrou-se eficaz na proteção celular contra dano oxidativo. **Vantagem:** Proteção superior contra resposta imune comparado às proteínas convencionais.",
  "Black Soldier Fly Larvae As An Alternative Protein Source For Canine And Feline Diets":
    "**Dissertação completa:** BSF como fonte alternativa para cães e gatos. **Descoberta:** Larvas de 23 dias = maior digestibilidade de aminoácidos. **Classificação:** Fonte de proteína de alta qualidade para cães e gatos adultos e filhotes.",
  "BSF As Alternative Protein For Canine And Feline Diets":
    "**Dissertação completa:** BSF como fonte alternativa para cães e gatos. **Descoberta:** Larvas de 23 dias = maior digestibilidade de aminoácidos. **Classificação:** Fonte de proteína de alta qualidade para cães e gatos adultos e filhotes.",
  "Black Soldier Fly Larvae Meal In An Extruded Food Effects On Nutritional Quality And Health Parameters In Healthy Adult Cats":
    "**Estudo:** 8 gatos alimentados com 37,5% de farinha de BSF por 28 dias. **Resultado:** Excelente aceitação e consistência fecal. **Impacto positivo:** Aumento de ácidos graxos benéficos e bifidobactérias intestinais. **Conclusão:** Suporte à saúde intestinal felina.",
  "BSF Meal Effects On Adult Cats Health":
    "**Estudo:** 8 gatos alimentados com 37,5% de farinha de BSF por 28 dias. **Resultado:** Excelente aceitação e consistência fecal. **Impacto positivo:** Aumento de ácidos graxos benéficos e bifidobactérias intestinais. **Conclusão:** Suporte à saúde intestinal felina.",
  "Consumers Perception Of Bakery Products With Insect Fat As Partial Butter Replacement":
    "**Pesquisa:** Jovens de 24–27 anos testando produtos de panificação com gordura de BSF. **Resultado:** 25% de substituição da manteiga = emoções mais positivas. **Recomendação:** Substituições de até 25% mantêm aceitação sensorial.",
  "Consumer Perception Of Bakery Products With Insect Fat":
    "**Pesquisa:** Jovens de 24–27 anos testando produtos de panificação com gordura de BSF. **Resultado:** 25% de substituição da manteiga = emoções mais positivas. **Recomendação:** Substituições de até 25% mantêm aceitação sensorial.",
  "Digestibility And Safety Of Dry Black Soldier Fly Larvae Meal And Black Soldier Fly Larvae Oil In Dogs":
    "**Dois ensaios:** 56 cães testando diferentes níveis de farinha e óleo de BSF. **Resultado:** Excelente tolerância em todos os níveis testados (5–20% farinha, 1–5% óleo). **Segurança:** Parâmetros sanguíneos normais, digestibilidade alta mantida.",
  "Digestibility And Safety Of BSF Meal And Oil In Dogs":
    "**Dois ensaios:** 56 cães testando diferentes níveis de farinha e óleo de BSF. **Resultado:** Excelente tolerância em todos os níveis testados (5–20% farinha, 1–5% óleo). **Segurança:** Parâmetros sanguíneos normais, digestibilidade alta mantida.",
  "Effects Of Black Soldier Fly Larvae As Protein Or Fat Sources On Apparent Nutrient Digestibility Fecal Microbiota And Metabolic Profiles In Beagle Dogs":
    "**Estudo:** 20 cães beagle por 65 dias com proteína desengordurada (20%) ou gordura (8%) de BSF. **Resultado:** Sem impacto na condição corporal. **Microbiota:** Aumento de bactérias benéficas (Lachnoclostridium). **Segurança:** Parâmetros séricos normais.",
  "BSF Effects On Nutrient Digestibility And Fecal Microbiota":
    "**Estudo:** 20 cães beagle por 65 dias com proteína desengordurada (20%) ou gordura (8%) de BSF. **Resultado:** Sem impacto na condição corporal. **Microbiota:** Aumento de bactérias benéficas (Lachnoclostridium). **Segurança:** Parâmetros séricos normais.",
  "Evaluation Of An Extruded Diet For Adult Dogs Containing Larvae Meal From The Black Soldier Fly Hermetia Illucens":
    "**Comparação:** Dieta BSF vs. cordeiro em 12 cães beagle por 5 semanas. **Vantagens BSF:** Menor produção fecal, maior digestibilidade da matéria seca. **Tolerância:** Excelente, sem impactos imunológicos. **Conclusão:** Fonte proteica alternativa segura.",
  "Extruded Diet Evaluation With BSF Larvae Meal":
    "**Comparação:** Dieta BSF vs. cordeiro em 12 cães beagle por 5 semanas. **Vantagens BSF:** Menor produção fecal, maior digestibilidade da matéria seca. **Tolerância:** Excelente, sem impactos imunológicos. **Conclusão:** Fonte proteica alternativa segura.",
  "Evaluation Of Supplementation Of Defatted Black Soldier Fly Hermetia Illucens Larvae Meal In Beagle Dogs":
    "**Experimento:** 9 beagles fêmeas suplementadas com 1–2% de farinha BSF por 42 dias. **Benefícios:** Melhor digestibilidade de proteína, aumento da capacidade antioxidante e anti-inflamatória. **Resultado:** Melhoria mensurável da saúde geral.",
  "Supplementation Of Defatted BSF Meal In Beagles":
    "**Experimento:** 9 beagles fêmeas suplementadas com 1–2% de farinha BSF por 42 dias. **Benefícios:** Melhor digestibilidade de proteína, aumento da capacidade antioxidante e anti-inflamatória. **Resultado:** Melhoria mensurável da saúde geral.",
  "Fediaf Sab Statement Nutrition Of Senior Dogs":
    "**Documento oficial:** Federação Europeia da Indústria Pet sobre nutrição de cães idosos. **Conteúdo:** Diretrizes para longevidade, saúde cardiovascular e ácidos graxos ômega-3. **Relevância:** Guia de boas práticas para fabricação segura.",
  "FEDIAF Statement On Senior Dog Nutrition":
    "**Documento oficial:** Federação Europeia da Indústria Pet sobre nutrição de cães idosos. **Conteúdo:** Diretrizes para longevidade, saúde cardiovascular e ácidos graxos ômega-3. **Relevância:** Guia de boas práticas para fabricação segura.",
  "In Vivo And In Vitro Digestibility Of An Extruded Complete Dog Food Containing Black Soldier Fly Hermetia Illucens Larvae Meal As Protein Source":
    "**Estudo comparativo:** BSF vs. mosca doméstica vs. tenebrio em digestão simulada. **Resultado BSF:** 87,7% digestibilidade do nitrogênio, fermentação benéfica no intestino grosso. **Vantagem:** Maior degradação da quitina por microbiota canina.",
  "In Vitro Digestibility Of Complete Dog Food With BSF":
    "**Estudo comparativo:** BSF vs. mosca doméstica vs. tenebrio em digestão simulada. **Resultado BSF:** 87,7% digestibilidade do nitrogênio, fermentação benéfica no intestino grosso. **Vantagem:** Maior degradação da quitina por microbiota canina.",
  "Nutritional Value Of The Black Soldier Fly Hermetia Illucens L And Its Suitability As Animal Feed A Review":
    "**Revisão completa:** BSF converte resíduos em proteína de alta qualidade (37–63% proteína, 7–39% gordura). **Aplicações:** Substituição parcial em aves, suínos e peixes. **Vantagens ecológicas:** Menor emissão de gases, menor uso de terra/água.",
  "Nutritional Value And Suitability As Animal Feed Review":
    "**Revisão completa:** BSF converte resíduos em proteína de alta qualidade (37–63% proteína, 7–39% gordura). **Aplicações:** Substituição parcial em aves, suínos e peixes. **Vantagens ecológicas:** Menor emissão de gases, menor uso de terra/água.",
  "Protein Quality Of Insects As Potential Ingredients For Dog And Cat Foods":
    "**Estudo antiartrítico:** Derivados proteicos de BSF testados contra artrite. **Resultado:** Forte potencial antiartrítico sem toxicidade celular. **Contraste:** Farinha de frango pode contribuir para desenvolvimento de artrite. **Benefício:** Proteção articular natural.",
  "Protein Quality Of Insects For Dog And Cat Foods":
    "**Estudo antiartrítico:** Derivados proteicos de BSF testados contra artrite. **Resultado:** Forte potencial antiartrítico sem toxicidade celular. **Contraste:** Farinha de frango pode contribuir para desenvolvimento de artrite. **Benefício:** Proteção articular natural.",
  "Review Of Black Soldier Fly Hermetia Illucens As Animal Feed And Human Food":
    "**Revisão abrangente:** BSF como ração animal e alimento humano (40,8% proteína, 28,6% gordura média). **Aplicação:** Especialmente eficaz para peixes carnívoros. **Desafios:** Restrições legais regionais e estigmas sociais sobre consumo de insetos.",
  "Review Of BSF As Animal Feed And Human Food":
    "**Revisão abrangente:** BSF como ração animal e alimento humano (40,8% proteína, 28,6% gordura média). **Aplicação:** Especialmente eficaz para peixes carnívoros. **Desafios:** Restrições legais regionais e estigmas sociais sobre consumo de insetos.",
};

// ─── Component ───────────────────────────────────────────────────────────────

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [filteredPDFs, setFilteredPDFs] = useState<PDFFile[]>([]);
  const [isLoadingPDFs, setIsLoadingPDFs] = useState(true);
  // BUG FIX #1: Per-card loading state instead of one global flag
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  // BUG FIX #2: Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  // BUG FIX #3: Fetch PDFs independently of auth gate check
  useEffect(() => {
    const fetchPDFs = async () => {
      setIsLoadingPDFs(true);
      try {
        const { data: storageFiles, error } = await supabase.storage
          .from("PDF Library")
          .list();

        if (error) throw error;

        const files: PDFFile[] = storageFiles
          .filter((f) => f.name.endsWith(".pdf"))
          .map((file, index) => {
            const nameNoExt = file.name.replace(".pdf", "");
            const title = nameNoExt
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());

            const { data: { publicUrl } } = supabase.storage
              .from("PDF Library")
              .getPublicUrl(file.name);

            const sizeBytes = file.metadata?.size ?? 0;
            const sizeMB =
              sizeBytes > 0
                ? (sizeBytes / (1024 * 1024)).toFixed(1) + " MB"
                : "—";

            return {
              id: file.id || `file-${index}`,
              title,
              description:
                DESCRIPTIONS[title] ||
                `Pesquisa científica sobre ${title.toLowerCase()}`,
              category: getCategory(file.name),
              file_size: sizeMB,
              file_name: file.name,
              file_url: publicUrl,
            };
          });

        setPdfs(files);
        setFilteredPDFs(files);
      } catch (err) {
        console.error("Erro ao carregar PDFs:", err);
        toast({
          variant: "destructive",
          title: "Erro ao carregar biblioteca",
          description:
            "Não foi possível listar os arquivos. Verifique a conexão.",
        });
      } finally {
        setIsLoadingPDFs(false);
      }
    };

    // Only fetch when user is set (library is auth-gated)
    if (user) {
      fetchPDFs();
    }
  }, [user, toast]);

  // Search filter
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredPDFs(
      pdfs.filter(
        (pdf) =>
          pdf.title.toLowerCase().includes(term) ||
          pdf.description.toLowerCase().includes(term) ||
          pdf.category.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, pdfs]);

  const handleLogout = () => {
    logout();
    toast({ title: "Até logo!" });
    navigate("/");
  };

  // BUG FIX #4: Use publicUrl (window.open) instead of blob download
  // — avoids CORS issues and doesn't require storage auth
  // — download_logs insert wrapped in try/catch so it never blocks the download
  const handleDownload = async (pdf: PDFFile) => {
    setDownloadingIds((prev) => new Set(prev).add(pdf.id));
    try {
      // Open the public URL directly — works without Supabase auth
      window.open(pdf.file_url, "_blank", "noopener,noreferrer");

      // Log the download (best-effort — failure won't break anything)
      try {
      await (supabase as any).from("download_logs").insert({
          lead_id: user?.id ?? "anonymous",
          file_name: pdf.file_name,
        });
      } catch {
        // Silently ignore — download already succeeded
      }

      toast({
        title: "Download iniciado!",
        description: pdf.title,
      });
    } catch (err) {
      console.error("Download error:", err);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: "Não foi possível abrir o arquivo.",
      });
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(pdf.id);
        return next;
      });
    }
  };

  if (!user) return null;

  return (
    <div className="grain min-h-screen bg-background">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: "hsl(0 0% 5% / 0.95)",
          borderColor: "hsl(0 0% 18%)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1
            className="font-big-shoulders font-black uppercase text-2xl"
            style={{ color: "#CCFF00", letterSpacing: "-0.02em" }}
          >
            Acervo Científico BSF
          </h1>

          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-special-elite">
              <User className="h-4 w-4" />
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-special-elite"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">

        {/* ── Hero text ──────────────────────────────────────────────────────── */}
        <div className="mb-10">
          <p className="font-big-shoulders text-5xl font-black uppercase leading-none mb-3"
            style={{ color: "#CCFF00", letterSpacing: "-0.02em" }}>
            {pdfs.length > 0 ? `${pdfs.length} estudos` : "Carregando..."}
          </p>
          <p className="font-special-elite text-muted-foreground text-sm">
            Pesquisas científicas sobre proteína de mosca-soldado-negra para nutrição animal.
          </p>
        </div>

        {/* ── Search ─────────────────────────────────────────────────────────── */}
        <div className="max-w-xl mb-8">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: "#CCFF00" }}
            />
            <Input
              type="search"
              placeholder="Buscar por título, tema ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 font-special-elite bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          {searchTerm && (
            <p className="text-xs text-muted-foreground mt-2 font-special-elite">
              {filteredPDFs.length} de {pdfs.length} resultados
            </p>
          )}
        </div>

        {/* ── Loading state ──────────────────────────────────────────────────── */}
        {isLoadingPDFs && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse border"
                style={{
                  backgroundColor: "hsl(0 0% 8%)",
                  borderColor: "hsl(0 0% 18%)",
                  borderRadius: "0.25rem",
                  height: "200px",
                }}
              />
            ))}
          </div>
        )}

        {/* ── PDF Grid ───────────────────────────────────────────────────────── */}
        {!isLoadingPDFs && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPDFs.map((pdf) => {
              const isDownloading = downloadingIds.has(pdf.id);
              const accentColor = CATEGORY_COLORS[pdf.category] ?? "#CCFF00";

              return (
                <div
                  key={pdf.id}
                  className="flex flex-col border transition-all duration-200 hover:border-primary/60"
                  style={{
                    backgroundColor: "hsl(0 0% 8%)",
                    borderColor: "hsl(0 0% 18%)",
                    borderRadius: "0.25rem",
                  }}
                >
                  {/* Category tag */}
                  <div className="px-4 pt-4">
                    <span
                      className="inline-block font-big-shoulders text-xs font-black uppercase px-2 py-0.5"
                      style={{
                        backgroundColor: accentColor,
                        color: "#000000",
                        borderRadius: "0.15rem",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {pdf.category}
                    </span>
                  </div>

                  {/* Title + description */}
                  <div className="flex-1 px-4 pt-3 pb-4">
                    <h3
                      className="font-big-shoulders font-black text-lg leading-tight mb-2"
                      style={{ letterSpacing: "-0.01em" }}
                    >
                      {pdf.title}
                    </h3>
                    <p className="font-special-elite text-muted-foreground text-sm leading-relaxed">
                      {parseDescription(pdf.description)}
                    </p>
                  </div>

                  {/* Footer: size + download */}
                  <div
                    className="px-4 pb-4 flex items-center justify-between"
                    style={{ borderTop: "1px solid hsl(0 0% 14%)", paddingTop: "12px" }}
                  >
                    <span className="font-special-elite text-xs text-muted-foreground">
                      {pdf.file_size}
                    </span>

                    <button
                      onClick={() => handleDownload(pdf)}
                      disabled={isDownloading}
                      className="flex items-center gap-2 font-big-shoulders font-black uppercase text-sm px-4 py-2 transition-all duration-150 active:scale-95 disabled:opacity-50"
                      style={{
                        backgroundColor: "#CCFF00",
                        color: "#000000",
                        borderRadius: "0.25rem",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                      {isDownloading ? "Abrindo..." : "Baixar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Empty state ────────────────────────────────────────────────────── */}
        {!isLoadingPDFs && filteredPDFs.length === 0 && (
          <div className="text-center py-20">
            <FileText
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: "hsl(0 0% 25%)" }}
            />
            <p className="font-big-shoulders text-xl font-black uppercase text-muted-foreground">
              Nenhum resultado
            </p>
            <p className="font-special-elite text-sm text-muted-foreground mt-2">
              Tente outros termos de busca
            </p>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="border-t mt-16 py-8 flex justify-center items-center gap-8 opacity-30"
        style={{ borderColor: "hsl(0 0% 18%)" }}
      >
        <img
          src="/lovable-uploads/67799d3a-7a64-49be-9f04-a4d19e4b630f.png"
          alt="Lets Fly"
          className="h-10 object-contain"
        />
        <img
          src="/lovable-uploads/dde49e41-d26a-4c0d-a782-0038de85ff71.png"
          alt="Comida de Dragão"
          className="h-8 object-contain"
        />
      </footer>
    </div>
  );
};

export default Library;
