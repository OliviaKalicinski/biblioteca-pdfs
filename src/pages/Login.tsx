import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
const Login = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    login,
    user,
    isLoading
  } = useAuth();
  useEffect(() => {
    if (user) {
      navigate("/biblioteca");
    }
  }, [user, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, insira um email válido."
      });
      return;
    }
    const result = await login(name, email);
    if (result.success) {
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${name}!`
      });
      navigate("/biblioteca");
    } else {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: result.error || "Ocorreu um erro inesperado."
      });
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📚 Biblioteca
          </h1>
          <p className="text-white/90 text-lg">
            Acesse nossa coleção exclusiva de PDFs
          </p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Acessar Biblioteca
            </CardTitle>
            <CardDescription>
              Preencha seus dados para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nome Completo
                </Label>
                <Input id="name" type="text" placeholder="Digite seu nome completo" value={name} onChange={e => setName(e.target.value)} className="h-11 bg-input border-border focus:ring-primary focus:border-primary" required />
              </div>
              
              <div className="space-y-2">
                
                <Input id="email" type="email" placeholder="Digite seu e-mail" value={email} onChange={e => setEmail(e.target.value)} className="h-11 bg-input border-border focus:ring-primary focus:border-primary" required />
              </div>

              <Button type="submit" className="w-full h-11 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" disabled={isLoading}>
                {isLoading ? "Acessando..." : "Acessar Biblioteca"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-white/70 text-sm">
            Ao continuar, você concorda com nossos termos de uso
          </p>
        </div>
      </div>
    </div>;
};
export default Login;