import React, { useState, useEffect } from 'react';
import { Microservice } from '../types/fleet';

interface TweakQuotaModalProps {
  service: Microservice | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceId: string, updates: Partial<Microservice>) => void;
}

export const TweakQuotaModal: React.FC<TweakQuotaModalProps> = ({
  service,
  isOpen,
  onClose,
  onSave,
}) => {
  const [quota, setQuota] = useState(16);
  const [period, setPeriod] = useState(100);
  const [memLimit, setMemLimit] = useState(512);
  const [oomScore, setOomScore] = useState(-200);
  const [suppression, setSuppression] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (service) {
      setQuota(service.cfsQuota);
      setPeriod(service.cfsPeriodMs);
      setMemLimit(service.memoryLimitMb);
      setOomScore(service.oomScoreAdj);
    }
  }, [service]);

  if (!isOpen || !service) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplying(true);
    setTimeout(() => {
      onSave(service.id, {
        cfsQuota: quota,
        cfsPeriodMs: period,
        memoryLimitMb: memLimit,
        oomScoreAdj: oomScore,
        statusText: `eBPF CFS quota tuned to ${quota}% (${period}ms period) by operator`,
      });
      setIsApplying(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#191c20] border border-[#272a2e] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-[#1d2024] border-b border-[#272a2e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b0c9e4] text-[20px]">tune</span>
            <div>
              <h3 className="font-semibold text-[15px] text-[#e1e2e8]">
                Tweak cgroup CFS Quota & Limits
              </h3>
              <p className="text-[11px] font-mono text-[#8d9197]">
                Target: {service.name} (PID {service.pid}) · {service.cgroupPath}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8d9197] hover:text-[#e1e2e8] p-1 rounded hover:bg-[#272a2e]"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* CFS Quota Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-[#c3c7cd] uppercase tracking-wider">
                CFS Quota Limit
              </label>
              <span className="font-mono text-[13px] text-[#b0c9e4] font-semibold bg-[#0b0e12] px-2 py-0.5 rounded border border-[#272a2e]">
                {quota}% ({(quota * 1000).toLocaleString()} µs / {period}ms)
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={quota}
              onChange={(e) => setQuota(Number(e.target.value))}
              className="w-full h-1.5 bg-[#0b0e12] rounded-lg appearance-none cursor-pointer accent-[#b0c9e4]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8d9197]">
              <span>5% (Strict clamp)</span>
              <span>50% (Standard burst)</span>
              <span>100% (Unconstrained)</span>
            </div>
          </div>

          {/* CFS Period (ms) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-[#c3c7cd] uppercase tracking-wider">
                CFS Period Length
              </label>
              <span className="font-mono text-[13px] text-[#e1e2e8] bg-[#0b0e12] px-2 py-0.5 rounded border border-[#272a2e]">
                {period} ms
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="200"
              step="5"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="w-full h-1.5 bg-[#0b0e12] rounded-lg appearance-none cursor-pointer accent-[#b0c9e4]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8d9197]">
              <span>10ms (Low latency micro-bursts)</span>
              <span>100ms (Default)</span>
              <span>200ms (Throughput-optimized)</span>
            </div>
          </div>

          {/* Memory Max Limit (MB) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-[#c3c7cd] uppercase tracking-wider">
                cgroup Memory Hard Ceiling
              </label>
              <span className="font-mono text-[13px] text-[#aacfb6] bg-[#0b0e12] px-2 py-0.5 rounded border border-[#272a2e]">
                {memLimit} MB
              </span>
            </div>
            <input
              type="range"
              min="128"
              max="4096"
              step="64"
              value={memLimit}
              onChange={(e) => setMemLimit(Number(e.target.value))}
              className="w-full h-1.5 bg-[#0b0e12] rounded-lg appearance-none cursor-pointer accent-[#aacfb6]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#8d9197]">
              <span>Current RSS: {service.rssMb}MB</span>
              <span>Limit: {memLimit}MB</span>
            </div>
          </div>

          {/* OOM Score Adj */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium text-[#c3c7cd] uppercase tracking-wider">
                oom_score_adj
              </label>
              <span className="font-mono text-[12px] text-[#e1e2e8] bg-[#0b0e12] px-2 py-0.5 rounded border border-[#272a2e]">
                {oomScore}
              </span>
            </div>
            <input
              type="range"
              min="-1000"
              max="1000"
              step="50"
              value={oomScore}
              onChange={(e) => setOomScore(Number(e.target.value))}
              className="w-full h-1.5 bg-[#0b0e12] rounded-lg appearance-none cursor-pointer accent-[#b0c9e4]"
            />
            <span className="text-[10px] text-[#8d9197] block">
              -1000 disables OOM killer completely; 0 is default; 1000 sacrifices first.
            </span>
          </div>

          {/* Active Proactive eBPF Suppression toggle */}
          <div className="p-3 bg-[#0b0e12] rounded-lg border border-[#272a2e] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[12px] font-medium text-[#e1e2e8]">
                Proactive In-Kernel CFS Suppression
              </span>
              <span className="text-[11px] text-[#8d9197]">
                Clamp syscall bursts before kernel cgroup CFS throttle kicks in
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSuppression(!suppression)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                suppression ? 'bg-[#7a93ac]' : 'bg-[#272a2e]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  suppression ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#272a2e]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#272a2e] text-[#c3c7cd] hover:text-[#e1e2e8] text-[13px] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isApplying}
              className="px-4 py-2 rounded-lg bg-[#7a93ac] text-[#112c41] hover:bg-[#b0c9e4] text-[13px] font-semibold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isApplying ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                  <span>Writing to cgroup...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Apply eBPF cgroup Rule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
