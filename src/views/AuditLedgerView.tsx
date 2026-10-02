import React, { useState } from 'react';
import { AuditRecord } from '../types/fleet';

interface AuditLedgerViewProps {
  logs: AuditRecord[];
}

export const AuditLedgerView: React.FC<AuditLedgerViewProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (operatorFilter !== 'ALL' && !log.operator.includes(operatorFilter)) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.targetService.toLowerCase().includes(q) ||
        log.pid.toString().includes(q) ||
        log.signatureHash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Operator', 'Action', 'Target Service', 'PID', 'Result', 'Signature Hash', 'Details'];
    const rows = logs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.operator}"`,
      `"${l.action}"`,
      `"${l.targetService}"`,
      l.pid,
      l.result,
      l.signatureHash,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `scyldai-audit-ledger-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b0c9e4] text-[20px]">
              receipt_long
            </span>
            <h2 className="text-[18px] font-semibold text-[#e1e2e8]">
              Immutable Kernel Audit Ledger
            </h2>
          </div>
          <p className="text-[12px] text-[#8d9197] mt-1">
            HMAC-SHA256 cryptographically signed ledger of every in-kernel adjustment, quota modification, and probe invocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-[#272a2e] hover:bg-[#323539] text-[#e1e2e8] text-[12px] font-mono flex items-center gap-1.5 border border-[#43474c] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#aacfb6]">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#1d2024] p-3 rounded-lg border border-[#272a2e]">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-[#8d9197] text-[16px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, target service, PID or hash..."
            className="w-full bg-[#0b0e12] text-[#e1e2e8] font-mono pl-8 pr-4 py-1.5 rounded-lg border border-[#272a2e] text-[12px] focus:outline-none focus:border-[#7a93ac]"
          />
        </div>

        <div className="flex items-center bg-[#0b0e12] p-1 rounded-lg border border-[#272a2e] shrink-0">
          {['ALL', 'Sentinel', 'User', 'System'].map((op) => (
            <button
              key={op}
              onClick={() => setOperatorFilter(op)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                operatorFilter === op
                  ? 'bg-[#7a93ac] text-[#112c41] font-semibold'
                  : 'text-[#c3c7cd] hover:text-[#e1e2e8]'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#1d2024] rounded-lg border border-[#272a2e] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[12px]">
            <thead className="bg-[#0b0e12] text-[#8d9197] text-[10px] uppercase border-b border-[#272a2e]">
              <tr>
                <th className="py-2.5 px-4">Audit ID</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272a2e]/60">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedRecord(log)}
                  className="hover:bg-[#191c20] cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-4 font-semibold text-[#b0c9e4]">{log.id}</td>
                  <td className="py-2.5 px-3 text-[#8d9197]">{log.timestamp}</td>
                  <td className="py-2.5 px-3 text-[#e1e2e8]">{log.operator}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#e1e2e8]">{log.action}</td>
                  <td className="py-2.5 px-3 text-[#c3c7cd]">{log.targetService}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        log.result === 'SUCCESS' || log.result === 'MITIGATED'
                          ? 'bg-[#aacfb6]/15 text-[#aacfb6]'
                          : 'bg-[#ffb4ab]/15 text-[#ffb4ab]'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right text-[11px] text-[#8d9197]">
                    <span className="text-[#aacfb6]">✓ Valid Hash</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#191c20] border border-[#272a2e] rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#272a2e]">
              <div>
                <span className="font-mono text-[11px] text-[#b0c9e4]">{selectedRecord.id}</span>
                <h3 className="font-semibold text-[16px] text-[#e1e2e8]">{selectedRecord.action}</h3>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="text-[#8d9197] hover:text-[#e1e2e8]">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-[12px]">
              <div>
                <span className="text-[#8d9197] block text-[10px] uppercase">Timestamp</span>
                <span className="font-mono text-[#e1e2e8]">{selectedRecord.timestamp}</span>
              </div>
              <div>
                <span className="text-[#8d9197] block text-[10px] uppercase">Operator Identity</span>
                <span className="font-mono text-[#e1e2e8]">{selectedRecord.operator}</span>
              </div>
              <div>
                <span className="text-[#8d9197] block text-[10px] uppercase">Action Details</span>
                <p className="bg-[#0b0e12] p-2.5 rounded border border-[#272a2e] text-[#c3c7cd] mt-0.5">
                  {selectedRecord.details}
                </p>
              </div>
              <div>
                <span className="text-[#8d9197] block text-[10px] uppercase">SHA-256 HMAC Signature</span>
                <span className="font-mono text-[11px] text-[#aacfb6] break-all bg-[#0b0e12] p-2 rounded block border border-[#272a2e] mt-0.5">
                  {selectedRecord.signatureHash}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-[#272a2e] text-[#e1e2e8] text-[12px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
