import React, { useState } from 'react';

export const RoiSlaView: React.FC = () => {
  const [costPerMinute, setCostPerMinute] = useState<number>(1200);
  const [includeBurnout, setIncludeBurnout] = useState<boolean>(true);
  const [nodes, setNodes] = useState<number>(42);

  const preventedMinutes = 142;
  const baseDowntimeSavings = preventedMinutes * costPerMinute;
  const burnoutBonus = includeBurnout ? 18400 * 4 : 0; // 4 on-call engineers
  const totalAnnualValue = 184200 + (costPerMinute - 1200) * 80 + burnoutBonus;

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 Cols): Sliders & Burnout Checkbox */}
        <div className="lg:col-span-5 bg-[#1d2024] rounded-xl p-5 border border-[#272a2e] space-y-5 shadow-sm">
          <h3 className="font-semibold text-[14px] text-[#e1e2e8] uppercase tracking-wider pb-2 border-b border-[#272a2e]">
            ROI Model Parameters
          </h3>

          {/* Downtime Cost Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-[#c3c7cd]">Cost of 1 Minute Service Degradation</span>
              <span className="font-mono text-[#b0c9e4] font-semibold">
                ${costPerMinute.toLocaleString()}/min
              </span>
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
            <div className="flex justify-between font-mono text-[10px] text-[#8d9197]">
              <span>$200/min (SMB)</span>
              <span>$1,200/min (Mid-Market)</span>
              <span>$5,000/min (FinTech)</span>
            </div>
          </div>

          {/* Nodes Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-[#c3c7cd]">Protected Cluster Worker Nodes</span>
              <span className="font-mono text-[#aacfb6] font-semibold">{nodes} Nodes</span>
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

          {/* Burnout Toggle Matching scyld-ai-five exactly */}
          <div className="pt-2 border-t border-[#272a2e]">
            <label className="flex items-start gap-3 p-3 rounded-lg bg-[#0b0e12] border border-[#272a2e] cursor-pointer hover:bg-[#191c20] transition-colors">
              <input
                type="checkbox"
                checked={includeBurnout}
                onChange={(e) => setIncludeBurnout(e.target.checked)}
                className="mt-1 h-4 w-4 rounded bg-[#323539] border-0 text-[#7a93ac] focus:ring-0 cursor-pointer accent-[#aacfb6]"
              />
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-[#e1e2e8]">
                  Include engineer burnout & turnover avoidance
                </span>
                <span className="text-[11px] text-[#8d9197] mt-0.5">
                  Adds $18,400/yr per on-call engineer saved from attritional off-hours fatigue.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Right Column (7 Cols): Primary Result Cards & Impact Breakdown */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Card 1: Annual Downtime Avoidance Value */}
          <div className="bg-[#1d2024] rounded-xl p-6 border border-[#272a2e] relative overflow-hidden shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#8d9197]">
                  Primary Net Value
                </span>
                <div className="font-mono text-[34px] leading-tight text-[#b0c9e4] font-semibold tracking-tight">
                  ${totalAnnualValue.toLocaleString()}{' '}
                  <span className="text-[14px] text-[#8d9197] font-normal">/ yr</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#b0c9e4] text-[28px] p-2 rounded-lg bg-[#0b0e12]">
                payments
              </span>
            </div>

            <p className="mt-2 text-[12px] text-[#8d9197]">
              Based on 3.8 hours of prevented SEV-1/SEV-2 incidents over the last 180 days across 42 worker nodes.
            </p>

            {/* Dynamic Visual Sparkline SVG */}
            <div className="mt-4 pt-2 bg-[#0b0e12] rounded-lg p-3 border border-[#272a2e]/60">
              <div className="flex justify-between items-center mb-1 text-[11px] font-mono text-[#8d9197]">
                <span>Cumulative Avoidance Curve (Rolling 12 Mo)</span>
                <span className="text-[#aacfb6]">+14.2% QoQ compounding</span>
              </div>
              <svg className="w-full h-16 text-[#7a93ac]" fill="none" preserveAspectRatio="none" viewBox="0 0 500 64">
                <path
                  d="M0,58 C60,54 110,48 160,40 C210,32 260,35 310,24 C360,14 420,10 500,4 L500,64 L0,64 Z"
                  fill="currentColor"
                  fillOpacity="0.15"
                />
                <path
                  d="M0,58 C60,54 110,48 160,40 C210,32 260,35 310,24 C360,14 420,10 500,4"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <circle cx="500" cy="4" fill="#b0c9e4" r="3.5" />
              </svg>
            </div>
          </div>

          {/* 2-Card Row: SLA Target + Pager Noise */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 2: Achieved SLA vs Contractual Target */}
            <div className="bg-[#1d2024] rounded-xl p-5 border border-[#272a2e] flex flex-col justify-between shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#8d9197]">
                    SLA Governance
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-[#aacfb6] px-2 py-0.5 rounded bg-[#0b0e12]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#aacfb6]"></span>
                    Verified
                  </span>
                </div>
                <div className="pt-2">
                  <div className="font-mono text-[30px] leading-none text-[#aacfb6] font-medium">
                    99.995%
                  </div>
                  <div className="text-[11px] font-mono text-[#8d9197] mt-1.5">
                    Contractual Target: 99.90%
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 bg-[#0b0e12] rounded p-2.5 space-y-1.5 border border-[#272a2e]/60">
                <div className="flex items-center gap-1 text-[11px] text-[#e1e2e8]">
                  <span className="material-symbols-outlined text-[14px] text-[#aacfb6]">verified_user</span>
                  <span>Zero SLA penalty credits issued across all quarters.</span>
                </div>
                <div className="w-full bg-[#272a2e] h-1 rounded-full overflow-hidden">
                  <div className="bg-[#aacfb6] h-full rounded-full" style={{ width: '99%' }}></div>
                </div>
              </div>
            </div>

            {/* Card 3: 3am Pager Alert Noise Drop */}
            <div className="bg-[#1d2024] rounded-xl p-5 border border-[#272a2e] flex flex-col justify-between shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#8d9197]">
                    Fatigue & Sleep Vector
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-[#b0c9e4]">bedtime</span>
                </div>
                <div className="pt-2">
                  <div className="font-mono text-[30px] leading-none text-[#b0c9e4] font-medium">
                    -94%
                  </div>
                  <div className="text-[11px] font-mono text-[#8d9197] mt-1.5">
                    3 AM Pager Alert Noise Drop
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 bg-[#0b0e12] rounded p-2.5 text-[11px] text-[#8d9197] border border-[#272a2e]/60">
                142 minutes of off-hours disruptions prevented by autonomous in-kernel mitigations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
