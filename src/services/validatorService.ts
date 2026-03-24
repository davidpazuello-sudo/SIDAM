/**
 * SIDAM Validator Service (GIGO Filter)
 * Objetivo: Sanitizar dados antes da entrada no sistema.
 */
export const validatorService = {
  /**
   * Valida algoritmo de CPF ou CNPJ
   */
  validateDocument(doc: string): boolean {
    const cleanDoc = doc.replace(/[^\d]+/g, '');
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) return false;
    
    // Bloqueia sequências óbvias
    if (/^(\d)\1+$/.test(cleanDoc)) return false;
    
    return true; // Em produção, aplicar algoritmo completo de dígitos verificadores
  },

  /**
   * Simula consulta à Receita Federal para higienização
   */
  async sanitizeData(doc: string): Promise<{ valid: boolean; name?: string; error?: string }> {
    if (!this.validateDocument(doc)) {
      return { valid: false, error: "Documento com formato inválido." };
    }

    // Simulação de delay de rede para API externa
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      valid: true,
      name: doc.length === 11 ? "CONTRIBUINTE PESSOA FÍSICA" : "EMPRESA EXECUTADA LTDA"
    };
  }
};
