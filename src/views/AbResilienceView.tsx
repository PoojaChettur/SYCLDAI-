import React from 'react';

export const AbResilienceView: React.FC = () => {
  const metrics = [
    {
      label: 'Mean Time To Recover (MTTR)',
      vanilla: '184.2 Seconds',
      sentinel: '2.8 Seconds',
      delta: '98.5% Faster',
      win: true,
    },
    {
      label: 'Cascading Outage Probability',
      vanilla: '14.2%',
      sentinel: '0.0%',
      delta: 'Zero Cascades',
      win: true,
    },
    {
      label: 'P99 Latency During CFS Throttle',
      vanilla: '3,840 ms',
      sentinel: '14.2 ms',
      delta: '99.6% Reduction',
      win: true,
    },
    {
      label: 'OOM Killer Kill Events / Month',
      vanilla: '28 Pod Kills',
      sentinel: '0 Pod Kills',
      delta: 'Slab Reclaim Active',
      win: true,
    },
    {
      label: 'On-Call Pager Alerts / Week',
      vanilla: '34 Pages',
      sentinel: '0 Escalations',
      delta: '100% Autonomous',
      win: true,
    },
  ];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e]">
        <h2 className="text-[18px] font-semibold text-[#e1e2e8]">
          A/B Resilience Benchmark — Vanilla Kernel vs ScyldAI Sentinel
        </h2>
        <p className="text-[12px] text-[#8d9197] mt-1">
          Rigorous head-to-head evaluation under 100,000 synthetic requests/second and forced chaos injections.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vanilla Kernel Card */}
        <div className="bg-[#1d2024] rounded-lg p-6 border border-[#272a2e] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8d9197]"></span>
              <h3 className="font-semibold text-[15px] text-[#e1e2e8]">
                Standard Vanilla Linux Kernel (K8s Defaults)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#8d9197]">Vanilla Control</span>
          </div>

          <div className="space-y-3 font-mono text-[12px]">
            <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e]">
              <span className="text-[#8d9197] text-[10px] uppercase block">Recovery Mechanism</span>
              <span className="text-[#e1e2e8] mt-1 block">
                Reactive Pod Restart · CrashLoopBackOff · DNS Cache Invalidation
              </span>
            </div>
            <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e]">
              <span className="text-[#8d9197] text-[10px] uppercase block">cgroup Throttle Reaction</span>
              <span className="text-[#ffb4ab] mt-1 block">
                Hard CFS periods frozen · Client timeouts · Thread starvation
              </span>
            </div>
          </div>
        </div>

        {/* ScyldAI Sentinel Card */}
        <div className="bg-[#1d2024] rounded-lg p-6 border border-[#7a93ac] space-y-4 ring-1 ring-[#7a93ac]/30">
          <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#aacfb6] animate-pulse"></span>
              <h3 className="font-semibold text-[15px] text-[#e1e2e8]">
                ScyldAI Sentinel eBPF Control Plane
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#aacfb6] bg-[#aacfb6]/15 px-2 py-0.5 rounded">
              Sentinel Active
            </span>
          </div>

          <div className="space-y-3 font-mono text-[12px]">
            <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e]">
              <span className="text-[#8d9197] text-[10px] uppercase block">Recovery Mechanism</span>
              <span className="text-[#aacfb6] mt-1 block">
                In-Kernel Sub-second Memory Drain · Zero Pod Restarts · CO-RE Relocations
              </span>
            </div>
            <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e]">
              <span className="text-[#8d9197] text-[10px] uppercase block">cgroup Throttle Reaction</span>
              <span className="text-[#b0c9e4] mt-1 block">
                Proactive TC token bucket pacing · Spinlock avoidance · 0% drop
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side Metrics Table */}
      <div className="bg-[#1d2024] rounded-lg border border-[#272a2e] overflow-hidden">
        <table className="w-full text-left font-mono text-[12px]">
          <thead className="bg-[#0b0e12] text-[#8d9197] text-[10px] uppercase border-b border-[#272a2e]">
            <tr>
              <th className="py-3 px-4">Resilience Metric</th>
              <th className="py-3 px-4">Standard Vanilla Linux</th>
              <th className="py-3 px-4">ScyldAI eBPF Sentinel</th>
              <th className="py-3 px-4 text-right">Advantage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272a2e]/60">
            {metrics.map((m) => (
              <tr key={m.label} className="hover:bg-[#191c20]">
                <td className="py-3 px-4 font-semibold text-[#e1e2e8]">{m.label}</td>
                <td className="py-3 px-4 text-[#ffb4ab]">{m.vanilla}</td>
                <td className="py-3 px-4 text-[#aacfb6] font-semibold">{m.sentinel}</td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded text-[11px] bg-[#aacfb6]/15 text-[#aacfb6]">
                    {m.delta}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
