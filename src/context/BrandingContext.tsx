import React, { createContext, useContext, useState, useEffect } from 'react';

interface Branding {
  municipality_name: string;
  municipality_logo_url: string;
  primary_color: string;
  secondary_color: string;
  welcome_message: string;
}

interface BrandingContextType {
  branding: Branding;
  updateBranding: (newBranding: Partial<Branding>) => Promise<void>;
  isLoading: boolean;
}

const defaultBranding: Branding = {
  municipality_name: "Prefeitura de Manaus",
  municipality_logo_url: "",
  primary_color: "#4f46e5",
  secondary_color: "#1e293b",
  welcome_message: "Bem-vindo ao SIDAM"
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<Branding>(defaultBranding);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/branding')
      .then(res => res.json())
      .then(data => {
        setBranding(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar branding:", err);
        setIsLoading(false);
      });
  }, []);

  const updateBranding = async (newBranding: Partial<Branding>) => {
    try {
      const res = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranding)
      });
      const data = await res.json();
      if (data.status === 'success') {
        setBranding(data.branding);
      }
    } catch (err) {
      console.error("Erro ao atualizar branding:", err);
      throw err;
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, isLoading }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding deve ser usado dentro de um BrandingProvider');
  }
  return context;
}
