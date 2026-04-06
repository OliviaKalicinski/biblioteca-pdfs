import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatPhone, getPhoneValidationError } from "@/lib/phone-utils";

const Login = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, user, isLoading } = useAuth();

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
        description: "Por favor, preencha todos os campos.",
      });
      return;
    }

    const phoneError = getPhoneValidationError(phone);
    if (phoneError) {
      toast({
        variant: "destructive",
        title: "Telefone inválido",
        description: phoneError,
      });
      return;
    }

    const result = await login(name, phone);
    if (result.success) {
      toast({
        title: "Acesso liberado!",
        description: `Bem-vindo(a), ${name}.`,
      });
      navigate("/biblioteca");
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao acessar",
        description: result.error || "Ocorreu um erro inesperado.",
      });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <div className="grain min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img
            src="/lovable-uploads/dde49e41-d26a-4c0d-a782-0038de85ff71.png"
            alt="Comida de Dragão"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1
            className="font-big-shoulders text-5xl font-black uppercase leading-none mb-3"
            style={{ color: "#CCFF00", letterSpacing: "-0.02em" }}
          >
            Base Científica
            <br />
            BSF
          </h1>
          <p className="font-special-elite text-muted-foreground text-sm leading-relaxed">
            Acervo de pesquisas sobre proteína de mosca-soldado-negra
            para nutrição animal. Preencha seus dados para acessar.
          </p>
        </div>

        {/* Form card */}
        <div
          className="border p-6"
          style={{
            backgroundColor: "hsl(0 0% 8%)",
            borderColor: "hsl(0 0% 18%)",
            borderRadius: "0.25rem",
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="font-big-shoulders text-sm font-bold uppercase tracking-widest"
                style={{ color: "#CCFF00" }}
              >
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 font-special-elite bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="font-big-shoulders text-sm font-bold uppercase tracking-widest"
                style={{ color: "#CCFF00" }}
              >
                Telefone / WhatsApp
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={15}
                required
                className="h-11 font-special-elite bg-input border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 font-big-shoulders font-black uppercase text-base tracking-wider transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                backgroundColor: "#CCFF00",
                color: "#000000",
                borderRadius: "0.25rem",
              }}
            >
              {isLoading ? "Acessando..." : "Acessar biblioteca →"}
            </Button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-muted-foreground text-xs font-special-elite mt-6">
          Ao continuar, você concorda com nossos termos de uso.
        </p>

        {/* Lets Fly logo */}
        <div className="flex justify-center mt-8 opacity-40">
          <img
            src="/lovable-uploads/67799d3a-7a64-49be-9f04-a4d19e4b630f.png"
            alt="Lets Fly"
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
