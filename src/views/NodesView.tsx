import React, { useState } from 'react';
import { NodeAgentInfo } from '../types/fleet';

interface NodesViewProps {
  onOpenDeployModal: () => void;
  onNavigateToFleet: () => void;
}

export const NodesView: React.FC<NodesViewProps> = ({
  onOpenDeployModal,
  onNavigateToFleet,
}) => {
  const [filterZone, setFilterZone] = useState('ALL');
  const [search, setSearch] = useState('');

  // 42 simulated server nodes in cluster
  const nodes: NodeAgentInfo[] = Array.from({ length: 42 }, (_, i) => {
    const num = i + 1;
    const zone = num % 3 === 0 ? 'us-east-1a' : num % 3 === 1 ? 'us-east-1b' : 'us-east-1c';
    return {
      id: `node-${num.toString().padStart(2, '0')}`,
      name: `ip-10-0-${Math.floor(num / 10) + 1}-${10 + (num % 20)}.ec2.internal`,
      zone,
      status: 'Ready',
      kernelVersion: '6.5.0-ebpf-sentinel',
      daemonSetPod: `scyld-sentinel-${Math.random().toString(36).substring(2, 7)}`,
      ebpfDriverStatus: 'CO-RE Active',
      cpuCores: 16,
      memGb: 64,
      runningContainers: 6 + (num % 8),
    };
  });

  const filtered = nodes.filter((n) => {
    if (filterZone !== 'ALL' && n.zone !== filterZone) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return n.name.toLowerCase().includes(q) || n.id.toLowerCase().includes(q) || n.daemonSetPod.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#aacfb6] text-[22px]">dns</span>
            <h2 className="text-[18px] font-semibold text-[#e1e2e8]">
              Server Fleet & DaemonSet Agents
            </h2>
            <span className="font-mono text-[11px] bg-[#0b0e12] px-2 py-0.5 rounded text-[#aacfb6] border border-[#272a2e]">
              42/42 Nodes Healthy
            </span>
          </div>
          <p className="text-[12px] text-[#8d9197] mt-1">
            One ScyldAI eBPF agent running on every physical server via Kubernetes DaemonSet. Captures kernel telemetry for all containers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDeployModal}
            className="px-3.5 py-1.5 rounded-lg bg-[#7a93ac] text-[#112c41] font-semibold text-[12px] hover:bg-[#b0c9e4] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>DaemonSet Helm Config</span>
          </button>
          <button
            onClick={onNavigateToFleet}
            className="px-3.5 py-1.5 rounded-lg bg-[#272a2e] text-[#e1e2e8] hover:bg-[#323539] text-[12px] font-medium transition-colors border border-[#43474c] flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">radar</span>
            <span>Microservice Radar</span>
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
            placeholder="Search server hostname, node ID, or daemonset pod..."
            className="w-full bg-[#0b0e12] text-[#e1e2e8] font-mono pl-8 pr-4 py-1.5 rounded-lg border border-[#272a2e] text-[12px] focus:outline-none focus:border-[#7a93ac]"
          />
        </div>

        <div className="flex items-center bg-[#0b0e12] p-1 rounded-lg border border-[#272a2e] shrink-0">
          {['ALL', 'us-east-1a', 'us-east-1b', 'us-east-1c'].map((zone) => (
            <button
              key={zone}
              onClick={() => setFilterZone(zone)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                filterZone === zone
                  ? 'bg-[#7a93ac] text-[#112c41] font-semibold'
                  : 'text-[#c3c7cd] hover:text-[#e1e2e8]'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Node Table */}
      <div className="bg-[#1d2024] rounded-lg border border-[#272a2e] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[12px]">
            <thead className="bg-[#0b0e12] text-[#8d9197] text-[10px] uppercase border-b border-[#272a2e]">
              <tr>
                <th className="py-2.5 px-4">Node / Hostname</th>
                <th className="py-2.5 px-3">Zone</th>
                <th className="py-2.5 px-3">DaemonSet Pod</th>
                <th className="py-2.5 px-3">eBPF Driver</th>
                <th className="py-2.5 px-3">Specs</th>
                <th className="py-2.5 px-3">Containers</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272a2e]/60">
              {filtered.map((node) => (
                <tr key={node.id} className="hover:bg-[#191c20] transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-[#e1e2e8] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#aacfb6]"></span>
                    <div>
                      <div>{node.name}</div>
                      <div className="text-[10px] text-[#8d9197] font-normal">{node.id} · {node.kernelVersion}</div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[#c3c7cd]">{node.zone}</td>
                  <td className="py-2.5 px-3 text-[#b0c9e4] font-medium">{node.daemonSetPod}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#aacfb6]/15 text-[#aacfb6] border border-[#aacfb6]/30">
                      {node.ebpfDriverStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#8d9197]">{node.cpuCores} vCPU / {node.memGb}GB</td>
                  <td className="py-2.5 px-3 text-[#e1e2e8]">{node.runningContainers} containers</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="font-semibold text-[#aacfb6]">● {node.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
