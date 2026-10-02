import React from 'react';
import { SentinelMode, ClusterRegion, ControlPlaneHosting } from '../types/fleet';

interface HeaderProps {
  mode: SentinelMode;
  onToggleMode: (newMode: SentinelMode) => void;
  onOpenTerminal: () => void;
  onOpenClusterModal: () => void;
  onOpenProfileModal: () => void;
  onOpenDeployModal: () => void;
  onOpenDemoTour: () => void;
  onOpenCloudConnect: () => void;
  onOpenApprovalModal: () => void;
  pendingApprovalsCount: number;
  hosting: ControlPlaneHosting;
  currentCluster: ClusterRegion;
  healthyCount: number;
  totalServicesCount: number;
  lastFixText: string;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onToggleMode,
  onOpenTerminal,
  onOpenClusterModal,
  onOpenProfileModal,
  onOpenDeployModal,
  onOpenDemoTour,
  onOpenCloudConnect,
  onOpenApprovalModal,
  pendingApprovalsCount,
  hosting,
  currentCluster,
  healthyCount,
  totalServicesCount,
  lastFixText,
  onToggleMobileSidebar,
}) => {
  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-[#191c20]/95 backdrop-blur-xl z-40 shadow-[0_1px_8px_rgba(0,0,0,0.25)] px-3 sm:px-6 flex items-center justify-between border-b border-[#272a2e]">
      {/* Left: Mobile Menu Toggle + Logo & Status */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-[#c3c7cd] hover:text-[#e1e2e8] hover:bg-[#272a2e] transition-colors focus:outline-none"
          aria-label="Toggle navigation menu"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Brand Shield Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 40 40"
            className="h-8 w-8 object-contain shrink-0"
            fill="none"
          >
            <path
              d="M20 4L7 9.5V20.5C7 28.5 12.6 35.8 20 38C27.4 35.8 33 28.5 33 20.5V9.5L20 4Z"
              stroke="#7A93AC"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="#23272C"
            />
            <path
              d="M20 12V28M13 20H27"
              stroke="#7FA38B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="3" fill="#E3E1DB" />
          </svg>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[13px] sm:text-[15px] text-[#e1e2e8] tracking-tight leading-none font-sans truncate">
                ScyldAI SENTINEL
              </span>
              <span className="hidden xl:inline-block font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#0b0e12] border border-[#272a2e] text-[#aacfb6]">
                {hosting === 'customer-vpc' ? 'Private Bank/Hospital VPC' : 'Air-Gapped Cloud'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] sm:text-[12px] text-[#c3c7cd] font-mono truncate">
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  mode === 'armed'
                    ? 'bg-[#aacfb6] animate-pulse'
                    : mode === 'gated'
                    ? 'bg-[#C9A66B]'
                    : 'bg-[#d4a373]'
                }`}
              ></span>
              <span className="text-[#e1e2e8] font-medium">
                {healthyCount}/{totalServicesCount} healthy
              </span>
              <span className="text-[#8d9197]">·</span>
              <span className="text-[#c3c7cd] hidden sm:inline">{lastFixText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* INTERACTIVE DEMO BUTTON (Friendly & Highlighted) */}
        <button
          onClick={onOpenDemoTour}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#aacfb6]/20 hover:bg-[#aacfb6] text-[#aacfb6] hover:text-[#153725] border border-[#aacfb6]/40 text-[11px] sm:text-[12px] font-semibold transition-all shadow-xs cursor-pointer group"
          type="button"
          title="Start interactive guided walkthrough in simple English"
        >
          <span className="material-symbols-outlined text-[16px] text-[#aacfb6] group-hover:text-[#153725]">
            play_circle
          </span>
          <span>Start Demo</span>
        </button>

        {/* CONNECT COMPANY CLOUD BUTTON */}
        <button
          onClick={onOpenCloudConnect}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#7a93ac] hover:bg-[#b0c9e4] text-[#112c41] font-semibold text-[11px] sm:text-[12px] transition-all shadow-xs cursor-pointer"
          type="button"
          title="Connect your AWS, GCP, Azure or Kubernetes cluster prototype"
        >
          <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
          <span className="hidden sm:inline">Connect Cloud</span>
        </button>

        {/* HUMAN APPROVAL BUTTON (Unmissable answer to "where will I give human approval") */}
        <button
          onClick={onOpenApprovalModal}
          type="button"
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-[12px] font-semibold transition-all cursor-pointer ${
            pendingApprovalsCount > 0
              ? 'bg-[#C9A66B]/25 hover:bg-[#C9A66B] text-[#C9A66B] hover:text-[#191c20] border-2 border-[#C9A66B] shadow-md animate-pulse font-bold'
              : 'bg-[#1d2024] hover:bg-[#272a2e] text-[#c3c7cd] hover:text-[#e1e2e8] border border-[#272a2e]'
          }`}
          title="Human Approval Center — Authorize or reject in-kernel fixes"
        >
          <span className="material-symbols-outlined text-[16px] text-[#C9A66B]">
            verified_user
          </span>
          <span className="hidden sm:inline">Human Approval</span>
          {pendingApprovalsCount > 0 ? (
            <span className="px-1.5 py-0.2 rounded-full bg-[#C9A66B] text-[#191c20] text-[10px] font-mono font-bold">
              {pendingApprovalsCount}
            </span>
          ) : (
            <span className="text-[10px] font-mono text-[#aacfb6] hidden xl:inline">0</span>
          )}
        </button>

        {/* 3-Way Mode Switcher: Armed | Gated | Dry-run */}
        <div className="hidden md:flex items-center bg-[#0b0e12] p-0.5 rounded-lg border border-[#272a2e]">
          <button
            onClick={() => onToggleMode('armed')}
            type="button"
            className={`px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-[12px] font-medium transition-all ${
              mode === 'armed'
                ? 'bg-[#7a93ac] text-[#112c41] font-semibold shadow-xs'
                : 'text-[#c3c7cd] hover:text-[#e1e2e8]'
            }`}
            title="ARMED: Full automated remediation via eBPF & K8s API"
          >
            Armed
          </button>
          <button
            onClick={() => onToggleMode('gated')}
            type="button"
            className={`px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-[12px] font-medium transition-all ${
              mode === 'gated'
                ? 'bg-[#C9A66B] text-[#191c20] font-semibold shadow-xs'
                : 'text-[#c3c7cd] hover:text-[#e1e2e8]'
            }`}
            title="GATED: Human-approval required for all remediations"
          >
            Gated
          </button>
          <button
            onClick={() => onToggleMode('dry-run')}
            type="button"
            className={`px-2 sm:px-2.5 py-1 rounded text-[11px] sm:text-[12px] font-medium transition-all ${
              mode === 'dry-run'
                ? 'bg-[#d4a373] text-[#191c20] font-semibold shadow-xs'
                : 'text-[#c3c7cd] hover:text-[#e1e2e8]'
            }`}
            title="DRY-RUN: Passive observation with 0 Kubernetes mutation"
          >
            Dry-run
          </button>
        </div>

        {/* Ask Sentinel CLI Terminal Trigger */}
        <button
          onClick={onOpenTerminal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1d2024] border border-[#272a2e] text-[#cde5ff] text-[11px] sm:text-[12px] font-medium hover:bg-[#272a2e] transition-all cursor-pointer"
          type="button"
          title="Open Sentinel interactive eBPF diagnostic terminal"
        >
          <span className="material-symbols-outlined text-[15px] text-[#b0c9e4]">terminal</span>
          <span className="hidden xl:inline">Ask Sentinel</span>
        </button>

        {/* Cluster Region Switcher */}
        <button
          onClick={onOpenClusterModal}
          className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1d2024] border border-[#272a2e] text-[#e1e2e8] font-mono text-[11px] hover:bg-[#272a2e] transition-all"
          type="button"
          title="Switch cluster region"
        >
          <span className="material-symbols-outlined text-[15px] text-[#b0c9e4]">lan</span>
          <span className="max-w-[85px] truncate">{currentCluster.name}</span>
        </button>

        {/* User Profile */}
        <button
          onClick={onOpenProfileModal}
          type="button"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#323539] hover:bg-[#43474c] border border-[#7a93ac]/30 flex items-center justify-center transition-all cursor-pointer ml-0.5"
          title="Operator Profile & RBAC Clearance"
          aria-label="Operator profile"
        >
          <span className="material-symbols-outlined text-[#b0c9e4] text-[16px] sm:text-[18px]">person</span>
        </button>
      </div>
    </header>
  );
};
