import React, { useState } from 'react';
import { Microservice } from '../types/fleet';

interface FaultsViewProps {
  services: Microservice[];
  onInjectFault: (serviceId: string, faultType: string, durationSec: number) => void;
  onNavigateToFleet: (serviceId: string) => void;
}

export const FaultsView: React.FC<FaultsViewProps> = ({
  services,
  onInjectFault,
  onNavigateToFleet,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || 'payment-service');
  const [faultType, setFaultType] = useState<string>('cfs_quota');
  const [duration, setDuration] = useState<number>(10);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [lastInjected, setLastInjected] = useState<{
    serviceName: string;
    faultName: string;
    result: string;
    timestamp: string;
  } | null>(null);

  const faultTypes = [
    {
      id: 'cfs_quota',
      name: 'CFS Quota Exhaustion',
      desc: 'Saturates cgroup CPU quota past 85% to trigger kernel throttling and latency spikes.',
      impact: 'Triggers eBPF proactive throttle clamp within 320ms.',
      icon: 'speed',
    },
    {
      id: 'memory_leak',
      name: 'Simulated Heap Memory Spike',
      desc: 'Rapidly allocates unmapped anonymous pages to push memory limit close to OOM killer boundary.',
      impact: 'Sentinel triggers kprobe:cgroup_rstat memory drain and slab reclaim.',
      icon: 'memory',
    },
    {
      id: 'tcp_packet_drop',
      name: 'TC Egress Jitter & Frame Loss',
      desc: 'Drops 40% of outbound TCP packets via netem to simulate cross-AZ switch congestion.',
      impact: 'eBPF TC egress filters reroute flows and enable pacing.',
      icon: 'swap_horiz',
    },
    {
      id: 'zombie_threads',
      name: 'Zombie PID Saturation',
      desc: 'Spawns 50 orphan worker processes without waiting for SIGCHLD harvest.',
      impact: 'Sentinel in-kernel reap cleans subtree in sub-second window.',
      icon: 'group_work',
    },
  ];

  const handleInject = () => {
    setIsInjecting(true);
    const s = services.find((srv) => srv.id === selectedServiceId);
    const fault = faultTypes.find((f) => f.id === faultType);

    onInjectFault(selectedServiceId, fault?.name || faultType, duration);

    setTimeout(() => {
      setIsInjecting(false);
      setLastInjected({
        serviceName: s?.name || selectedServiceId,
        faultName: fault?.name || faultType,
        result: 'Sentinel eBPF Agent successfully detected anomaly and stabilized target.',
        timestamp: new Date().toLocaleTimeString(),
      });
    }, duration * 1000 > 3000 ? 3000 : duration * 1000);
  };

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C9A66B] text-[20px]">bolt</span>
            <h2 className="text-[18px] font-semibold text-[#e1e2e8]">
              Sentinel Chaos Fault Injection Engine
            </h2>
          </div>
          <p className="text-[12px] text-[#8d9197] mt-1">
            Simulate real-world kernel stress, memory pressure, and network partitions to verify ScyldAI self-healing.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#aacfb6] bg-[#0b0e12] px-3 py-1.5 rounded-lg border border-[#272a2e]">
          <span className="w-2 h-2 rounded-full bg-[#aacfb6] animate-pulse"></span>
          <span>CO-RE Sandbox Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-7 bg-[#1d2024] rounded-lg p-5 border border-[#272a2e] space-y-5">
          <h3 className="font-semibold text-[14px] text-[#e1e2e8] uppercase tracking-wider pb-2 border-b border-[#272a2e]">
            1. Configure Fault Vector
          </h3>

          {/* Target Service Selection */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[#c3c7cd] uppercase tracking-wider">
              Target Microservice
            </label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full bg-[#0b0e12] text-[#e1e2e8] font-mono text-[13px] p-2.5 rounded-lg border border-[#272a2e] focus:outline-none focus:border-[#7a93ac]"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (PID {s.pid}) — {s.category} · {s.health}% Health
                </option>
              ))}
            </select>
          </div>

          {/* Fault Type Selection */}
          <div className="space-y-2">
            <label className="text-[12px] font-medium text-[#c3c7cd] uppercase tracking-wider">
              Fault Injection Scenario
            </label>
            <div className="space-y-2">
              {faultTypes.map((f) => {
                const isSelected = faultType === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setFaultType(f.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-[#0b0e12] border-[#7a93ac] ring-1 ring-[#7a93ac]/40'
                        : 'bg-[#191c20] border-[#272a2e] hover:border-[#43474c]'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] mt-0.5 ${isSelected ? 'text-[#b0c9e4]' : 'text-[#8d9197]'}`}>
                      {f.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[13px] text-[#e1e2e8]">{f.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-mono text-[#b0c9e4] bg-[#7a93ac]/20 px-2 py-0.5 rounded">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#8d9197] mt-0.5">{f.desc}</p>
                      <div className="mt-1 text-[11px] font-mono text-[#aacfb6]">
                        ↳ Mitigation: {f.impact}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-[#c3c7cd] uppercase tracking-wider">
                Fault Duration
              </label>
              <span className="font-mono text-[13px] text-[#b0c9e4] font-semibold bg-[#0b0e12] px-2 py-0.5 rounded border border-[#272a2e]">
                {duration} Seconds
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-1.5 bg-[#0b0e12] rounded-lg appearance-none cursor-pointer accent-[#b0c9e4]"
            />
          </div>

          {/* Execute Button */}
          <button
            onClick={handleInject}
            disabled={isInjecting}
            className="w-full py-3 rounded-lg bg-[#d4a373] hover:bg-[#C9A66B] text-[#191c20] font-semibold text-[14px] flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isInjecting ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                <span>Injecting Fault & Observing eBPF Telemetry ({duration}s)...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">bolt</span>
                <span>Inject Fault via eBPF</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Live Observer Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1d2024] rounded-lg p-5 border border-[#272a2e] space-y-4">
            <h3 className="font-semibold text-[14px] text-[#e1e2e8] uppercase tracking-wider pb-2 border-b border-[#272a2e]">
              2. Target Service Snapshot
            </h3>

            {selectedService && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[15px] text-[#e1e2e8]">{selectedService.name}</span>
                  <span className="font-mono text-[11px] bg-[#0b0e12] px-2 py-0.5 rounded text-[#8d9197]">
                    PID {selectedService.pid}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[12px]">
                  <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e]">
                    <span className="text-[#8d9197] block text-[10px] uppercase">Health</span>
                    <span className="font-mono text-[16px] font-semibold text-[#e1e2e8]">
                      {selectedService.health}%
                    </span>
                  </div>
                  <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e]">
                    <span className="text-[#8d9197] block text-[10px] uppercase">CFS Quota</span>
                    <span className="font-mono text-[16px] font-semibold text-[#b0c9e4]">
                      {selectedService.cfsQuota}%
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e] text-[11px] font-mono text-[#8d9197]">
                  cgroup: {selectedService.cgroupPath}
                </div>

                <button
                  onClick={() => onNavigateToFleet(selectedService.id)}
                  className="w-full py-2 rounded bg-[#272a2e] hover:bg-[#323539] text-[#b0c9e4] text-[12px] font-mono transition-colors"
                >
                  View in Fleet Management Dashboard →
                </button>
              </div>
            )}
          </div>

          {/* Last Injected Status Result */}
          {lastInjected && (
            <div className="bg-[#1d2024] rounded-lg p-5 border border-[#aacfb6]/40 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#aacfb6] font-semibold text-[13px]">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Fault Injection & Auto-Healing Report</span>
              </div>
              <p className="text-[12px] text-[#e1e2e8]">
                Target: <span className="font-mono text-[#b0c9e4]">{lastInjected.serviceName}</span> · Fault: <span className="text-[#C9A66B]">{lastInjected.faultName}</span>
              </p>
              <p className="text-[11px] text-[#aacfb6] font-mono bg-[#0b0e12] p-2.5 rounded border border-[#272a2e]">
                {lastInjected.result}
              </p>
              <span className="text-[10px] font-mono text-[#8d9197] block text-right">
                Logged at {lastInjected.timestamp}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
