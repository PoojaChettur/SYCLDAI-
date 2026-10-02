import React from 'react';
import { Microservice, IncidentGate } from '../types/fleet';

interface ControlRoomViewProps {
  services: Microservice[];
  incidents: IncidentGate[];
  onNavigateToFleet: (serviceId?: string) => void;
  onNavigateToIncidents: () => void;
  onNavigateToFaults: () => void;
}

export const ControlRoomView: React.FC<ControlRoomViewProps> = ({
  services,
  incidents,
  onNavigateToFleet,
  onNavigateToIncidents,
  onNavigateToFaults,
}) => {
  const healthyCount = services.filter((s) => s.health >= 99).length;

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Hero Overview Banner */}
      <div className="bg-[#1d2024] p-6 rounded-lg border border-[#272a2e] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#aacfb6] animate-pulse"></span>
            <h1 className="text-[20px] font-semibold text-[#e1e2e8]">
              Sentinel Autonomous Control Center
            </h1>
            <span className="font-mono text-[11px] bg-[#0b0e12] px-2 py-0.5 rounded text-[#aacfb6] border border-[#272a2e]">
              ACTIVE CO-RE ENGINE
            </span>
          </div>
          <p className="text-[13px] text-[#8d9197] mt-1 max-w-2xl">
            Autonomous kernel-level AI self-healing agent protecting 14 containerized microservices across 42 Kubernetes worker nodes. Real-time eBPF anomaly detection, sub-second micro-recovery, and zero-cascade infrastructure resilience.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToFleet()}
            className="px-4 py-2 rounded-lg bg-[#7a93ac] text-[#112c41] hover:bg-[#b0c9e4] text-[13px] font-semibold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">radar</span>
            <span>Open Fleet Radar</span>
          </button>
          <button
            onClick={onNavigateToFaults}
            className="px-4 py-2 rounded-lg bg-[#272a2e] text-[#e1e2e8] hover:bg-[#323539] text-[13px] font-medium transition-all border border-[#43474c] flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px] text-[#C9A66B]">bolt</span>
            <span>Inject Chaos Fault</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e]">
          <div className="flex justify-between items-center text-[#8d9197] text-[11px] uppercase tracking-wider">
            <span>Cluster Microservices</span>
            <span className="text-[#aacfb6] font-mono">100% ONLINE</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-mono text-[28px] font-semibold text-[#e1e2e8]">
              {healthyCount}
            </span>
            <span className="text-[13px] text-[#8d9197]">/ {services.length} nominal</span>
          </div>
          <p className="text-[11px] text-[#8d9197]">
            Zero unhandled kernel panics or cgroup thrashing in 30 days.
          </p>
        </div>

        <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e]">
          <div className="flex justify-between items-center text-[#8d9197] text-[11px] uppercase tracking-wider">
            <span>Mean Time to Recover (MTTR)</span>
            <span className="text-[#b0c9e4] font-mono">SUB-SECOND</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-mono text-[28px] font-semibold text-[#b0c9e4]">
              2.8s
            </span>
            <span className="text-[13px] text-[#8d9197]">avg remediation</span>
          </div>
          <p className="text-[11px] text-[#8d9197]">
            Compared to 184s standard manual on-call Kubernetes restart.
          </p>
        </div>

        <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e]">
          <div className="flex justify-between items-center text-[#8d9197] text-[11px] uppercase tracking-wider">
            <span>Autonomous Actions (30d)</span>
            <span className="text-[#aacfb6] font-mono">100% MITIGATED</span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-mono text-[28px] font-semibold text-[#aacfb6]">
              412
            </span>
            <span className="text-[13px] text-[#8d9197]">prevented outages</span>
          </div>
          <p className="text-[11px] text-[#8d9197]">
            Estimated $84,200 monthly downtime losses eliminated.
          </p>
        </div>
      </div>

      {/* Incident & Activity Split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active Incident Gates */}
        <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e]">
          <div className="flex items-center justify-between pb-3 border-b border-[#272a2e] mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#C9A66B] text-[18px]">
                shield_alert
              </span>
              <h3 className="font-semibold text-[14px] text-[#e1e2e8]">
                Recent Sentinel Incidents & Mitigations
              </h3>
            </div>
            <button
              onClick={onNavigateToIncidents}
              className="text-[12px] font-mono text-[#b0c9e4] hover:underline"
            >
              View All Gates →
            </button>
          </div>

          <div className="space-y-3">
            {incidents.slice(0, 3).map((inc) => (
              <div
                key={inc.id}
                className="p-3 bg-[#0b0e12] rounded-lg border border-[#272a2e] flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-[#ffb4ab]/20 text-[#ffb4ab]'
                          : inc.severity === 'HIGH'
                          ? 'bg-[#C9A66B]/20 text-[#C9A66B]'
                          : 'bg-[#b0c9e4]/20 text-[#b0c9e4]'
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="font-medium text-[13px] text-[#e1e2e8]">{inc.title}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8d9197]">{inc.detectedAt}</span>
                </div>
                <p className="text-[12px] text-[#8d9197]">{inc.description}</p>
                <div className="mt-1 text-[11px] font-mono text-[#aacfb6] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                  <span>{inc.ebpfActionTaken}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Microservice Health Radar Preview */}
        <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#b0c9e4] text-[18px]">hub</span>
              <h3 className="font-semibold text-[14px] text-[#e1e2e8]">
                Fleet Health Grid Preview
              </h3>
            </div>
            <button
              onClick={() => onNavigateToFleet()}
              className="text-[12px] font-mono text-[#b0c9e4] hover:underline"
            >
              Full Fleet View →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4">
            {services.slice(0, 9).map((s) => (
              <div
                key={s.id}
                onClick={() => onNavigateToFleet(s.id)}
                className="p-2.5 bg-[#0b0e12] rounded border border-[#272a2e] hover:border-[#7a93ac] cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[12px] text-[#e1e2e8] truncate">
                    {s.name.split('-')[0]}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      s.status === 'nominal'
                        ? 'bg-[#aacfb6]'
                        : s.status === 'cycling'
                        ? 'bg-[#C9A66B]'
                        : 'bg-[#ffb4ab]'
                    }`}
                  ></span>
                </div>
                <div className="mt-1 text-[10px] font-mono text-[#8d9197]">
                  {s.health}% · {s.cfsQuota}% CFS
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e] text-[11px] font-mono text-[#8d9197] flex items-center justify-between">
            <span>Ring Buffer Telemetry: Nominal</span>
            <span className="text-[#aacfb6]">42 / 42 Nodes Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
