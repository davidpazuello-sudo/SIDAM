import React from 'react';
import { Map, MapPin, Layers, Info } from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';

const MOCK_GEO_DATA = [
  { x: 10, y: 20, value: 150000, name: 'Centro', rating: 'A' },
  { x: 40, y: 50, value: 85000, name: 'Adrianópolis', rating: 'A' },
  { x: 70, y: 30, value: 25000, name: 'Zona Leste', rating: 'C' },
  { x: 20, y: 80, value: 12000, name: 'Tarumã', rating: 'D' },
  { x: 60, y: 70, value: 200000, name: 'Ponta Negra', rating: 'B' },
  { x: 80, y: 10, value: 5000, name: 'Distrito Industrial', rating: 'C' },
];

const COLORS: Record<string, string> = {
  'A': '#10b981',
  'B': '#3b82f6',
  'C': '#f59e0b',
  'D': '#ef4444',
};

export const DebtHeatmap: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-800">Mapa Estratégico da Dívida</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
            <Layers className="w-3 h-3" />
            Camadas: Heatmap
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <div className="flex-1 bg-slate-900 rounded-lg relative overflow-hidden mb-4 border border-slate-800 shadow-inner">
          {/* Grid de fundo simulando mapa */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
              <XAxis type="number" dataKey="x" hide />
              <YAxis type="number" dataKey="y" hide />
              <ZAxis type="number" dataKey="value" range={[100, 1000]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-white">
                        <p className="text-xs font-bold mb-1">{data.name}</p>
                        <p className="text-[10px] text-slate-400">Volume: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.value)}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Rating: {data.rating}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Debt" data={MOCK_GEO_DATA}>
                {MOCK_GEO_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.rating]} fillOpacity={0.6} stroke={COLORS[entry.rating]} strokeWidth={2} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>

          {/* Legenda Flutuante */}
          <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm border border-slate-700 p-3 rounded-lg text-white space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Legenda de Risco</p>
            <LegendItem color="bg-emerald-500" label="Rating A (Alta Liquidez)" />
            <LegendItem color="bg-blue-500" label="Rating B (Média)" />
            <LegendItem color="bg-amber-500" label="Rating C (Baixa)" />
            <LegendItem color="bg-rose-500" label="Rating D (Crítico)" />
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex gap-3">
          <Info className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-xs text-indigo-900 leading-relaxed">
            <strong>Insight do Inspector Geo:</strong> Identificada concentração de <strong>Rating A</strong> no bairro Ponta Negra. 
            Recomendado envio de remessa para protesto imediato para capturar R$ 200k em liquidez.
          </p>
        </div>
      </div>
    </div>
  );
};

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  );
}
