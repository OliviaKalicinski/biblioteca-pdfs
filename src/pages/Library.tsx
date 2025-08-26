import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, FileText, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PDFFile {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_size: string;
  download_count: number;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

const Library = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPDFs, setFilteredPDFs] = useState<PDFFile[]>([]);
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchPDFs = async () => {
      try {
        const { data, error } = await supabase
          .from("pdf_files")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPdfs(data || []);
        setFilteredPDFs(data || []);
      } catch (error) {
        console.error("Error fetching PDFs:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar PDFs",
          description: "Ocorreu um erro ao carregar a biblioteca.",
        });
      }
    };

    if (user) {
      fetchPDFs();
    }
  }, [user, toast]);

  useEffect(() => {
    // Filter PDFs based on search term
    const filtered = pdfs.filter(pdf =>
      pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pdf.description && pdf.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      pdf.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPDFs(filtered);
  }, [searchTerm, pdfs]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Até a próxima!",
    });
    navigate("/");
  };

  const handleDownload = async (pdf: PDFFile) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Log the download
      await supabase
        .from("download_logs")
        .insert({
          lead_id: user.id,
          pdf_id: pdf.id
        });

      // Update download count
      const { error } = await supabase
        .from("pdf_files")
        .update({ 
          download_count: pdf.download_count + 1 
        })
        .eq("id", pdf.id);

      if (error) throw error;

      // Update local state
      setPdfs(prev => 
        prev.map(p => 
          p.id === pdf.id 
            ? { ...p, download_count: p.download_count + 1 }
            : p
        )
      );

      toast({
        title: "Download registrado!",
        description: `${pdf.title} foi registrado como baixado.`,
      });
    } catch (error) {
      console.error("Error logging download:", error);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: "Ocorreu um erro ao registrar o download.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Marketing': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Produtividade': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Design': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Finanças': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Apresentação': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-muted">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                📚 Biblioteca PDF
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Olá, <strong>{user.name}</strong></span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Pesquisar PDFs por título, descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-border focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="text-center mb-8">
          <p className="text-muted-foreground">
            {filteredPDFs.length === pdfs.length 
              ? `${pdfs.length} PDFs disponíveis` 
              : `${filteredPDFs.length} de ${pdfs.length} PDFs encontrados`
            }
          </p>
        </div>

        {/* PDF Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPDFs.map((pdf) => (
            <Card key={pdf.id} className="group hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                  <Badge variant="secondary" className={getCategoryColor(pdf.category)}>
                    {pdf.category}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {pdf.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {pdf.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{pdf.file_size}</span>
                  <span className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>{pdf.download_count.toLocaleString()}</span>
                  </span>
                </div>
                
                <Button 
                  onClick={() => handleDownload(pdf)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isLoading ? "Baixando..." : "Baixar PDF"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPDFs.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum PDF encontrado</h3>
            <p className="text-muted-foreground">
              Tente usar outros termos de busca
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Library;