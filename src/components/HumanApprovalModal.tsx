import React from 'react';
import { IncidentGate, SentinelMode } from '../types/fleet';

interface HumanApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingGates: IncidentGate[];
  activeMode: SentinelMode;
  onApproveGate: (incidentId: string) => void;
  onRejectGate: (incidentId: string) => void;
  onSwitchMode: (mode: SentinelMode) => void;
  onTriggerTestIncident: () => void;
  onNavigateToFleet: (serviceId: string) => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  isOpen,
  onClose,
  pendingGates,
  activeMode,
  onApproveGate,
  onRejectGate,
  onSwitchMode,
  onTriggerTestIncident,
  onNavigateToFleet,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#111417] border-2 border-[#C9A66B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#191c20] border-b border-[#272a2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A66B]/20 border border-[#C9A66B]/60 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#C9A66B] text-[24px]">
                verified_user
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[17px] font-bold text-[#e1e2e8]">
                  Human Approval Center
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#C9A66B]/20 text-[#C9A66B] border border-[#C9A66B]/40">
                  {pendingGates.length} PENDING
                </span>
              </div>
              <p className="text-[12px] text-[#8d9197]">
                Human-in-the-loop authorization for in-kernel eBPF remediations and container fixes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8d9197] hover:text-[#e1e2e8] hover:bg-[#272a2e] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sentinel Mode Info Strip */}
        <div className="px-5 py-3 bg-[#0b0e12] border-b border-[#272a2e] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
          <div className="flex items-center gap-2">
            <span className="text-[#8d9197]">Current Operating Mode:</span>
            <span
              className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[11px] ${
                activeMode === 'armed'
                  ? 'bg-[#aacfb6]/20 text-[#aacfb6] border border-[#aacfb6]/40'
                  : activeMode === 'gated'
                  ? 'bg-[#C9A66B]/20 text-[#C9A66B] border border-[#C9A66B]/40'
                  : 'bg-[#d4a373]/20 text-[#d4a373] border border-[#d4a373]/40'
              }`}
            >
              {activeMode}
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[#8d9197] mr-1">Switch:</span>
            <button
              onClick={() => onSwitchMode('armed')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                activeMode === 'armed'
                  ? 'bg-[#7a93ac] text-[#112c41] font-bold'
                  : 'bg-[#1d2024] text-[#8d9197] hover:text-white'
              }`}
            >
              Armed
            </button>
            <button
              onClick={() => onSwitchMode('gated')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                activeMode === 'gated'
                  ? 'bg-[#C9A66B] text-[#191c20] font-bold'
                  : 'bg-[#1d2024] text-[#8d9197] hover:text-white'
              }`}
            >
              Gated
            </button>
            <button
              onClick={() => onSwitchMode('dry-run')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                activeMode === 'dry-run'
                  ? 'bg-[#d4a373] text-[#191c20] font-bold'
                  : 'bg-[#1d2024] text-[#8d9197] hover:text-white'
              }`}
            >
              Dry-run
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {pendingGates.length === 0 ? (
            <div className="py-8 px-4 text-center bg-[#191c20] rounded-xl border border-[#272a2e] space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#aacfb6]/20 text-[#aacfb6] flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <h4 className="text-[16px] font-bold text-[#e1e2e8]">
                No Actions Require Human Approval
              </h4>
              <p className="text-[13px] text-[#8d9197] max-w-md mx-auto">
                All 42 sentinel nodes and 14 microservices are operating nominally. When Sentinel detects an anomaly in <strong>GATED mode</strong>, it will pause here and await your confirmation before applying the fix.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onTriggerTestIncident();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#C9A66B] hover:bg-[#d6b77e] text-[#191c20] font-bold text-[13px] shadow-lg transition-transform hover:scale-105 cursor-pointer inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Create Test Incident (Test Human Approval Flow)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-[13px] text-[#c3c7cd]">
                The following remediation actions are currently paused in kernel space, awaiting your authorization:
              </div>

              {pendingGates.map((gate) => (
                <div
                  key={gate.id}
                  className="p-4 bg-[#191c20] rounded-xl border-2 border-[#C9A66B] space-y-3 shadow-lg"
                >
                  {/* Incident Header */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#272a2e]">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/30">
                        {gate.severity}
                      </span>
                      <span className="font-mono text-[11px] text-[#8d9197]">{gate.id}</span>
                      <span className="text-[#8d9197]">·</span>
                      <button
                        onClick={() => {
                          onNavigateToFleet(gate.serviceId);
                          onClose();
                        }}
                        className="font-mono text-[13px] font-bold text-[#b0c9e4] hover:underline"
                      >
                        {gate.serviceName}
                      </button>
                    </div>
                    <span className="text-[11px] font-mono text-[#8d9197]">{gate.detectedAt}</span>
                  </div>

                  {/* Incident Description */}
                  <div>
                    <h4 className="text-[14px] font-bold text-[#e1e2e8]">{gate.title}</h4>
                    <p className="text-[12px] text-[#8d9197] mt-0.5">{gate.description}</p>
                  </div>

                  {/* Proposed eBPF Action */}
                  <div className="p-3 bg-[#0b0e12] rounded-lg border border-[#272a2e] space-y-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-[#8d9197]">
                      <span className="uppercase tracking-wider">Proposed In-Kernel Action</span>
                      <span className="text-[#aacfb6]">Safety: 100% (Zero Downtime)</span>
                    </div>
                    <div className="text-[#aacfb6] font-semibold text-[12px]">
                      {gate.ebpfProposedFix || gate.ebpfActionTaken}
                    </div>
                    <div className="text-[#8d9197] text-[10px]">
                      Root Cause: {gate.rootCause}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => onRejectGate(gate.id)}
                      className="px-4 py-2 rounded-xl bg-[#272a2e] hover:bg-[#ffb4ab]/20 text-[#ffb4ab] border border-[#ffb4ab]/40 font-semibold text-[13px] transition-colors cursor-pointer"
                    >
                      ❌ Reject / Veto
                    </button>
                    <button
                      onClick={() => onApproveGate(gate.id)}
                      className="px-5 py-2 rounded-xl bg-[#aacfb6] hover:bg-[#c5ecd1] text-[#153725] font-bold text-[13px] shadow-lg transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>✅ Approve & Execute In-Kernel Fix</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Educational Note */}
          <div className="p-3 bg-[#0b0e12] rounded-lg border border-[#272a2e] text-[11px] text-[#8d9197] space-y-1">
            <span className="text-[#e1e2e8] font-semibold block">💡 How Human Approval Works:</span>
            <p>
              • <strong>Armed Mode:</strong> Sentinel heals memory leaks & throttles autonomously in &lt; 2.8s without bothering you.
            </p>
            <p>
              • <strong>Gated Mode:</strong> Sentinel freezes rogue processes in kernel memory and asks you to Approve before executing the fix.
            </p>
            <p>
              • <strong>Dry-run Mode:</strong> Sentinel only logs what it would do, taking no action on your containers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#191c20] border-t border-[#272a2e] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#8d9197]">
            Audit Trail: All approvals cryptographically signed with HMAC-SHA256
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#272a2e] text-[#e1e2e8] hover:bg-[#323539] text-[12px] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
