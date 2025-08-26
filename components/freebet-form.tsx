"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FreebetFormData, Freebet } from "@/lib/types";
import { saveFreebet } from "@/lib/storage";

interface FreebetFormProps {
  onSubmit: (freebet: Freebet) => void;
}

export function FreebetForm({ onSubmit }: FreebetFormProps) {
  const [formData, setFormData] = useState<FreebetFormData>({
    casa: "",
    oddMinima: 0,
    valor: 0,
    situacao: "",
    dataExpiracao: ""
  });

  // Obter a data atual no formato YYYY-MM-DD para o valor mínimo do campo de data
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Para campos numéricos, converta o valor para número
    if (name === "oddMinima" || name === "valor") {
      const numValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.casa || formData.oddMinima <= 0 || formData.valor <= 0 || !formData.situacao || !formData.dataExpiracao) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Criar novo objeto freebet com ID, data e status
      const newFreebet: Freebet = {
        id: `fb_${Date.now()}`,
        ...formData,
        data: new Date().toISOString(),
        utilizada: false,
        extraida: false,
      };
      
      // Salvar no backend e aguardar resposta
      const savedFreebet = await saveFreebet(newFreebet);
      
      if (!savedFreebet) {
        throw new Error("Falha ao salvar freebet");
      }
      
      // Notificar o componente pai com a freebet salva
      onSubmit(savedFreebet);
      
      // Limpar o formulário
      setFormData({
        casa: "",
        oddMinima: 0,
        valor: 0,
        situacao: "",
        dataExpiracao: ""
      });
    } catch (error) {
      console.error("Erro ao salvar freebet:", error);
      alert("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <div className="absolute top-0 h-1 left-0 right-0 bg-gradient-to-r from-fedora-blue to-fedora-accent"></div>
      <CardHeader>
        <CardTitle>Registrar Nova Freebet</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="casa"
              className="text-sm font-medium leading-none"
            >
              Casa de Apostas
            </label>
            <Input
              id="casa"
              name="casa"
              value={formData.casa}
              onChange={handleChange}
              placeholder="Nome da casa de apostas"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="oddMinima"
                className="text-sm font-medium leading-none"
              >
                Odd Mínima
              </label>
              <Input
                id="oddMinima"
                name="oddMinima"
                type="number"
                min="1"
                step="0.01"
                value={formData.oddMinima || ""}
                onChange={handleChange}
                placeholder="Ex: 1.5"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label
                htmlFor="valor"
                className="text-sm font-medium leading-none"
              >
                Valor (R$)
              </label>
              <Input
                id="valor"
                name="valor"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor || ""}
                onChange={handleChange}
                placeholder="Ex: 50"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="situacao"
                className="text-sm font-medium leading-none"
              >
                Situação
              </label>
              <Input
                id="situacao"
                name="situacao"
                value={formData.situacao}
                onChange={handleChange}
                placeholder="Ex: Simples, Múltipla"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label
                htmlFor="dataExpiracao"
                className="text-sm font-medium leading-none"
              >
                Data de Expiração
              </label>
              <Input
                id="dataExpiracao"
                name="dataExpiracao"
                type="date"
                min={today}
                value={formData.dataExpiracao}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-fedora-blue hover:bg-fedora-blue/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adicionando...</span>
              </div>
            ) : (
              "Adicionar Freebet"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

