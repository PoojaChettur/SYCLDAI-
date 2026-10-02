import React, { useState } from 'react';

export const RoiSlaView: React.FC = () => {
  const [costPerMinute, setCostPerMinute] = useState<number>(1200);
  const [nodes, setNodes] = useState<number>(42);
  const preventedMinutes = 142;

  const totalSaved = preventedMinutes * costPerMinute;
  const engineerHoursSaved = 38;

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e]">
        <h2 className="text-[18px] font-semibold text-[#e1e2e8]">
          ROI & Service Level Agreement (SLA) Analytics
        </h2>
        <p className="text-[12px] text-[#8d9197] mt-1">
          Measurable infrastructure cost avoidance, SLA uptime adherence, and on-call toil reduction.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e]">
          <span className="text-[11px] font-medium text-[#8d9197] uppercase">SLA Availability</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-mono text-[28px] font-semibold text-[#aacfb6]">99.984%</span>
            <span className="text-[12px] text-[#8d9197]">/ 99.990% Commit</span>
          </div>
          <div className="h-1.5 bg-[#0b0e12] rounded-full overflow-hidden">
            <div className="bg-[#aacfb6] h-full rounded-full" style={{ width: '99.98%' }}></div>
          </div>
          <span className="text-[11px] font-mono text-[#8d9197] mt-2 block">
            Current Error Budget Remaining: 84.2%
          </span>
        </div>

        <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e]">
          <span className="text-[11px] font-medium text-[#8d9197] uppercase">Outage Time Prevented</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-mono text-[28px] font-semibold text-[#b0c9e4]">{preventedMinutes}</span>
            <span className="text-[12px] text-[#8d9197]">Minutes (90-day rolling)</span>
          </div>
          <p className="text-[11px] text-[#8d9197]">
            18 catastrophic cgroup cascades throttled before customer impact.
          </p>
        </div>

        <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e]">
          <span className="text-[11px] font-medium text-[#8d9197] uppercase">Estimated Financial Recovery</span>
          <div className="my-2 flex items-baseline gap-2">
            <span className="font-mono text-[28px] font-semibold text-[#e1e2e8]">
              ${(totalSaved / 1000).toFixed(1)}k
            </span>
            <span className="text-[12px] text-[#aacfb6] font-mono font-medium">ROI 14.8x</span>
          </div>
          <p className="text-[11px] text-[#8d9197]">
            Based on current enterprise downtime rate config.
          </p>
        </div>
      </div>

      {/* Interactive ROI Calculator */}
      <div className="bg-[#1d2024] p-6 rounded-lg border border-[#272a2e] space-y-6">
        <h3 className="font-semibold text-[15px] text-[#e1e2e8]">
          Interactive Financial Downtime Avoidance Calculator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#c3c7cd]">Cost of 1 Minute of Service Degradation</span>
                <span className="font-mono font-semibold text-[#b0c9e4]">${costPerMinute.toLocaleString()}/min</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={costPerMinute}
                onChange={(e) => setCostPerMinute(Number(e.target.value))}
                className="w-full h-1.5 bg-[#0b0e12] rounded appearance-none cursor-pointer accent-[#b0c9e4]"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#8d9197]">
                <span>$200/min (SMB)</span>
                <span>$1,200/min (Mid-Market)</span>
                <span>$5,000/min (Global FinTech)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#c3c7cd]">Protected Cluster Worker Nodes</span>
                <span className="font-mono font-semibold text-[#aacfb6]">{nodes} Nodes</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="2"
                value={nodes}
                onChange={(e) => setNodes(Number(e.target.value))}
                className="w-full h-1.5 bg-[#0b0e12] rounded appearance-none cursor-pointer accent-[#aacfb6]"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-[#0b0e12] p-5 rounded-lg border border-[#272a2e] flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-[11px] uppercase font-mono text-[#8d9197]">Calculated Savings Projection</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[32px] font-bold text-[#aacfb6]">
                  ${((preventedMinutes * costPerMinute * (nodes / 42))).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[12px] text-[#8d9197]">/ Quarter</span>
              </div>
              <div className="text-[12px] text-[#c3c7cd] space-y-1">
                <div>• SRE On-call toil avoided: <span className="font-mono text-[#b0c9e4]">{engineerHoursSaved} hours</span></div>
                <div>• Customer SLA refunds prevented: <span className="font-mono text-[#aacfb6]">100%</span></div>
              </div>
            </div>
            <div className="pt-3 border-t border-[#272a2e] text-[10px] font-mono text-[#8d9197]">
              ScyldAI autonomous in-kernel self-healing pays for itself in under 48 hours of enterprise traffic.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
