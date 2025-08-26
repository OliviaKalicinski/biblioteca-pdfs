import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Download, FileText, LogOut, User } from "lucide-react";

// Mock PDF data (will be replaced with Supabase data)
const mockPDFs = [
  {
    id: "1",
    title: "Guia Completo de Marketing Digital",
    description: "Estratégias avançadas para crescer sua marca online",
    category: "Marketing",
    downloadCount: 1247,
    fileSize: "2.5 MB"
  },
  {
    id: "2", 
    title: "Produtividade Máxima em 2024",
    description: "Técnicas comprovadas para otimizar seu tempo",
    category: "Produtividade",
    downloadCount: 892,
    fileSize: "1.8 MB"
  },
  {
    id: "3",
    title: "Design System Moderno",
    description: "Como criar interfaces consistentes e escaláveis", 
    category: "Design",
    downloadCount: 654,
    fileSize: "3.1 MB"
  },
  {
    id: "4",
    title: "Finanças Pessoais Inteligentes",
    description: "Controle suas finanças e construa riqueza",
    category: "Finanças", 
    downloadCount: 1532,
    fileSize: "2.2 MB"
  },
  {
    id: "5",
    title: "Apresentações que Convencem",
    description: "Técnicas de persuasão para suas apresentações",
    category: "Apresentação",
    downloadCount: 423,
    fileSize: "1.5 MB"
  },
  {
    id: "6",
    title: "Estratégias de Growth Hacking",
    description: "Crescimento exponencial com recursos limitados",
    category: "Marketing", 
    downloadCount: 789,
    fileSize: "2.8 MB"
  }
];

const Library = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPDFs, setFilteredPDFs] = useState(mockPDFs);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("pdfLibraryUser");
    if (!userData) {
      navigate("/");
      return;
    }
    
    setUser(JSON.parse(userData));
  }, [navigate]);

  useEffect(() => {
    // Filter PDFs based on search term
    const filtered = mockPDFs.filter(pdf => 
      pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPDFs(filtered);
  }, [searchTerm]);

  const handleLogout = () => {
    localStorage.removeItem("pdfLibraryUser");
    toast({
      title: "Logout realizado",
      description: "Até a próxima!",
    });
    navigate("/");
  };

  const handleDownload = async (pdf: any) => {
    setIsLoading(true);
    
    // Simulate download process
    setTimeout(() => {
      toast({
        title: "Download iniciado!",
        description: `${pdf.title} está sendo baixado.`,
      });
      setIsLoading(false);
      
      // Increment download count (will be handled by Supabase later)
      const updatedPDFs = filteredPDFs.map(p => 
        p.id === pdf.id ? { ...p, downloadCount: p.downloadCount + 1 } : p
      );
      setFilteredPDFs(updatedPDFs);
    }, 500);
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
            {filteredPDFs.length === mockPDFs.length 
              ? `${mockPDFs.length} PDFs disponíveis` 
              : `${filteredPDFs.length} de ${mockPDFs.length} PDFs encontrados`
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
                  <span>{pdf.fileSize}</span>
                  <span className="flex items-center space-x-1">
                    <Download className="h-3 w-3" />
                    <span>{pdf.downloadCount.toLocaleString()}</span>
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