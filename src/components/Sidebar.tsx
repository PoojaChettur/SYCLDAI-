import React from 'react';

export type RouteKey =
  | 'fleet'
  | 'nodes'
  | 'architecture'
  | 'control-room'
  | 'incidents'
  | 'faults'
  | 'chaos'
  | 'ab'
  | 'audit'
  | 'roi'
  | 'datasets';

interface SidebarProps {
  currentRoute: RouteKey;
  onNavigate: (route: RouteKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenDeployModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
  mobileOpen,
  onCloseMobile,
  onOpenDeployModal,
}) => {
  const navSections = [
    {
      title: 'MONITOR',
      items: [
        {
          key: 'fleet' as RouteKey,
          label: 'Fleet & Radar',
          icon: 'radar',
          badge: '14',
        },
        {
          key: 'nodes' as RouteKey,
          label: 'DaemonSet & Nodes',
          icon: 'dns',
          badge: '42',
        },
        {
          key: 'architecture' as RouteKey,
          label: 'Architecture & eBPF',
          icon: 'hub',
        },
        {
          key: 'control-room' as RouteKey,
          label: 'Control Room',
          icon: 'monitoring',
        },
        {
          key: 'incidents' as RouteKey,
          label: 'Incidents & Gates',
          icon: 'drive_file_rename_outline',
          badge: '2',
        },
      ],
    },
    {
      title: 'TEST',
      items: [
        {
          key: 'faults' as RouteKey,
          label: 'Inject Faults',
          icon: 'bolt',
        },
        {
          key: 'chaos' as RouteKey,
          label: 'Chaos Matrix',
          icon: 'grid_view',
        },
        {
          key: 'ab' as RouteKey,
          label: 'A/B Resilience',
          icon: 'mediation',
        },
      ],
    },
    {
      title: 'REPORT',
      items: [
        {
          key: 'audit' as RouteKey,
          label: 'Audit Ledger',
          icon: 'receipt_long',
        },
        {
          key: 'roi' as RouteKey,
          label: 'ROI & SLA',
          icon: 'analytics',
        },
        {
          key: 'datasets' as RouteKey,
          label: 'Datasets',
          icon: 'database',
        },
      ],
    },
  ];

  const handleItemClick = (key: RouteKey) => {
    onNavigate(key);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#111417] border-r border-[#272a2e] flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Brand Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#272a2e]/60">
            <div className="flex items-center gap-2.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 40 40"
                className="h-7 w-7 object-contain"
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
              <div className="flex flex-col">
                <span className="font-semibold text-[13px] tracking-wider text-[#e1e2e8]">
                  SCYLDAI
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#8d9197]">
                  SENTINEL AGENT
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-md text-[#c3c7cd] hover:text-[#e1e2e8] hover:bg-[#1d2024]"
              aria-label="Close sidebar"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Single-command Deploy Button in Sidebar */}
          <div className="px-3 pt-3">
            <button
              onClick={() => {
                onOpenDeployModal();
                onCloseMobile();
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#1d2024] hover:bg-[#272a2e] text-[#aacfb6] border border-[#272a2e] hover:border-[#aacfb6]/40 text-[12px] font-mono flex items-center justify-between transition-colors shadow-2xs group"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#aacfb6]">
                  download_for_offline
                </span>
                <span>Install DaemonSet</span>
              </div>
              <span className="text-[10px] text-[#8d9197] group-hover:text-[#aacfb6]">1-cmd →</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="px-3 pb-1 text-[11px] font-medium tracking-wider text-[#8d9197] uppercase">
                  {section.title}
                </div>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = currentRoute === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleItemClick(item.key)}
                        type="button"
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors text-left group ${
                          isActive
                            ? 'bg-[#1d2024] text-[#b0c9e4] border-l-2 border-[#b0c9e4]'
                            : 'text-[#c3c7cd] hover:bg-[#1d2024]/60 hover:text-[#e1e2e8]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`material-symbols-outlined text-[18px] transition-colors ${
                              isActive ? 'text-[#b0c9e4]' : 'text-[#8d9197] group-hover:text-[#c3c7cd]'
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-[#0b0e12] border border-[#272a2e] rounded text-[#8d9197]">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Engine Footer */}
        <div className="p-3 m-3 rounded-lg bg-[#0b0e12] border border-[#272a2e]">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#c3c7cd]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#aacfb6] animate-pulse"></span>
              eBPF DaemonSet Fleet
            </span>
            <span className="text-[#aacfb6] font-medium">42/42 Active</span>
          </div>
          <div className="mt-1 text-[10px] text-[#8d9197] flex items-center justify-between">
            <span>Ring Buffer 4.8MB/s</span>
            <span>Private Bank VPC</span>
          </div>
        </div>
      </aside>
    </>
  );
};
