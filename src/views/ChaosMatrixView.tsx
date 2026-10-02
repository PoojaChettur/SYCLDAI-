import React, { useState } from 'react';
import { Microservice } from '../types/fleet';

interface ChaosMatrixViewProps {
  services: Microservice[];
  onNavigateToFaults: () => void;
}

export const ChaosMatrixView: React.FC<ChaosMatrixViewProps> = ({
  services,
  onNavigateToFaults,
}) => {
  const [selectedCell, setSelectedCell] = useState<{ service: string; vector: string; score: number } | null>(null);

  const vectors = [
    'cgroup CFS Throttle',
    'OOM Memory Spike',
    'Packet Drop 40%',
    'Zombie PID Leak',
    'Deadlock Spinlock',
  ];

  // Deterministic high resilience scores
  const getScore = (serviceIndex: number, vectorIndex: number) => {
    const base = 96 + ((serviceIndex * 3 + vectorIndex * 7) % 5);
    return Math.min(100, base);
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold text-[#e1e2e8]">Chaos Resilience Matrix</h2>
          <p className="text-[12px] text-[#8d9197] mt-1">
            Pass/Fail scorecard across all 14 containerized microservices and automated failure vectors.
          </p>
        </div>
        <button
          onClick={onNavigateToFaults}
          className="px-3.5 py-1.5 rounded-lg bg-[#7a93ac] text-[#112c41] font-semibold text-[12px] hover:bg-[#b0c9e4] transition-colors"
        >
          Run Chaos Experiment →
        </button>
      </div>

      {/* Matrix Table */}
      <div className="bg-[#1d2024] rounded-lg border border-[#272a2e] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[12px]">
            <thead className="bg-[#0b0e12] border-b border-[#272a2e] text-[#8d9197] text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Service</th>
                {vectors.map((v) => (
                  <th key={v} className="py-3 px-3 text-center">{v}</th>
                ))}
                <th className="py-3 px-4 text-right">Composite Resilience</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272a2e]/60">
              {services.map((service, sIdx) => {
                let total = 0;
                return (
                  <tr key={service.id} className="hover:bg-[#191c20] transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-[#e1e2e8]">
                      {service.name}
                    </td>
                    {vectors.map((vec, vIdx) => {
                      const score = getScore(sIdx, vIdx);
                      total += score;
                      return (
                        <td
                          key={vec}
                          onClick={() => setSelectedCell({ service: service.name, vector: vec, score })}
                          className="py-2.5 px-3 text-center cursor-pointer group"
                        >
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-[#aacfb6]/15 text-[#aacfb6] border border-[#aacfb6]/30 group-hover:scale-110 transition-transform">
                            {score}%
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-4 text-right font-semibold text-[#aacfb6]">
                      {(total / vectors.length).toFixed(1)}% PASS
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCell && (
        <div className="p-4 bg-[#1d2024] rounded-lg border border-[#7a93ac]/40 flex items-center justify-between">
          <div className="text-[12px]">
            <span className="text-[#8d9197]">Vector Test Detail: </span>
            <span className="font-semibold text-[#e1e2e8]">{selectedCell.service}</span> under{' '}
            <span className="text-[#b0c9e4] font-mono">{selectedCell.vector}</span>
            <div className="text-[11px] text-[#aacfb6] mt-0.5">
              Result: {selectedCell.score}% Resilience Score · Sub-second eBPF mitigation validated · 0 cascaded panics
            </div>
          </div>
          <button
            onClick={() => setSelectedCell(null)}
            className="text-[#8d9197] hover:text-[#e1e2e8] text-[12px] font-mono px-2 py-1 rounded bg-[#0b0e12]"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
