import React, { useState } from 'react';
import { IncidentGate } from '../types/fleet';

interface IncidentsViewProps {
  incidents: IncidentGate[];
  onUpdateIncidentStatus: (id: string, status: IncidentGate['status']) => void;
  onNavigateToFleet: (serviceId: string) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onUpdateIncidentStatus,
  onNavigateToFleet,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<IncidentGate | null>(null);

  const filtered = incidents.filter((inc) => {
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-semibold text-[#e1e2e8]">
              Sentinel Incidents & Policy Gates
            </h2>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#323539] text-[#b0c9e4]">
              {incidents.length} Records
            </span>
          </div>
          <p className="text-[12px] text-[#8d9197] mt-1">
            Real-time eBPF mitigation decisions, approval gates, and autonomous rollback triggers.
          </p>
        </div>

        {/* Severity Filter Buttons */}
        <div className="flex items-center bg-[#0b0e12] p-1 rounded-lg border border-[#272a2e]">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                filterSeverity === sev
                  ? 'bg-[#7a93ac] text-[#112c41] font-semibold'
                  : 'text-[#c3c7cd] hover:text-[#e1e2e8]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List Cards */}
      <div className="space-y-3">
        {filtered.map((inc) => {
          let badgeStyle = 'bg-[#b0c9e4]/20 text-[#b0c9e4]';
          if (inc.severity === 'CRITICAL') badgeStyle = 'bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/30';
          if (inc.severity === 'HIGH') badgeStyle = 'bg-[#C9A66B]/20 text-[#C9A66B] border border-[#C9A66B]/30';

          return (
            <div
              key={inc.id}
              className="bg-[#1d2024] rounded-lg p-5 border border-[#272a2e] hover:border-[#43474c] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${badgeStyle}`}>
                    {inc.severity}
                  </span>
                  <span className="font-mono text-[11px] text-[#8d9197]">{inc.id}</span>
                  <span className="text-[#8d9197]">·</span>
                  <button
                    onClick={() => onNavigateToFleet(inc.serviceId)}
                    className="font-mono text-[12px] text-[#b0c9e4] hover:underline"
                  >
                    {inc.serviceName}
                  </button>
                  <span className="text-[#8d9197]">·</span>
                  <span className="text-[11px] font-mono text-[#8d9197]">{inc.detectedAt}</span>
                </div>

                <h3 className="text-[15px] font-medium text-[#e1e2e8]">{inc.title}</h3>
                <p className="text-[12px] text-[#8d9197]">{inc.description}</p>

                <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-[#aacfb6]">
                  <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                  <span>{inc.ebpfActionTaken}</span>
                </div>
              </div>

              {/* Status & Gates Action */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-[#8d9197]">Gate Status</div>
                  <span
                    className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                      inc.status === 'AUTO_MITIGATED'
                        ? 'bg-[#aacfb6]/20 text-[#aacfb6]'
                        : inc.status === 'APPROVED'
                        ? 'bg-[#7a93ac]/20 text-[#b0c9e4]'
                        : inc.status === 'PENDING_GATE'
                        ? 'bg-[#C9A66B]/20 text-[#C9A66B] animate-pulse'
                        : 'bg-[#ffb4ab]/20 text-[#ffb4ab]'
                    }`}
                  >
                    {inc.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedIncident(inc)}
                    className="px-3 py-1.5 rounded-lg bg-[#272a2e] hover:bg-[#323539] text-[#e1e2e8] text-[12px] font-medium transition-colors border border-[#43474c]"
                  >
                    Details
                  </button>

                  {inc.status === 'PENDING_GATE' && (
                    <>
                      <button
                        onClick={() => onUpdateIncidentStatus(inc.id, 'APPROVED')}
                        className="px-3 py-1.5 rounded-lg bg-[#7a93ac] text-[#112c41] hover:bg-[#b0c9e4] text-[12px] font-semibold transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onUpdateIncidentStatus(inc.id, 'REJECTED')}
                        className="px-3 py-1.5 rounded-lg bg-[#272a2e] text-[#ffb4ab] hover:bg-[#ffb4ab]/20 text-[12px] font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Incident Details Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#191c20] border border-[#272a2e] rounded-xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
              <div>
                <span className="text-[11px] font-mono text-[#b0c9e4]">{selectedIncident.id}</span>
                <h3 className="text-[16px] font-semibold text-[#e1e2e8]">{selectedIncident.title}</h3>
              </div>
              <button onClick={() => setSelectedIncident(null)} className="text-[#8d9197] hover:text-[#e1e2e8]">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-[12px]">
              <div>
                <span className="text-[#8d9197] block uppercase text-[10px]">Impacted Service</span>
                <span className="font-mono text-[#e1e2e8] text-[13px] font-medium">
                  {selectedIncident.serviceName}
                </span>
              </div>
              <div>
                <span className="text-[#8d9197] block uppercase text-[10px]">Root Cause Analysis</span>
                <p className="text-[#c3c7cd] bg-[#0b0e12] p-2.5 rounded border border-[#272a2e] mt-1">
                  {selectedIncident.rootCause}
                </p>
              </div>
              <div>
                <span className="text-[#8d9197] block uppercase text-[10px]">Autonomous eBPF Remediation</span>
                <p className="text-[#aacfb6] bg-[#0b0e12] p-2.5 rounded border border-[#272a2e] mt-1 font-mono">
                  {selectedIncident.ebpfActionTaken}
                </p>
              </div>
              <div>
                <span className="text-[#8d9197] block uppercase text-[10px]">Permanent Architecture Fix</span>
                <p className="text-[#b0c9e4] bg-[#0b0e12] p-2.5 rounded border border-[#272a2e] mt-1">
                  {selectedIncident.ebpfProposedFix}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-2 rounded-lg bg-[#272a2e] text-[#e1e2e8] text-[12px]"
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
