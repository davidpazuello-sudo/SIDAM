import React from 'react';
import { User, QrCode, FileText, Calculator, Trophy, ArrowRight, CheckCircle2 } from 'lucide-react';

export const CitizenPortal: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Olá, João da Silva Sauro</h2>
            <p className="text-slate-500">Seja bem-vindo ao seu Portal de Autoatendimento Fiscal.</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100 mb-1">
            <Trophy size={18} />
            <span className="font-bold">1.250 Milhas Fiscais</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Nível: Contribuinte Prata</p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ActionCard 
          icon={<QrCode className="text-emerald-600" />} 
          title="Pagar com PIX" 
          description="Quitação imediata com 10% de desconto em juros."
          color="emerald"
        />
        <ActionCard 
          icon={<Calculator className="text-indigo-600" />} 
          title="Simular Acordo" 
          description="Parcele seus débitos em até 60x via REFIS Digital."
          color="indigo"
        />
        <ActionCard 
          icon={<FileText className="text-blue-600" />} 
          title="Emitir CND" 
          description="Baixe sua Certidão Negativa de Débitos agora."
          color="blue"
        />
      </div>

      {/* Active Debts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-lg">Meus Débitos Pendentes</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">2 registros encontrados</span>
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-8 py-4">Inscrição</th>
                <th className="px-8 py-4">Natureza</th>
                <th className="px-8 py-4">Vencimento</th>
                <th className="px-8 py-4 text-right">Valor</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <DebtRow id="2024.0001-A" type="IPTU" date="10/01/2024" value="R$ 1.250,00" />
              <DebtRow id="2023.0842-B" type="Multa SEMMAS" date="15/11/2023" value="R$ 450,00" />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function ActionCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed mb-4">{description}</p>
      <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
        Acessar agora <ArrowRight size={14} />
      </div>
    </div>
  );
}

function DebtRow({ id, type, date, value }: { id: string, type: string, date: string, value: string }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-8 py-4 text-sm font-bold text-slate-700">{id}</td>
      <td className="px-8 py-4 text-sm text-slate-600">{type}</td>
      <td className="px-8 py-4 text-sm text-slate-600">{date}</td>
      <td className="px-8 py-4 text-sm font-bold text-slate-800 text-right">{value}</td>
      <td className="px-8 py-4 text-right">
        <button className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all uppercase tracking-widest">
          Pagar PIX
        </button>
      </td>
    </tr>
  );
}
