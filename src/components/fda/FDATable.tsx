import React from 'react';
import { useFDAList } from '../../hooks/useFDAList';

const STATUS_BADGE: Record<string, string> = {
  ATIVA: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  SUSPENSA: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  EXTINTA: 'bg-green-500/20 text-green-300 border-green-500/30',
  AJUIZADA: 'bg-red-500/20 text-red-300 border-red-500/30',
  PARCELADA: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  CANCELADA: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

export default function FDATable({ organizationId }: { organizationId: string }) {
  const { data, total, page, isLoading, error, changePage, applyFilter } = useFDAList({
    organizationId,
    pageSize: 20,
  });
  const rows = data as Array<Record<string, any>>;

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
        Erro ao carregar FDAs: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar por devedor..."
          onChange={(e) => applyFilter({ devedorNome: e.target.value || undefined })}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
        <select
          onChange={(e) => applyFilter({ status: e.target.value || undefined })}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os status</option>
          {Object.keys(STATUS_BADGE).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm text-gray-300">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nº Inscrição</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Devedor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Documento</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Valor Principal</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Inscrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-700 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.length === 0
                ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        Nenhuma FDA encontrada
                      </td>
                    </tr>
                  )
                : rows.map((fda) => (
                    <tr key={String(fda.id)} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-blue-400">{String(fda.numero_inscricao ?? '-')}</td>
                      <td className="px-4 py-3 font-medium">{String(fda.devedor_nome ?? '-')}</td>
                      <td className="px-4 py-3 font-mono text-xs">{String(fda.documento_devedor ?? '-')}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-400">
                        {Number(fda.valor_principal_inscrito).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full border text-xs font-medium ${STATUS_BADGE[String(fda.status_atual)] ?? 'bg-gray-700 text-gray-300'}`}
                        >
                          {String(fda.status_atual ?? '-')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(String(fda.created_at)).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>

      {total > 20 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{total.toLocaleString('pt-BR')} registros no total</span>
          <div className="flex gap-2">
            <button
              onClick={() => changePage(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 disabled:opacity-40 hover:border-gray-600 transition-colors"
            >
              ← Anterior
            </button>
            <span className="px-3 py-1">Página {page}</span>
            <button
              onClick={() => changePage(page + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1 rounded-lg bg-gray-800 border border-gray-700 disabled:opacity-40 hover:border-gray-600 transition-colors"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
