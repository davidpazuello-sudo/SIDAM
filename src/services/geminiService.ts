import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FDA, Rating } from "../types";

/**
 * SIDAM Gemini Service
 * Orquestrador de Inteligência para os Agentes Manager e Inspector.
 */
export class GeminiService {
  private ai: GoogleGenAI;
  private model: string = "gemini-3.1-pro-preview";

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada no ambiente.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Agente Manager: Processa comandos de workflow e CRUD
   */
  async managerCommand(command: string, context?: any): Promise<string | undefined> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: command,
      config: {
        systemInstruction: `Você é o Agente Manager do SIDAM. 
        Sua função é auxiliar na gestão da Dívida Ativa. 
        Contexto atual: ${JSON.stringify(context || {})}
        Responda de forma técnica e executiva.`,
      },
    });
    return response.text;
  }

  /**
   * Agente Inspector: Realiza análise de risco e rating preditivo
   */
  async analyzeDebt(fda: FDA): Promise<{ rating: Rating; justification: string }> {
    const prompt = `Analise a seguinte Ficha Cadastral (FDA) e atribua um Rating de Recuperabilidade (A, B, C ou D).
    Dados: ${JSON.stringify(fda)}
    
    Critérios:
    A: Alta liquidez, dívida recente, devedor ativo.
    D: Baixa liquidez, dívida próxima da prescrição, devedor insolvente.
    
    Retorne no formato JSON: { "rating": "A|B|C|D", "justification": "texto" }`;

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  }
}

export const geminiService = new GeminiService();
