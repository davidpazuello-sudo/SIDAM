import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware para JSON
  app.use(express.json());

  // 1. API ROUTES (Prioridade)
  // -----------------------------------------------------------------------------
  
  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", engine: "MetaGov v1.0", timestamp: new Date().toISOString() });
  });

  /**
   * WEBHOOK PIX (ARRECADAÇÃO)
   * Descrição: Recebe notificações de pagamento do PSP (Bancos).
   * Segurança: Em produção, validar o IP do banco e o Token de Autenticação.
   */
  app.post("/api/webhooks/pix", (req, res) => {
    const { txid, status, valor, pago_em } = req.body;

    console.log(`[PIX WEBHOOK] Recebido evento para TXID: ${txid} | Status: ${status}`);

    // Lógica de Negócio:
    // 1. Validar se o TXID existe no banco (rev_pix_payments)
    // 2. Se status for 'CONCLUIDO', disparar baixa automática da dívida
    // 3. Registrar no log de auditoria (sys_integration_logs)
    // 4. Notificar via WebSocket (opcional)

    if (status === 'CONCLUIDO') {
      // Simulação de baixa automática
      console.log(`[PIX WEBHOOK] Baixa automática processada para o valor de R$ ${valor}`);
      
      // Aqui entraria a chamada para o serviço de arrecadação
      // await revenueService.processPayment(txid, valor);
    }

    // Responder ao Banco com 200 OK (Obrigatório para não reprocessar)
    res.status(200).json({ status: "received", txid });
  });

  /**
   * TJAM BATCH FILING (AJUIZAMENTO EM LOTE)
   * Descrição: Simula o envio de CDAs para o Tribunal de Justiça.
   * Protocolo: MNI (Modelo Nacional de Interoperabilidade).
   */
  app.post("/api/integrations/tjam/batch-file", (req, res) => {
    const { batch_id, cdas } = req.body;

    console.log(`[TJAM INTEGRATION] Iniciando ajuizamento em lote: ${batch_id}`);
    console.log(`[TJAM INTEGRATION] Processando ${cdas?.length || 0} CDAs...`);

    // Lógica de Negócio:
    // 1. Criar registro do lote (jud_filing_batches)
    // 2. Para cada CDA, gerar petição inicial (PDF) e enviar via MNI
    // 3. Receber número do processo ou protocolo
    // 4. Atualizar status na jud_processes

    const results = (cdas || []).map((cda: any) => ({
      cda_id: cda.id,
      process_number: `000${Math.floor(Math.random() * 999999)}-${Math.floor(Math.random() * 99)}.2026.8.04.0001`,
      status: 'AJUIZADO',
      protocol: `PROT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }));

    res.status(200).json({ 
      status: "success", 
      batch_id, 
      processed_count: results.length,
      results 
    });
  });

  /**
   * BRANDING & CUSTOMIZATION
   * Descrição: Gerencia a identidade visual da prefeitura.
   */
  let currentBranding = {
    municipality_name: "Prefeitura de Manaus",
    municipality_logo_url: "", // Se vazio, usa o ícone padrão
    primary_color: "#4f46e5",
    secondary_color: "#1e293b",
    welcome_message: "Bem-vindo ao SIDAM"
  };

  app.get("/api/branding", (req, res) => {
    res.json(currentBranding);
  });

  app.post("/api/branding", (req, res) => {
    currentBranding = { ...currentBranding, ...req.body };
    console.log(`[BRANDING] Identidade visual atualizada para: ${currentBranding.municipality_name}`);
    res.json({ status: "success", branding: currentBranding });
  });

  // 2. VITE MIDDLEWARE (Desenvolvimento vs Produção)
  // -----------------------------------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 MetaGov Server running on http://localhost:${PORT}`);
    console.log(`📡 PIX Webhook active at: /api/webhooks/pix`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
