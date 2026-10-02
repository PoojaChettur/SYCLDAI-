import React from 'react';
import { Microservice, KernelTelemetryLog } from '../types/fleet';

interface ExpandTelemetryModalProps {
  service: Microservice | null;
  isOpen: boolean;
  onClose: () => void;
  logs: KernelTelemetryLog[];
  onTriggerProbe: (serviceId: string) => void;
  isProbing: boolean;
}

export const ExpandTelemetryModal: React.FC<ExpandTelemetryModalProps> = ({
  service,
  isOpen,
  onClose,
  logs,
  onTriggerProbe,
  isProbing,
}) => {
  if (!isOpen || !service) return null;

  const relevantLogs = logs.filter(
    (l) => l.serviceId === service.id || l.serviceId === 'all'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-5xl h-[88vh] bg-[#111417] border border-[#272a2e] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="p-4 bg-[#191c20] border-b border-[#272a2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[#aacfb6]"></span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-semibold text-[#e1e2e8]">
                  {service.name} — Deep Kernel Inspection
                </h2>
                <span className="font-mono text-[11px] bg-[#0b0e12] px-2 py-0.5 rounded text-[#b0c9e4] border border-[#272a2e]">
                  PID {service.pid}
                </span>
                <span className="font-mono text-[11px] text-[#8d9197]">
                  {service.cgroupPath}
                </span>
              </div>
              <p className="text-[12px] text-[#c3c7cd] mt-0.5">
                Linux Kernel 6.5.0-ebpf-sentinel · CO-RE Relocations Verified · Ring-Buffer Channel Active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onTriggerProbe(service.id)}
              disabled={isProbing}
              className="px-3 py-1.5 rounded-lg bg-[#7a93ac]/30 hover:bg-[#7a93ac] text-[#cde5ff] hover:text-[#112c41] text-[12px] font-medium transition-colors flex items-center gap-1.5"
            >
              <span className={`material-symbols-outlined text-[16px] ${isProbing ? 'animate-spin' : ''}`}>
                restart_alt
              </span>
              <span>{isProbing ? 'Probing...' : 'Run Kernel Probe'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#8d9197] hover:text-[#e1e2e8] hover:bg-[#272a2e] rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metric Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#1d2024] p-4 rounded-lg border border-[#272a2e]">
              <span className="text-[11px] font-medium text-[#8d9197] uppercase">cgroup RSS Memory</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-[22px] font-semibold text-[#e1e2e8]">{service.rssMb}</span>
                <span className="font-mono text-[12px] text-[#8d9197]">MB / {service.memoryLimitMb}MB</span>
              </div>
              <div className="mt-2 h-1.5 bg-[#0b0e12] rounded-full overflow-hidden">
                <div
                  className="bg-[#aacfb6] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (service.rssMb / service.memoryLimitMb) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#8d9197] mt-1.5 block">
                Anon: {service.anonMb}MB · File: {service.fileMb}MB
              </span>
            </div>

            <div className="bg-[#1d2024] p-4 rounded-lg border border-[#272a2e]">
              <span className="text-[11px] font-medium text-[#8d9197] uppercase">CFS Quota Utilization</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-[22px] font-semibold text-[#b0c9e4]">{service.cfsQuota}%</span>
                <span className="font-mono text-[12px] text-[#8d9197]">Period: {service.cfsPeriodMs}ms</span>
              </div>
              <div className="mt-2 h-1.5 bg-[#0b0e12] rounded-full overflow-hidden">
                <div
                  className="bg-[#b0c9e4] h-full rounded-full transition-all"
                  style={{ width: `${service.cfsQuota}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#aacfb6] mt-1.5 block">
                0 throttled periods in window
              </span>
            </div>

            <div className="bg-[#1d2024] p-4 rounded-lg border border-[#272a2e]">
              <span className="text-[11px] font-medium text-[#8d9197] uppercase">Syscall Throughput</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-[22px] font-semibold text-[#e1e2e8]">{service.syscallsPerSec}</span>
                <span className="font-mono text-[12px] text-[#8d9197]">syscalls / s</span>
              </div>
              <span className="text-[11px] font-mono text-[#aacfb6] mt-2 block">
                Pacing: {service.egressPacing}
              </span>
              <span className="text-[10px] font-mono text-[#8d9197] block">
                VMA frag: {service.vmaFragmentation}% · mmap: {service.mmapRatePagesPerSec} pages/s
              </span>
            </div>

            <div className="bg-[#1d2024] p-4 rounded-lg border border-[#272a2e]">
              <span className="text-[11px] font-medium text-[#8d9197] uppercase">Isolation Forest Anomaly</span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-[22px] font-semibold text-[#aacfb6]">{service.anomalyScore}</span>
                <span className="font-mono text-[12px] text-[#8d9197]">/ 0.65 threshold</span>
              </div>
              <span className="text-[11px] font-mono text-[#aacfb6] mt-2 block">
                Z-Score: 0.12 (Nominal)
              </span>
              <span className="text-[10px] font-mono text-[#8d9197] block">
                Sliding window: 60s vector analysis
              </span>
            </div>
          </div>

          {/* eBPF Probes & Hook Matrix */}
          <div className="bg-[#191c20] p-4 rounded-lg border border-[#272a2e]">
            <h3 className="text-[13px] font-semibold text-[#e1e2e8] uppercase tracking-wider mb-3">
              Attached eBPF Kernel Probes ({service.ebpfHooksCount} Active Hooks)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {service.hooks.map((h, i) => (
                <div key={i} className="p-2.5 bg-[#0b0e12] rounded border border-[#272a2e] flex flex-col">
                  <span className="font-mono text-[12px] text-[#b0c9e4] font-medium truncate">{h}</span>
                  <span className="text-[10px] font-mono text-[#aacfb6] mt-1">● Active JIT Compiled</span>
                  <span className="text-[10px] text-[#8d9197]">Latency &lt; 0.4µs overhead</span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Ring-Buffer Telemetry Feed */}
          <div className="bg-[#0b0e12] p-4 rounded-lg border border-[#272a2e]">
            <div className="flex items-center justify-between pb-2 border-b border-[#272a2e] mb-3">
              <span className="text-[12px] font-mono text-[#b0c9e4] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#aacfb6] animate-pulse"></span>
                In-Kernel Ring Buffer Telemetry Stream (bpf_perf_event_output)
              </span>
              <span className="text-[11px] font-mono text-[#8d9197]">
                Showing last {relevantLogs.length} events
              </span>
            </div>
            <div className="space-y-1.5 font-mono text-[12px] max-h-60 overflow-y-auto">
              {relevantLogs.map((l) => (
                <div key={l.id} className="text-[#c3c7cd] hover:bg-[#191c20] p-1 rounded">
                  <span className="text-[#8d9197]">{l.timestamp}</span>
                  <span className="text-[#aacfb6] ml-2 font-medium">{l.probe}</span>
                  <span className="text-[#e1e2e8] ml-2">{l.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
