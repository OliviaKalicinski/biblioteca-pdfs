import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cleanPhone } from "@/lib/phone-utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lead {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

interface AuthContextType {
  user: Lead | null;
  login: (name: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("pdfLibraryUser");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem("pdfLibraryUser");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (
    name: string,
    phone: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanedPhone = cleanPhone(phone);

      // Check if lead already exists
      const { data: existing, error: fetchError } = await supabase
        .from("leads")
        .select("id, name, phone, created_at")
        .eq("phone", cleanedPhone)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      let userData: Lead;

      if (existing) {
        // Lead exists — update name only (no access_count, no last_access)
        const { data: updated, error: updateError } = await supabase
          .from("leads")
          .update({ name })
          .eq("phone", cleanedPhone)
          .select("id, name, phone, created_at")
          .single();

        if (updateError) throw updateError;
        userData = updated;
      } else {
        // New lead — insert with only the columns that definitely exist
        const { data: created, error: insertError } = await supabase
          .from("leads")
          .insert({ name, phone: cleanedPhone })
          .select("id, name, phone, created_at")
          .single();

        if (insertError) throw insertError;
        userData = created;
      }

      setUser(userData);
      localStorage.setItem("pdfLibraryUser", JSON.stringify(userData));
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Erro ao acessar. Tente novamente.",
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
