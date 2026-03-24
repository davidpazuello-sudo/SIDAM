import React from 'react';
import { Link, ShieldCheck, Clock, Database, Lock } from 'lucide-react';

interface Block {
  sequence: number;
  hash: string;
  prevHash: string;
  timestamp: string;
  event: string;
}

const MOCK_BLOCKS: Block[] = [
  { sequence: 3, hash: '8f3a...b2e1', prevHash: '4d2c...a9f0', timestamp: '24/03/2026 10:15', event: 'BAIXA_PAGAMENTO_PIX' },
  { sequence: 2, hash: '4d2c...a9f0', prevHash: '1a2b...3c4d', timestamp: '24/03/2026 09:30', event: 'EMISSAO_CDA_OFICIAL' },
  { sequence: 1, hash: '1a2b...3c4d', prevHash: 'GENESIS', timestamp: '24/03/2026 08:00', event: 'INSCRICAO_DIVIDA_ATIVA' },
];

export const BlockchainViewer: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800">Ledger de Blockchain Fiscal</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase tracking-tighter">
          <ShieldCheck className="w-3 h-3" />
          Corrente Íntegra
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6 relative">
          {/* Linha conectora */}
          <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

          {MOCK_BLOCKS.map((block) => (
            <div key={block.sequence} className="relative flex gap-6 group">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5 text-indigo-600" />
              </div>
              
              <div className="flex-1 bg-slate-50 rounded-lg p-4 border border-slate-100 hover:border-indigo-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Bloco #{block.sequence}</span>
                  <div className="flex items-center gap-1 text-slate-400 text-[10px]">
                    <Clock className="w-3 h-3" />
                    {block.timestamp}
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-700 mb-3">{block.event}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Hash Atual</p>
                    <code className="text-[10px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 block truncate font-mono">
                      {block.hash}
                    </code>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Hash Anterior</p>
                    <code className="text-[10px] bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 block truncate font-mono">
                      {block.prevHash}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
