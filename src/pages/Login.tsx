import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatPhone, isValidPhone, getPhoneValidationError } from "@/lib/phone-utils";
import backgroundImage from "@/assets/background-pattern.png";
const Login = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
    if (!name.trim() || !phone.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos."
      });
      return;
    }

    // Validar telefone
    const phoneError = getPhoneValidationError(phone);
    if (phoneError) {
      toast({
        variant: "destructive",
        title: "Telefone inválido",
        description: phoneError
      });
      return;
    }
    const result = await login(name, phone);
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
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };
  return <div className="min-h-screen flex items-center justify-center p-4" style={{
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-big-shoulders font-bold text-login-text mb-2 py-[20px]">Base de Dados Científicos</h1>
          <p className="text-login-accent text-lg font-special-elite">Acervo especializado em pesquisas científicas sobre proteína de mosca-soldado-negra (BSF) para nutrição animal.</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-login-text font-special-elite">
              Acessar Biblioteca
            </CardTitle>
            <CardDescription className="text-login-text font-special-elite">
              Preencha seus dados para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-login-text font-special-elite">
                  Nome Completo
                </Label>
                <Input id="name" type="text" placeholder="Digite seu nome completo" value={name} onChange={e => setName(e.target.value)} className="h-11 bg-login-field-bg border-border focus:ring-primary focus:border-primary font-special-elite" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-login-text font-special-elite">
                  Telefone
                </Label>
                <Input id="phone" type="tel" placeholder="(00) 00000-0000" value={phone} onChange={handlePhoneChange} maxLength={15} className="h-11 bg-login-field-bg border-border focus:ring-primary focus:border-primary font-special-elite" required />
              </div>

              <Button type="submit" className="w-full h-11 bg-login-accent hover:bg-login-accent/90 text-white font-semibold font-special-elite shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" disabled={isLoading}>
                {isLoading ? "Acessando..." : "Acessar Biblioteca"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-login-accent/70 text-sm font-special-elite">
            Ao continuar, você concorda com nossos termos de uso
          </p>
        </div>

        <footer className="flex justify-center items-center gap-8 mt-8 pb-6">
          <img src="/lovable-uploads/67799d3a-7a64-49be-9f04-a4d19e4b630f.png" alt="Lets Fly Logo" className="h-32 w-auto" />
          <img src="/lovable-uploads/750d7ff8-8eba-469b-b149-911788f0ee87.png" alt="Comida Dragão Logo" className="h-16 w-auto" />
        </footer>
      </div>
    </div>;
};
export default Login;