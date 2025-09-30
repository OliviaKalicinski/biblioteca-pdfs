import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Lead {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  last_access: string;
  access_count: number;
}

interface AuthContextType {
  user: Lead | null;
  login: (name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is in localStorage
    const userData = localStorage.getItem("pdfLibraryUser");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = async (name: string, phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("leads")
        .select("*")
        .eq("phone", phone)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let userData: Lead;

      if (existingUser) {
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from("leads")
          .update({
            name,
            last_access: new Date().toISOString(),
            access_count: existingUser.access_count + 1
          })
          .eq("phone", phone)
          .select("*")
          .single();

        if (updateError) throw updateError;
        userData = updatedUser;
      } else {
        // Create new user
        const { data: newUser, error: insertError } = await supabase
          .from("leads")
          .insert({
            name,
            phone,
            access_count: 1
          })
          .select("*")
          .single();

        if (insertError) throw insertError;
        userData = newUser;
      }

      setUser(userData);
      localStorage.setItem("pdfLibraryUser", JSON.stringify(userData));
      
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.message || "Erro ao fazer login. Tente novamente." 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pdfLibraryUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};