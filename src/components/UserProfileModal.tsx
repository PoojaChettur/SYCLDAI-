import React from 'react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userEmail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#191c20] border border-[#272a2e] rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
        <div className="p-4 bg-[#1d2024] border-b border-[#272a2e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b0c9e4] text-[20px]">badge</span>
            <div>
              <h3 className="font-semibold text-[15px] text-[#e1e2e8]">Sentinel Operator Identity</h3>
              <p className="text-[11px] text-[#8d9197]">eBPF Control Plane Session</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8d9197] hover:text-[#e1e2e8] p-1 rounded">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#0b0e12] rounded-lg border border-[#272a2e]">
            <div className="w-12 h-12 rounded-full bg-[#7a93ac]/30 border border-[#7a93ac] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#b0c9e4] text-[24px]">person</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-[13px] text-[#e1e2e8] truncate">{userEmail}</div>
              <div className="text-[11px] text-[#aacfb6] font-mono mt-0.5">Role: SecOps Kernel Commander</div>
              <div className="text-[10px] text-[#8d9197] font-mono">ID: SEC-OP-98124</div>
            </div>
          </div>

          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between py-1 border-b border-[#272a2e]">
              <span className="text-[#8d9197]">Security Clearance:</span>
              <span className="text-[#b0c9e4] font-mono font-medium">Level 5 (CAP_SYS_ADMIN / BPF)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#272a2e]">
              <span className="text-[#8d9197]">JIT Kernel Verification:</span>
              <span className="text-[#aacfb6] font-mono">Bpf_prog_load Authorized</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#272a2e]">
              <span className="text-[#8d9197]">Active Session Hash:</span>
              <span className="text-[#e1e2e8] font-mono text-[11px]">0x7f9a...3b21</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#272a2e]">
              <span className="text-[#8d9197]">MFA Status:</span>
              <span className="text-[#aacfb6] font-mono">Hardware Security Key Verified</span>
            </div>
          </div>

          <div className="p-3 bg-[#1d2024] rounded-lg text-[11px] text-[#8d9197] leading-relaxed">
            All actions executed through this session are logged with cryptographic HMAC-SHA256 signatures in the immutable Audit Ledger.
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-lg bg-[#272a2e] text-[#e1e2e8] hover:bg-[#323539] text-[13px] font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
