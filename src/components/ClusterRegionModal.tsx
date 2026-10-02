import React from 'react';
import { ClusterRegion } from '../types/fleet';

interface ClusterRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clusters: ClusterRegion[];
  currentCluster: ClusterRegion;
  onSelectCluster: (cluster: ClusterRegion) => void;
}

export const ClusterRegionModal: React.FC<ClusterRegionModalProps> = ({
  isOpen,
  onClose,
  clusters,
  currentCluster,
  onSelectCluster,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#191c20] border border-[#272a2e] rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
        <div className="p-4 bg-[#1d2024] border-b border-[#272a2e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b0c9e4] text-[20px]">dns</span>
            <div>
              <h3 className="font-semibold text-[15px] text-[#e1e2e8]">Select eBPF Cluster Region</h3>
              <p className="text-[11px] text-[#8d9197]">Switch active kernel telemetry data plane</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8d9197] hover:text-[#e1e2e8] p-1 rounded">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-2">
          {clusters.map((cluster) => {
            const isSelected = cluster.id === currentCluster.id;
            return (
              <button
                key={cluster.id}
                onClick={() => {
                  onSelectCluster(cluster);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-lg border text-left transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-[#1d2024] border-[#7a93ac] shadow-sm'
                    : 'bg-[#0b0e12] border-[#272a2e] hover:bg-[#1d2024]/60 hover:border-[#43474c]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold text-[#e1e2e8]">
                      {cluster.name}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#7a93ac]/20 text-[#b0c9e4] font-medium">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#8d9197] mt-0.5">{cluster.location}</div>
                  <div className="text-[11px] font-mono text-[#aacfb6] mt-1">
                    Kernel: {cluster.kernelVersion} · RTT: {cluster.pingMs}ms
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-[13px] text-[#e1e2e8] font-medium">
                    {cluster.activeNodes}/{cluster.totalNodes} Nodes
                  </div>
                  <div className="text-[11px] text-[#8d9197]">{cluster.activeServices} Services</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-[#0b0e12] border-t border-[#272a2e] text-center text-[11px] text-[#8d9197]">
          Cluster changes synchronize eBPF bytecode without service interruption.
        </div>
      </div>
    </div>
  );
};
