import React, { useState, useMemo } from 'react';
import { Microservice, KernelTelemetryLog, ServiceCategory, SentinelMode } from '../types/fleet';

interface FleetRadarViewProps {
  services: Microservice[];
  selectedService: Microservice;
  onSelectService: (service: Microservice) => void;
  logs: KernelTelemetryLog[];
  mode: SentinelMode;
  onOpenTweakQuota: (service: Microservice) => void;
  onOpenExpandModal: (service: Microservice) => void;
  onTriggerProbe: (serviceId: string) => void;
  isProbing: boolean;
  onSimulateAnomaly: (serviceId: string) => void;
  onClearLogs: () => void;
}

export const FleetRadarView: React.FC<FleetRadarViewProps> = ({
  services,
  selectedService,
  onSelectService,
  logs,
  mode,
  onOpenTweakQuota,
  onOpenExpandModal,
  onTriggerProbe,
  isProbing,
  onSimulateAnomaly,
  onClearLogs,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All 14');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'nominal' | 'cycling' | 'anomalous'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'radar' | 'table'>('cards');
  const [isDrawerLocked, setIsDrawerLocked] = useState(false);
  const [isStreamPaused, setIsStreamPaused] = useState(false);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      // Category filter
      if (activeCategory !== 'All 14') {
        if (activeCategory === 'Core' && service.category !== 'Core') return false;
        if (activeCategory === 'Edge' && service.category !== 'Edge') return false;
        if (activeCategory === 'Workers' && service.category !== 'Workers') return false;
        if (activeCategory === 'Cache' && service.category !== 'Cache') return false;
      }

      // Status filter
      if (statusFilter !== 'all' && service.status !== statusFilter) {
        return false;
      }

      // Search query filter (matches name, pid, category, statusText)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = service.name.toLowerCase().includes(q);
        const matchesPid = service.pid.toString().includes(q);
        const matchesCat = service.category.toLowerCase().includes(q);
        const matchesStatus = service.statusText.toLowerCase().includes(q);
        if (!matchesName && !matchesPid && !matchesCat && !matchesStatus) {
          return false;
        }
      }

      return true;
    });
  }, [services, activeCategory, searchQuery, statusFilter]);

  // Relevant logs for selected service
  const displayedLogs = useMemo(() => {
    if (isStreamPaused) return logs.slice(-4);
    const filtered = logs.filter(
      (l) => l.serviceId === selectedService.id || l.serviceId === 'all'
    );
    return filtered.slice(-4);
  }, [logs, selectedService.id, isStreamPaused]);

  // Overall cluster metrics
  const avgHealth = useMemo(() => {
    return (services.reduce((acc, s) => acc + s.health, 0) / services.length).toFixed(1);
  }, [services]);

  const avgQuota = useMemo(() => {
    return Math.round(services.reduce((acc, s) => acc + s.cfsQuota, 0) / services.length);
  }, [services]);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* 01: Top KPI Summary Strip (4 Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* Card 1: System Integrity */}
        <div className="bg-[#1d2024] rounded-lg p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-[#272a2e] group hover:border-[#43474c] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#8d9197]">
              System Integrity
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#aacfb6]/15 text-[#aacfb6] text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#aacfb6]"></span>
              Nominal
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[24px] font-semibold text-[#e1e2e8] tracking-tight">
                {avgHealth}
              </span>
              <span className="font-mono text-[14px] text-[#8d9197]">%</span>
            </div>
            {/* Inline Sparkline SVG: Flat and steady cluster health */}
            <div className="w-24 h-6 text-[#aacfb6]">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96 24">
                <path
                  d="M0 16 L12 16 L20 15 L28 16 L36 14 L44 14 L52 15 L64 13 L76 14 L88 13 L96 13"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-[#8d9197] font-mono text-[11px]">
            <span>Cluster status</span>
            <span className="text-[#e1e2e8] font-medium">42/42 Nodes active</span>
          </div>
        </div>

        {/* Card 2: Autonomous Remediations */}
        <div className="bg-[#1d2024] rounded-lg p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-[#272a2e] group hover:border-[#43474c] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#8d9197]">
              Autonomous Remediations
            </span>
            <span className="font-mono text-[11px] text-[#aacfb6] bg-[#aacfb6]/15 px-2 py-0.5 rounded-full">
              100% Mitigated
            </span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[24px] font-semibold text-[#e1e2e8] tracking-tight">
                18
              </span>
              <span className="text-[13px] text-[#8d9197]">actions / 24h</span>
            </div>
            <div className="w-24 h-6 text-[#b0c9e4]">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96 24">
                <path
                  d="M0 22 L14 22 L18 10 L24 22 L40 22 L46 6 L52 22 L68 22 L72 14 L78 22 L96 22"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between text-[#8d9197] font-mono text-[11px]">
            <span>Avg MTTR mitigation</span>
            <span className="text-[#aacfb6] font-medium">2.8s</span>
          </div>
        </div>

        {/* Card 3: cgroup Quota Pressure */}
        <div className="bg-[#1d2024] rounded-lg p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-[#272a2e] group hover:border-[#43474c] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#8d9197]">
              cgroup CFS Quota
            </span>
            <span className="font-mono text-[11px] text-[#8d9197]">Peak 23%</span>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[24px] font-semibold text-[#e1e2e8] tracking-tight">
                {avgQuota}
              </span>
              <span className="font-mono text-[14px] text-[#8d9197]">%</span>
            </div>
            {/* Gauge bar mini visualization */}
            <div className="w-28 flex flex-col gap-1">
              <div className="h-1.5 w-full bg-[#323539] rounded-full overflow-hidden flex">
                <div
                  className="bg-[#b0c9e4] h-full rounded-full transition-all duration-500"
                  style={{ width: `${avgQuota}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-right font-mono text-[#8d9197]">
                Threshold: 85%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[#8d9197] font-mono text-[11px]">
            <span>eBPF proactive throttle</span>
            <span className="text-[#aacfb6]">Active suppression</span>
          </div>
        </div>

        {/* Card 4: Sentinel Protection */}
        <div className="bg-[#1d2024] rounded-lg p-5 flex flex-col justify-between shadow-sm relative overflow-hidden border border-[#272a2e] group hover:border-[#43474c] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#8d9197]">
              Sentinel Protection
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${mode === 'armed' ? 'bg-[#aacfb6] animate-pulse' : 'bg-[#C9A66B]'}`}></span>
              <span className={`font-mono text-[11px] ${mode === 'armed' ? 'text-[#aacfb6]' : 'text-[#C9A66B]'}`}>
                {mode === 'armed' ? 'In-Kernel' : 'Passive'}
              </span>
            </div>
          </div>

          <div className="my-3 flex items-baseline justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-semibold text-[#e1e2e8] tracking-tight capitalize">
                {mode}
              </span>
              <span className="text-[#8d9197]">/</span>
              <span className="font-mono text-[12px] text-[#8d9197]">CO-RE Live</span>
            </div>
            <span className="material-symbols-outlined text-[#b0c9e4] text-[22px]">
              verified_user
            </span>
          </div>

          <div className="flex items-center justify-between text-[#8d9197] font-mono text-[11px]">
            <span>Ring-buffer telemetry</span>
            <span className="text-[#e1e2e8]">0 drop · 4.8MB/s</span>
          </div>
        </div>
      </section>

      {/* 02: Main Control Room Console (Fleet Grid + Live Drawer Inspection Split) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Fleet Service Grid & Controls (8 Cols on XL) */}
        <div className="xl:col-span-8 flex flex-col space-y-4">
          {/* Controls & Filter Toolbar */}
          <div className="bg-[#1d2024] rounded-lg p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm border border-[#272a2e]">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-semibold text-[#e1e2e8]">Microservice Fleet</h2>
                <span className="font-mono px-2 py-0.5 rounded bg-[#323539] text-[#c3c7cd] text-[11px]">
                  prod-us-east-1
                </span>
                <span className="text-[11px] font-mono text-[#aacfb6]">
                  {filteredServices.length} visible
                </span>
              </div>
              <p className="text-[12px] text-[#8d9197] mt-0.5">
                Continuous eBPF trace vector sampling · Calm window nominal
              </p>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Category Filter Pills */}
              <div className="flex items-center bg-[#0b0e12] p-1 rounded-lg border border-[#272a2e]">
                {['All 14', 'Core', 'Edge', 'Workers', 'Cache'].map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      type="button"
                      className={`px-2.5 py-1 rounded text-[12px] font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'text-[#112c41] bg-[#7a93ac] font-semibold shadow-sm'
                          : 'text-[#c3c7cd] hover:text-[#e1e2e8]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* View Switcher (Cards / Radar / Table) */}
              <div className="flex items-center bg-[#0b0e12] p-1 rounded-lg border border-[#272a2e]">
                <button
                  onClick={() => setViewMode('cards')}
                  type="button"
                  title="Grid cards view"
                  className={`p-1 rounded transition-colors ${
                    viewMode === 'cards' ? 'bg-[#272a2e] text-[#b0c9e4]' : 'text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button
                  onClick={() => setViewMode('radar')}
                  type="button"
                  title="Radar topology topology view"
                  className={`p-1 rounded transition-colors ${
                    viewMode === 'radar' ? 'bg-[#272a2e] text-[#b0c9e4]' : 'text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">radar</span>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  type="button"
                  title="DevOps data table view"
                  className={`p-1 rounded transition-colors ${
                    viewMode === 'table' ? 'bg-[#272a2e] text-[#b0c9e4]' : 'text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">table_rows</span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative flex items-center min-w-[200px] flex-1 sm:flex-initial">
                <span className="material-symbols-outlined absolute left-2.5 text-[#8d9197] text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter PID or service..."
                  className="w-full bg-[#0b0e12] text-[#e1e2e8] font-mono pl-8 pr-7 py-1.5 rounded-lg border border-[#272a2e] focus:outline-none focus:border-[#7a93ac] text-[12px] placeholder:text-[#8d9197]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 text-[#8d9197] hover:text-[#e1e2e8] text-[12px]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Dropdown Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-[#0b0e12] text-[#c3c7cd] text-[12px] font-mono py-1.5 px-2.5 rounded-lg border border-[#272a2e] focus:outline-none focus:border-[#7a93ac] cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="nominal">Nominal Only</option>
                <option value="cycling">Cycling Only</option>
                <option value="anomalous">Anomalous Only</option>
              </select>

              {/* Quick Anomaly Simulation Button */}
              <button
                onClick={() => onSimulateAnomaly(selectedService.id)}
                type="button"
                className="px-2.5 py-1.5 rounded-lg bg-[#272a2e] hover:bg-[#323539] text-[#c3c7cd] hover:text-[#e1e2e8] border border-[#43474c] text-[11px] font-mono flex items-center gap-1 transition-colors"
                title="Inject a test anomaly on the selected service to verify eBPF self-healing"
              >
                <span className="material-symbols-outlined text-[14px] text-[#C9A66B]">
                  electric_bolt
                </span>
                <span>Test Anomaly</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: Service Cards Grid */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices.length === 0 ? (
                <div className="col-span-2 p-12 text-center bg-[#1d2024] rounded-lg border border-[#272a2e]">
                  <span className="material-symbols-outlined text-[36px] text-[#8d9197]">
                    search_off
                  </span>
                  <div className="mt-2 text-[14px] font-medium text-[#e1e2e8]">
                    No microservices match current filters
                  </div>
                  <button
                    onClick={() => {
                      setActiveCategory('All 14');
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="mt-3 px-3 py-1.5 rounded bg-[#7a93ac]/20 text-[#b0c9e4] text-[12px] font-mono hover:bg-[#7a93ac]/40 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                filteredServices.map((service) => {
                  const isSelected = selectedService.id === service.id;
                  const isHealthy = service.health >= 99;
                  const isCycling = service.status === 'cycling';
                  const isAnomalous = service.status === 'anomalous';

                  let dotColor = 'bg-[#aacfb6]';
                  if (isCycling) dotColor = 'bg-[#C9A66B] animate-pulse';
                  if (isAnomalous) dotColor = 'bg-[#ffb4ab] animate-ping';

                  return (
                    <div
                      key={service.id}
                      onClick={() => onSelectService(service)}
                      className={`bg-[#1d2024] rounded-lg p-5 cursor-pointer transition-all shadow-sm relative overflow-hidden border ${
                        isSelected
                          ? 'border-[#7a93ac] border-l-4 border-l-[#b0c9e4] bg-[#272a2e]/60 ring-1 ring-[#7a93ac]/30'
                          : 'border-[#272a2e] hover:bg-[#272a2e]/40 hover:border-[#43474c]'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`}></span>
                          <span className="font-semibold text-[14px] sm:text-[15px] text-[#e1e2e8] truncate">
                            {service.name}
                          </span>
                        </div>
                        <span className="font-mono text-[#8d9197] text-[11px] shrink-0 ml-2">
                          {service.category.toUpperCase()} · PID {service.pid}
                        </span>
                      </div>

                      {/* Exactly 3 Metrics Strip */}
                      <div className="grid grid-cols-3 gap-2 py-2 bg-[#0b0e12] rounded-lg px-3 my-2 text-center border border-[#272a2e]/40">
                        <div>
                          <span className="block text-[10px] text-[#8d9197] uppercase tracking-wider">
                            Health
                          </span>
                          <span
                            className={`font-mono text-[14px] font-semibold ${
                              isHealthy ? 'text-[#e1e2e8]' : isCycling ? 'text-[#C9A66B]' : 'text-[#ffb4ab]'
                            }`}
                          >
                            {service.health}%
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-[#8d9197] uppercase tracking-wider">
                            CFS Quota
                          </span>
                          <span
                            className={`font-mono text-[14px] font-semibold ${
                              service.cfsQuota > 30
                                ? 'text-[#ffb4ab]'
                                : service.cfsQuota > 20
                                ? 'text-[#C9A66B]'
                                : 'text-[#e1e2e8]'
                            }`}
                          >
                            {service.cfsQuota}%
                          </span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-[#8d9197] uppercase tracking-wider">
                            Memory
                          </span>
                          <span className="font-mono text-[14px] font-semibold text-[#e1e2e8]">
                            {service.memoryMb}
                            <span className="text-[#8d9197] text-[11px]">
                              /{service.memoryLimitMb}M
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Status Note */}
                      <div className="flex items-center justify-between text-[12px] text-[#c3c7cd] pt-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCycling ? 'bg-[#C9A66B]' : isAnomalous ? 'bg-[#ffb4ab]' : 'bg-[#aacfb6]'
                            } shrink-0`}
                          ></span>
                          <span className="truncate text-[#8d9197]">{service.statusText}</span>
                        </div>
                        <span
                          className={`font-mono text-[11px] shrink-0 ml-2 ${
                            isSelected ? 'text-[#b0c9e4] font-medium' : 'text-[#8d9197]'
                          }`}
                        >
                          {isSelected ? 'Inspecting ●' : service.actionText}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW MODE 2: Radar Topology Visualizer */}
          {viewMode === 'radar' && (
            <div className="bg-[#1d2024] rounded-lg p-5 border border-[#272a2e] flex flex-col items-center justify-center relative overflow-hidden min-h-[460px]">
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[13px] font-semibold text-[#e1e2e8] block">
                  eBPF Network Topology & Service Radar
                </span>
                <span className="text-[11px] font-mono text-[#8d9197]">
                  Ring buffer live telemetry · Click node to inspect
                </span>
              </div>

              {/* Radar Container SVG */}
              <div className="relative w-[340px] sm:w-[420px] h-[340px] sm:h-[420px] flex items-center justify-center my-4">
                {/* Orbital concentric rings */}
                <div className="absolute inset-0 rounded-full border border-[#272a2e]"></div>
                <div className="absolute inset-8 rounded-full border border-[#272a2e]/70"></div>
                <div className="absolute inset-16 rounded-full border border-[#272a2e]/50"></div>
                <div className="absolute inset-24 rounded-full border border-[#272a2e]/30"></div>

                {/* Radar Axis lines */}
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#272a2e]"></div>
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#272a2e]"></div>

                {/* Sweeping Radar Scanner Line */}
                <div className="absolute inset-0 animate-radar-sweep pointer-events-none">
                  <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#7a93ac]/20 via-transparent to-transparent origin-bottom-right"></div>
                </div>

                {/* Center Kernel Core Node */}
                <div className="w-12 h-12 rounded-full bg-[#111417] border-2 border-[#7a93ac] flex flex-col items-center justify-center z-10 shadow-lg">
                  <span className="material-symbols-outlined text-[18px] text-[#b0c9e4]">shield</span>
                  <span className="text-[8px] font-mono text-[#aacfb6]">eBPF</span>
                </div>

                {/* Service Nodes Placed Radially */}
                {filteredServices.map((service, index) => {
                  const angle = (index / filteredServices.length) * 2 * Math.PI;
                  const radius = 80 + (index % 3) * 55;
                  const x = 50 + (radius / 210) * 44 * Math.cos(angle);
                  const y = 50 + (radius / 210) * 44 * Math.sin(angle);
                  const isSelected = selectedService.id === service.id;

                  return (
                    <button
                      key={service.id}
                      onClick={() => onSelectService(service)}
                      type="button"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer transition-transform hover:scale-125 focus:outline-none`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                          isSelected
                            ? 'bg-[#b0c9e4] border-white scale-125 shadow-[0_0_12px_#b0c9e4]'
                            : service.status === 'cycling'
                            ? 'bg-[#C9A66B] border-[#0b0e12]'
                            : service.status === 'anomalous'
                            ? 'bg-[#ffb4ab] border-white animate-bounce'
                            : 'bg-[#191c20] border-[#aacfb6] hover:bg-[#aacfb6]/40'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            service.status === 'nominal' ? 'bg-[#aacfb6]' : 'bg-white'
                          }`}
                        ></span>
                      </div>
                      <span
                        className={`mt-1 font-mono text-[9px] px-1 py-0.2 rounded whitespace-nowrap transition-colors ${
                          isSelected
                            ? 'bg-[#b0c9e4] text-[#112c41] font-semibold'
                            : 'bg-[#0b0e12]/80 text-[#c3c7cd] group-hover:text-white'
                        }`}
                      >
                        {service.name.split('-')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] font-mono text-[#8d9197] flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#aacfb6]"></span> Nominal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C9A66B]"></span> Graceful Cycle
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ffb4ab]"></span> Anomalous
                </span>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: DevOps Data Table */}
          {viewMode === 'table' && (
            <div className="bg-[#1d2024] rounded-lg border border-[#272a2e] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[12px]">
                  <thead className="bg-[#0b0e12] border-b border-[#272a2e] text-[#8d9197] uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Service</th>
                      <th className="py-2.5 px-3">PID</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Health</th>
                      <th className="py-2.5 px-3">CFS Quota</th>
                      <th className="py-2.5 px-3">Memory</th>
                      <th className="py-2.5 px-3">Hooks</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#272a2e]/60">
                    {filteredServices.map((service) => {
                      const isSelected = selectedService.id === service.id;
                      return (
                        <tr
                          key={service.id}
                          onClick={() => onSelectService(service)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#272a2e] text-[#b0c9e4]'
                              : 'hover:bg-[#191c20] text-[#c3c7cd]'
                          }`}
                        >
                          <td className="py-2.5 px-4 font-semibold text-[#e1e2e8] flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                service.status === 'nominal'
                                  ? 'bg-[#aacfb6]'
                                  : service.status === 'cycling'
                                  ? 'bg-[#C9A66B]'
                                  : 'bg-[#ffb4ab]'
                              }`}
                            ></span>
                            {service.name}
                          </td>
                          <td className="py-2.5 px-3 text-[#8d9197]">{service.pid}</td>
                          <td className="py-2.5 px-3">{service.category}</td>
                          <td className="py-2.5 px-3 font-semibold text-[#e1e2e8]">
                            {service.health}%
                          </td>
                          <td className="py-2.5 px-3">{service.cfsQuota}%</td>
                          <td className="py-2.5 px-3">
                            {service.memoryMb}M{' '}
                            <span className="text-[#8d9197]">/{service.memoryLimitMb}M</span>
                          </td>
                          <td className="py-2.5 px-3 text-[#8d9197]">{service.ebpfHooksCount}</td>
                          <td className="py-2.5 px-3 capitalize">{service.status}</td>
                          <td className="py-2.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectService(service);
                                onOpenExpandModal(service);
                              }}
                              className="px-2 py-0.5 rounded bg-[#7a93ac]/20 hover:bg-[#7a93ac] text-[#b0c9e4] hover:text-[#112c41] transition-colors"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Slide-Out / Side Drawer Telemetry Inspection Panel (4 Cols on XL) */}
        <div className="xl:col-span-4 bg-[#1d2024] rounded-lg p-5 shadow-sm flex flex-col space-y-4 xl:sticky xl:top-20 border border-[#272a2e]">
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[15px] text-[#e1e2e8] truncate">
                  {selectedService.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#7a93ac]/20 text-[#b0c9e4] shrink-0">
                  PID {selectedService.pid}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#8d9197] mt-0.5 truncate">
                cgroup v2: {selectedService.cgroupPath}
              </span>
            </div>

            {/* Header Action Buttons (Lock, Expand) */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <button
                onClick={() => setIsDrawerLocked(!isDrawerLocked)}
                className={`p-1.5 rounded transition-colors ${
                  isDrawerLocked
                    ? 'bg-[#7a93ac] text-[#112c41]'
                    : 'text-[#8d9197] hover:text-[#e1e2e8] hover:bg-[#272a2e]'
                }`}
                title={isDrawerLocked ? 'Drawer pinned' : 'Lock drawer preview'}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">push_pin</span>
              </button>
              <button
                onClick={() => onOpenExpandModal(selectedService)}
                className="p-1.5 rounded hover:bg-[#272a2e] text-[#8d9197] hover:text-[#e1e2e8] transition-colors"
                title="Expand full view"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">open_in_full</span>
              </button>
            </div>
          </div>

          {/* Metric Details Strip (cgroup RSS, Zombie PIDs, Trace Vectors, mmap rate) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Metric Item 1: cgroup RSS */}
            <div className="bg-[#0b0e12] p-3 rounded-lg border border-[#272a2e]/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-medium text-[#8d9197]">cgroup RSS</span>
                <span className="material-symbols-outlined text-[14px] text-[#aacfb6]">memory</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-[18px] font-semibold text-[#e1e2e8]">
                  {selectedService.rssMb}
                </span>
                <span className="font-mono text-[11px] text-[#8d9197]">MB</span>
              </div>
              <div className="mt-1 h-1 bg-[#272a2e] rounded-full overflow-hidden">
                <div
                  className="bg-[#aacfb6] h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (selectedService.rssMb / selectedService.memoryLimitMb) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <span className="text-[10px] font-mono text-[#8d9197] mt-1.5 block">
                Anon: {selectedService.anonMb}M · File: {selectedService.fileMb}M
              </span>
            </div>

            {/* Metric Item 2: Zombie PIDs */}
            <div className="bg-[#0b0e12] p-3 rounded-lg border border-[#272a2e]/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-medium text-[#8d9197]">Zombie PIDs</span>
                <span className="material-symbols-outlined text-[14px] text-[#aacfb6]">
                  group_work
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-[18px] font-semibold text-[#aacfb6]">
                  {selectedService.zombiePids}
                </span>
                <span className="font-mono text-[11px] text-[#8d9197]">orphans</span>
              </div>
              <div className="mt-1 h-1 bg-[#272a2e] rounded-full overflow-hidden">
                <div className="bg-[#aacfb6] h-full rounded-full" style={{ width: '0%' }}></div>
              </div>
              <span className="text-[10px] font-mono text-[#aacfb6] mt-1.5 block">
                Subtree reap clean
              </span>
            </div>

            {/* Metric Item 3: eBPF Hooks */}
            <div className="bg-[#0b0e12] p-3 rounded-lg border border-[#272a2e]/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-medium text-[#8d9197]">eBPF Hooks</span>
                <span className="material-symbols-outlined text-[14px] text-[#b0c9e4]">
                  alt_route
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-[18px] font-semibold text-[#e1e2e8]">
                  {selectedService.ebpfHooksCount}
                </span>
                <span className="font-mono text-[11px] text-[#8d9197]">probes</span>
              </div>
              <div className="mt-1 flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#aacfb6] shrink-0"></span>
                <span className="text-[10px] font-mono text-[#c3c7cd] truncate">
                  {selectedService.hooks[0] || 'kprobe:sys_enter'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#8d9197] block mt-0.5 truncate">
                kretprobe · tracepoint
              </span>
            </div>

            {/* Metric Item 4: mmap Allocation Rate */}
            <div className="bg-[#0b0e12] p-3 rounded-lg border border-[#272a2e]/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-medium text-[#8d9197]">
                  mmap Allocation
                </span>
                <span className="material-symbols-outlined text-[14px] text-[#b0c9e4]">speed</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-[18px] font-semibold text-[#e1e2e8]">
                  {selectedService.mmapRatePagesPerSec}
                </span>
                <span className="font-mono text-[11px] text-[#8d9197]">pages/s</span>
              </div>
              <div className="mt-1 h-1 bg-[#272a2e] rounded-full overflow-hidden">
                <div
                  className="bg-[#b0c9e4] h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, selectedService.mmapRatePagesPerSec * 2)}%`,
                  }}
                ></div>
              </div>
              <span className="text-[10px] font-mono text-[#8d9197] mt-1.5 block">
                VMA frag: {selectedService.vmaFragmentation}%
              </span>
            </div>
          </div>

          {/* Telemetry Recessed Log Terminal Pane */}
          <div className="bg-[#0b0e12] rounded-lg p-3.5 flex flex-col font-mono text-[12px] space-y-2 border border-[#272a2e]">
            <div className="flex items-center justify-between text-[#8d9197] text-[11px] pb-1.5 border-b border-[#272a2e]">
              <span className="flex items-center gap-1.5 text-[#e1e2e8] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#aacfb6] animate-pulse"></span>
                Kernel Ring-Buffer Telemetry Stream
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStreamPaused(!isStreamPaused)}
                  className="hover:text-[#e1e2e8] transition-colors"
                  title={isStreamPaused ? 'Resume stream' : 'Pause stream'}
                >
                  {isStreamPaused ? '▶' : '⏸'}
                </button>
                <button
                  onClick={onClearLogs}
                  className="hover:text-[#e1e2e8] transition-colors"
                  title="Clear buffer view"
                >
                  clear
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] leading-relaxed max-h-48 overflow-y-auto">
              {displayedLogs.map((log) => (
                <div key={log.id} className="text-[#c3c7cd] hover:text-white transition-colors">
                  <span className="text-[#8d9197]">{log.timestamp}</span>
                  <span
                    className={`ml-1 font-semibold ${
                      log.probeType === 'kprobe'
                        ? 'text-[#aacfb6]'
                        : log.probeType === 'bpf'
                        ? 'text-[#b0c9e4]'
                        : log.probeType === 'tc'
                        ? 'text-[#aacfb6]'
                        : 'text-[#C9A66B]'
                    }`}
                  >
                    {log.probe}
                  </span>
                  <span className="ml-1 text-[#e1e2e8]">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Remediation Control Actions */}
          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={() => onOpenTweakQuota(selectedService)}
              type="button"
              className="flex-1 py-2 px-3 rounded-lg bg-[#272a2e] hover:bg-[#323539] text-[#e1e2e8] text-[13px] font-medium flex items-center justify-center gap-2 transition-colors border border-[#43474c] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px] text-[#b0c9e4]">tune</span>
              <span>Tweak Quota</span>
            </button>

            <button
              onClick={() => onTriggerProbe(selectedService.id)}
              disabled={isProbing}
              type="button"
              className="flex-1 py-2 px-3 rounded-lg bg-[#7a93ac] text-[#112c41] hover:bg-[#b0c9e4] font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isProbing ? 'animate-spin' : ''
                }`}
              >
                restart_alt
              </span>
              <span>{isProbing ? 'Probing...' : 'Force Health Probe'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
