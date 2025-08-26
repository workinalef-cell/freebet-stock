"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Freebet } from "@/lib/types";
import { updateFreebet, deleteFreebet } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { 
  TrashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  PencilIcon,
  CalculatorIcon
} from "@heroicons/react/24/outline";

interface FreebetListProps {
  freebets: Freebet[];
  onUpdate: () => void;
}

export function FreebetList({ freebets, onUpdate }: FreebetListProps) {
  const router = useRouter();
  const [expandedFreebet, setExpandedFreebet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ativas");
  const [extracaoMode, setExtracaoMode] = useState<string | null>(null);
  const [valorExtraido, setValorExtraido] = useState<string>("");
  const [editMode, setEditMode] = useState<string | null>(null);
  const [localFreebets, setLocalFreebets] = useState<Freebet[]>([]);
  const [editValues, setEditValues] = useState<{
    casa: string;
    oddMinima: number;
    valor: number;
    situacao: string;
    dataExpiracao: string;
  }>({
    casa: "",
    oddMinima: 0,
    valor: 0,
    situacao: "",
    dataExpiracao: ""
  });
  
  // Sincronizar freebets do prop com o estado local
  useEffect(() => {
    setLocalFreebets(freebets);
  }, [freebets]);

  const handleToggleExpand = (id: string) => {
    setExpandedFreebet(expandedFreebet === id ? null : id);
  };

  const handleToggleStatus = (freebet: Freebet) => {
    const updated = {
      ...freebet,
      utilizada: !freebet.utilizada,
      extraida: false,
    };
    updateFreebet(updated);
    onUpdate();
  };
  
  const handleStartExtracao = (freebet: Freebet) => {
    setExtracaoMode(freebet.id);
    setValorExtraido("");
  };
  
  const handleRegistrarExtracao = async (freebet: Freebet) => {
    const valor = parseFloat(valorExtraido);
    if (isNaN(valor) || valor <= 0) {
      alert("Por favor, informe um valor válido para a extração.");
      return;
    }
    
    const updated = {
      ...freebet,
      utilizada: true,
      extraida: true,
      valorExtraido: valor
    };
    
    try {
      // Atualizar estado local imediatamente para feedback visual
      setLocalFreebets(prevFreebets => 
        prevFreebets.map(fb => fb.id === freebet.id ? updated : fb)
      );
      
      // Atualizar no backend
      await updateFreebet(updated);
      setExtracaoMode(null);
      
      // Atualizar dados completos
      onUpdate();
    } catch (error) {
      console.error("Erro ao registrar extração:", error);
      alert("Erro ao registrar extração. Tente novamente.");
      onUpdate(); // Recarregar dados originais em caso de erro
    }
  };
  
  const handleStartEdit = (freebet: Freebet) => {
    setEditMode(freebet.id);
    setEditValues({
      casa: freebet.casa,
      oddMinima: freebet.oddMinima,
      valor: freebet.valor,
      situacao: freebet.situacao,
      dataExpiracao: freebet.dataExpiracao || ""
    });
  };
  
  const handleSaveEdit = (freebet: Freebet) => {
    if (!editValues.casa || editValues.oddMinima <= 0 || editValues.valor <= 0 || !editValues.situacao) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    
    const updated = {
      ...freebet,
      casa: editValues.casa,
      oddMinima: editValues.oddMinima,
      valor: editValues.valor,
      situacao: editValues.situacao,
      dataExpiracao: editValues.dataExpiracao
    };
    updateFreebet(updated);
    setEditMode(null);
    onUpdate();
  };
  
  const handleCancelEdit = () => {
    setEditMode(null);
  };
  
  const handleCancelExtracao = () => {
    setExtracaoMode(null);
  };
  
  const handleIrCalculadora = () => {
    router.push("/calculadora");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta freebet?")) {
      try {
        // Mostrar feedback visual imediato
        setLocalFreebets(localFreebets.filter(fb => fb.id !== id));
        
        // Executar a exclusão no backend
        const success = await deleteFreebet(id);
        
        if (success) {
          // Atualizar a lista completa após a exclusão
          onUpdate();
        } else {
          throw new Error("Falha ao excluir");
        }
      } catch (error) {
        console.error("Erro ao excluir freebet:", error);
        alert("Erro ao excluir. Tente novamente.");
        // Recarregar os dados originais em caso de erro
        onUpdate();
      }
    }
  };

  // Verifica se a freebet está expirada
  const isExpired = (freebet: Freebet): boolean => {
    if (!freebet.dataExpiracao) return false;
    
    const today = new Date();
    const expirationDate = new Date(freebet.dataExpiracao);
    return today > expirationDate;
  };

  // Filtra as freebets de acordo com o status
  const activeFreebets = localFreebets.filter(fb => !fb.utilizada && !isExpired(fb));
  const extractedFreebets = localFreebets.filter(fb => fb.utilizada && fb.extraida);
  const expiredFreebets = localFreebets.filter(fb => isExpired(fb));

  // Organiza as freebets por data (mais recente primeiro)
  const sortFreebets = (list: Freebet[]) => {
    return [...list].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  };

  // Freebets ordenadas
  const sortedActiveFreebets = sortFreebets(activeFreebets);
  const sortedExtractedFreebets = sortFreebets(extractedFreebets);
  const sortedExpiredFreebets = sortFreebets(expiredFreebets);

  // Renderiza uma freebet individual
  const renderFreebet = (freebet: Freebet) => {
    // Determina a cor do status baseada na categoria
    let statusColor = "bg-green-500";
    if (freebet.extraida) {
      statusColor = "bg-blue-500";
    } else if (isExpired(freebet)) {
      statusColor = "bg-red-500";
    } else if (freebet.utilizada) {
      statusColor = "bg-gray-400";
    }

    return (
      <div 
        key={freebet.id} 
        className={`mb-2 border rounded-lg overflow-hidden transition-colors ${
          freebet.utilizada || isExpired(freebet)
            ? "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700" 
            : "bg-white dark:bg-gray-900 border-fedora-blue/20 dark:border-fedora-accent/20"
        }`}
      >
        <div 
          className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer gap-2"
          onClick={() => handleToggleExpand(freebet.id)}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <h3 className="font-medium">{freebet.casa}</h3>
                <span className={`text-xs px-2 py-0.5 rounded inline-block sm:inline ${
                  freebet.utilizada || isExpired(freebet)
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300" 
                    : "bg-fedora-blue/10 dark:bg-fedora-blue/20 text-fedora-blue dark:text-fedora-accent"
                }`}>
                  {freebet.situacao}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(freebet.valor)} • Odd mín: {freebet.oddMinima}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {/* Mostrar botão de registrar extração apenas para freebets ativas */}
            {!freebet.utilizada && !isExpired(freebet) && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 p-0 px-1 text-green-500 flex items-center gap-1"
                title="Registrar Extração"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartExtracao(freebet);
                }}
              >
                <BanknotesIcon className="h-4 w-4" />
                <span className="text-xs hidden sm:inline">Extrair</span>
              </Button>
            )}
            

            
            {/* Botão de editar */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 text-blue-500"
              title="Editar"
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit(freebet);
              }}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            
            {/* Botão de excluir */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 text-red-500"
              title="Excluir"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(freebet.id);
              }}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {expandedFreebet === freebet.id && (
          <div className="px-4 pb-3 pt-1 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="py-1">
                <span className="text-muted-foreground block sm:inline">Data de registro:</span>
                <p className="font-medium sm:inline sm:ml-2">{new Date(freebet.data).toLocaleDateString()}</p>
              </div>
              <div className="py-1">
                <span className="text-muted-foreground block sm:inline">Data de expiração:</span>
                <p className="font-medium sm:inline sm:ml-2">{freebet.dataExpiracao ? new Date(freebet.dataExpiracao).toLocaleDateString() : "Não definida"}</p>
              </div>
              <div className="py-1">
                <span className="text-muted-foreground block sm:inline">Status:</span>
                <p className="font-medium sm:inline sm:ml-2">{
                  isExpired(freebet) 
                    ? "Expirada" 
                    : (freebet.extraida 
                      ? `Extraída (${formatCurrency(freebet.valorExtraido || 0)})` 
                      : (freebet.utilizada ? "Utilizada" : "Disponível"))
                }</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderiza um placeholder quando não há freebets
  const renderEmptyState = (message: string) => (
    <div className="text-center py-8 text-gray-500">
      <p>{message}</p>
    </div>
  );

  // Renderizar o modal de extração
  const renderExtracaoModal = (freebet: Freebet | undefined) => {
    if (!freebet) return null;
    
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Registrar Extração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Casa:</span> {freebet.casa}
              </p>
              <p className="text-sm">
                <span className="font-medium">Valor da Freebet:</span> {formatCurrency(freebet.valor)}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="valorExtraido" className="text-sm font-medium">
                Qual foi o valor extraído?
              </label>
              <Input
                id="valorExtraido"
                type="number"
                min="0.01"
                step="0.01"
                value={valorExtraido}
                onChange={(e) => setValorExtraido(e.target.value)}
                placeholder="Valor em R$"
                className="w-full"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline"
                onClick={handleCancelExtracao}
              >
                Cancelar
              </Button>
              <Button
                variant="outline"
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                onClick={handleIrCalculadora}
              >
                <CalculatorIcon className="h-4 w-4 mr-1" /> Calcular Agora
              </Button>
              <Button 
                className="bg-fedora-blue hover:bg-fedora-blue/90"
                onClick={() => handleRegistrarExtracao(freebet)}
              >
                Registrar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  // Renderizar o modal de edição
  const renderEditModal = (freebet: Freebet | undefined) => {
    if (!freebet) return null;
    
    // Formatar data para o input date
    const formatDate = (dateString: string | undefined) => {
      if (!dateString) return "";
      return new Date(dateString).toISOString().split('T')[0];
    };
    
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Editar Freebet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="casa" className="text-sm font-medium">
                Casa de Apostas
              </label>
              <Input
                id="casa"
                value={editValues.casa}
                onChange={(e) => setEditValues({...editValues, casa: e.target.value})}
                placeholder="Nome da casa de apostas"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label htmlFor="oddMinima" className="text-sm font-medium">
                  Odd Mínima
                </label>
                <Input
                  id="oddMinima"
                  type="number"
                  min="1"
                  step="0.01"
                  value={editValues.oddMinima || ""}
                  onChange={(e) => setEditValues({...editValues, oddMinima: parseFloat(e.target.value) || 0})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="valor" className="text-sm font-medium">
                  Valor (R$)
                </label>
                <Input
                  id="valor"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editValues.valor || ""}
                  onChange={(e) => setEditValues({...editValues, valor: parseFloat(e.target.value) || 0})}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label htmlFor="situacao" className="text-sm font-medium">
                  Situação
                </label>
                <Input
                  id="situacao"
                  value={editValues.situacao}
                  onChange={(e) => setEditValues({...editValues, situacao: e.target.value})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="dataExpiracao" className="text-sm font-medium">
                  Data de Expiração
                </label>
                <Input
                  id="dataExpiracao"
                  type="date"
                  value={formatDate(editValues.dataExpiracao)}
                  onChange={(e) => setEditValues({...editValues, dataExpiracao: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-fedora-blue hover:bg-fedora-blue/90"
                onClick={() => handleSaveEdit(freebet)}
              >
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (localFreebets.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma freebet registrada.</p>
            <p className="text-sm mt-1">Adicione uma nova freebet usando o formulário acima.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Modal de Extração */}
      {extracaoMode && renderExtracaoModal(localFreebets.find(fb => fb.id === extracaoMode))}
      
      {/* Modal de Edição */}
      {editMode && renderEditModal(localFreebets.find(fb => fb.id === editMode))}
      
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Freebets Registradas</CardTitle>
            <span className="text-sm font-normal text-muted-foreground">
              {localFreebets.length} {localFreebets.length === 1 ? "item" : "itens"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ativas" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-100 dark:bg-gray-800/50 p-1 mb-4 w-full grid grid-cols-3 overflow-x-auto text-xs sm:text-sm">
              <TabsTrigger 
                value="ativas"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
              >
                Ativas ({activeFreebets.length})
              </TabsTrigger>
              <TabsTrigger 
                value="extraidas"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
              >
                Extraídas ({extractedFreebets.length})
              </TabsTrigger>
              <TabsTrigger 
                value="expiradas"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
              >
                Expiradas ({expiredFreebets.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ativas" className="space-y-4">
              <div className="overflow-hidden">
                {sortedActiveFreebets.length > 0 
                  ? sortedActiveFreebets.map(renderFreebet)
                  : renderEmptyState("Nenhuma freebet ativa.")}
              </div>
            </TabsContent>

            <TabsContent value="extraidas" className="space-y-4">
              <div className="overflow-hidden">
                {sortedExtractedFreebets.length > 0 
                  ? sortedExtractedFreebets.map(renderFreebet)
                  : renderEmptyState("Nenhuma freebet extraída.")}
              </div>
            </TabsContent>

            <TabsContent value="expiradas" className="space-y-4">
              <div className="overflow-hidden">
                {sortedExpiredFreebets.length > 0 
                  ? sortedExpiredFreebets.map(renderFreebet)
                  : renderEmptyState("Nenhuma freebet expirada.")}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}