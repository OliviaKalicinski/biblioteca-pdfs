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
  description: string;
  category: string;
  file_size: string;
  download_count: number;
  file_url: string;
  created_at: string;
  file_name: string;
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
        // Fetch files from storage bucket
        const { data: storageFiles, error: storageError } = await supabase.storage
          .from("PDF Library")
          .list();

        if (storageError) throw storageError;

        // Transform storage files into our PDFFile format
        const transformedFiles: PDFFile[] = storageFiles.map((file, index) => {
          const fileName = file.name.replace('.pdf', '');
          const sizeInMB = (file.metadata?.size / (1024 * 1024)).toFixed(1) + ' MB';
          
          // Generate public URL for the file
          const { data: { publicUrl } } = supabase.storage
            .from("PDF Library")
            .getPublicUrl(file.name);

          return {
            id: file.id || `storage-${index}`,
            title: fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `PDF científico sobre ${fileName.includes('black-soldier') ? 'black soldier fly' : 'pesquisa científica'}`,
            category: fileName.includes('nutrition') || fileName.includes('digestibility') ? 'Nutrição' : 
                     fileName.includes('protein') ? 'Proteína' : 
                     fileName.includes('food') || fileName.includes('feed') ? 'Alimentação' :
                     'Pesquisa',
            file_size: sizeInMB,
            download_count: Math.floor(Math.random() * 50), // Mock download count for now
            file_url: publicUrl,
            created_at: file.created_at || new Date().toISOString(),
            file_name: file.name
          };
        }).filter(file => file.file_name.endsWith('.pdf'));

        setPdfs(transformedFiles);
        setFilteredPDFs(transformedFiles);
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
      // Download the actual file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("PDF Library")
        .download(pdf.file_name);

      if (downloadError) throw downloadError;

      // Create blob and download link
      const blob = new Blob([fileData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdf.title + '.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Log the download
      await supabase
        .from("download_logs")
        .insert({
          lead_id: user.id,
          file_name: pdf.file_name
        });

      // Update local state download count
      setPdfs(prev => 
        prev.map(p => 
          p.id === pdf.id 
            ? { ...p, download_count: p.download_count + 1 }
            : p
        )
      );

      toast({
        title: "Download realizado!",
        description: `${pdf.title} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro no download",
        description: "Ocorreu um erro ao baixar o arquivo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Nutrição': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Proteína': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Alimentação': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Pesquisa': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
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