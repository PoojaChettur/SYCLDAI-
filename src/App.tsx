import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, RouteKey } from './components/Sidebar';
import { FleetRadarView } from './views/FleetRadarView';
import { NodesView } from './views/NodesView';
import { ControlRoomView } from './views/ControlRoomView';
import { IncidentsView } from './views/IncidentsView';
import { FaultsView } from './views/FaultsView';
import { ChaosMatrixView } from './views/ChaosMatrixView';
import { AbResilienceView } from './views/AbResilienceView';
import { AuditLedgerView } from './views/AuditLedgerView';
import { RoiSlaView } from './views/RoiSlaView';
import { DatasetsView } from './views/DatasetsView';
import { AskSentinelModal } from './components/AskSentinelModal';
import { TweakQuotaModal } from './components/TweakQuotaModal';
import { ExpandTelemetryModal } from './components/ExpandTelemetryModal';
import { ClusterRegionModal } from './components/ClusterRegionModal';
import { UserProfileModal } from './components/UserProfileModal';
import { InstallDaemonSetModal } from './components/InstallDaemonSetModal';
import { CloudConnectModal } from './components/CloudConnectModal';
import { InteractiveDemoTour } from './components/InteractiveDemoTour';
import { AiChatbot } from './components/AiChatbot';
import { HumanApprovalModal } from './components/HumanApprovalModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  INITIAL_SERVICES,
  INITIAL_LOGS,
  CLUSTER_REGIONS,
  INITIAL_INCIDENTS,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { COMPANY_PRESETS } from './data/companyPresets';
import {
  Microservice,
  SentinelMode,
  ControlPlaneHosting,
  ClusterRegion,
  KernelTelemetryLog,
  IncidentGate,
  AuditRecord,
} from './types/fleet';

export default function App() {
  // Navigation Route State
  const [currentRoute, setCurrentRoute] = useState<RouteKey>('fleet');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active Company Cloud & Sandbox State
  const [activeCompanyName, setActiveCompanyName] = useState<string>('Acme Global Financial Corp');
  const [isSandboxActive, setIsSandboxActive] = useState<boolean>(true);

  // Core Data States
  const [services, setServices] = useState<Microservice[]>(COMPANY_PRESETS[1].services);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(COMPANY_PRESETS[1].services[0].id);
  const [logs, setLogs] = useState<KernelTelemetryLog[]>(INITIAL_LOGS);
  const [mode, setMode] = useState<SentinelMode>('gated'); // Default to Gated so human approval is immediately ready to try!
  const [hosting, setHosting] = useState<ControlPlaneHosting>('customer-vpc');
  const [currentCluster, setCurrentCluster] = useState<ClusterRegion>(COMPANY_PRESETS[1].cluster);

  // Initial pending incident gate for immediate human-approval testing
  const [incidents, setIncidents] = useState<IncidentGate[]>([
    {
      id: 'GATE-2026-0982',
      serviceId: COMPANY_PRESETS[1].services[0].id,
      serviceName: COMPANY_PRESETS[1].services[0].name,
      title: 'cgroup CFS quota burst mitigation pending approval',
      description: 'Transaction volume surge pushed cgroup CPU allocation past 75% threshold.',
      severity: 'HIGH',
      status: 'PENDING_GATE',
      detectedAt: 'Just now',
      rootCause: 'Batch transaction serialization peak in node worker thread #4',
      ebpfActionTaken: 'Sentinel throttler prepared sub-second memory drain and quota pacing.',
      ebpfProposedFix: 'Clamp CFS slice allocations to 22% and free 42MB inactive cache without container restart.',
    },
    ...INITIAL_INCIDENTS,
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);

  // Modals & Panels
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isTweakQuotaOpen, setIsTweakQuotaOpen] = useState(false);
  const [isExpandModalOpen, setIsExpandModalOpen] = useState(false);
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isCloudConnectOpen, setIsCloudConnectOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [demoTourStep, setDemoTourStep] = useState(1);
  const [targetTweakService, setTargetTweakService] = useState<Microservice | null>(null);

  // Probing and Toast notifications
  const [isProbing, setIsProbing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Selected microservice object
  const selectedService =
    services.find((s) => s.id === selectedServiceId) || services[0];

  // Pending Human Approval Gates
  const pendingGates = incidents.filter((inc) => inc.status === 'PENDING_GATE');

  // Helper to add toast
  const addToast = useCallback(
    (type: ToastMessage['type'], title: string, message: string) => {
      const newToast: ToastMessage = {
        id: `toast-${Date.now()}-${Math.random()}`,
        type,
        title,
        message,
      };
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Route mapping based on hash in URL
  const applyRouteFromHash = useCallback(() => {
    const raw = window.location.hash.replace(/^#\/?/, '').trim();
    if (!raw) {
      setCurrentRoute('fleet');
      return;
    }
    const clean = raw.toLowerCase();
    if (clean === 'fleet' || clean === 'fleet-radar') {
      setCurrentRoute('fleet');
    } else if (clean === 'nodes' || clean === 'daemonset' || clean === 'servers') {
      setCurrentRoute('nodes');
    } else if (clean === 'control-room' || clean === 'control') {
      setCurrentRoute('control-room');
    } else if (clean === 'incidents' || clean === 'incidents-gates' || clean === 'gates') {
      setCurrentRoute('incidents');
    } else if (clean === 'faults' || clean === 'inject-faults' || clean === 'fault-injection') {
      setCurrentRoute('faults');
    } else if (clean === 'chaos' || clean === 'chaos-matrix') {
      setCurrentRoute('chaos');
    } else if (clean === 'ab' || clean === 'ab-resilience' || clean === 'resilience-ab') {
      setCurrentRoute('ab');
    } else if (clean === 'audit' || clean === 'audit-ledger') {
      setCurrentRoute('audit');
    } else if (clean === 'roi' || clean === 'roi-sla') {
      setCurrentRoute('roi');
    } else if (clean === 'datasets') {
      setCurrentRoute('datasets');
    } else {
      setCurrentRoute('fleet');
    }
  }, []);

  useEffect(() => {
    applyRouteFromHash();
    window.addEventListener('hashchange', applyRouteFromHash);
    return () => window.removeEventListener('hashchange', applyRouteFromHash);
  }, [applyRouteFromHash]);

  const navigateTo = (route: RouteKey) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
  };

  // Switch Sentinel Mode (Armed vs Gated vs Dry-run)
  const handleToggleMode = (newMode: SentinelMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    const time = new Date().toISOString().substring(11, 19);

    if (newMode === 'armed') {
      addToast(
        'success',
        'Sentinel ARMED Mode Active',
        'Full autonomous remediation: In-kernel eBPF proactive throttle and sub-second auto-stabilization enabled.'
      );
    } else if (newMode === 'gated') {
      addToast(
        'warning',
        'Human-Approval GATED Mode Active',
        'Remediations will pause and require your approval in Incidents & Approval Gates.'
      );
    } else {
      addToast(
        'warning',
        'DRY-RUN Mode Active',
        'Sentinel will passively observe eBPF tracepoints without modifying cgroups or invoking K8s mutations.'
      );
    }

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: `${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`,
        operator: 'sit24sc025@sairamtap.edu.in',
        action: `Execution Mode Shifted to ${newMode.toUpperCase()}`,
        targetService: `${activeCompanyName} Nodes (${currentCluster.activeNodes})`,
        pid: 0,
        result: 'SUCCESS',
        signatureHash: Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        details: `RBAC execution policy set to ${newMode}. Kernel BPF maps and K8s admission controllers synchronized.`,
      },
      ...prev,
    ]);

    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        timestamp: time,
        probe: '[bpf_prog_sentinel]',
        probeType: 'bpf',
        serviceId: 'all',
        message: `RBAC mode shifted to ${newMode.toUpperCase()} by operator.`,
      },
    ]);
  };

  // Periodic subtle live kernel stream ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toISOString().substring(11, 19) + '.' + String(now.getMilliseconds()).padStart(3, '0');
      const randomService = services[Math.floor(Math.random() * services.length)];

      const possibleEvents = [
        {
          probe: '[kprobe:cgroup_rstat]',
          type: 'kprobe' as const,
          msg: `cgroup v2 CPU CFS slice verified: 0 periods throttled across ${currentCluster.activeNodes} nodes`,
        },
        {
          probe: '[tc:cls_bpf]',
          type: 'tc' as const,
          msg: `Egress packet flow pacing verified optimal · In-kernel BPF map active`,
        },
        {
          probe: '[isolation_forest]',
          type: 'isolation_forest' as const,
          msg: `Sliding baseline check nominal (score: 0.0${Math.floor(Math.random() * 5 + 1)})`,
        },
        {
          probe: '[bpf_prog_sentinel]',
          type: 'bpf' as const,
          msg: `DaemonSet keepalive heartbeat acked from ${currentCluster.name}-worker-${Math.floor(Math.random() * 42 + 1)}`,
        },
      ];

      const chosen = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];

      setLogs((prev) => [
        ...prev.slice(-30),
        {
          id: `log-stream-${Date.now()}`,
          timestamp: timeStr,
          probe: chosen.probe,
          probeType: chosen.type,
          serviceId: randomService.id,
          message: `${randomService.name}: ${chosen.msg}`,
        },
      ]);
    }, 8500);

    return () => clearInterval(interval);
  }, [services, currentCluster]);

  // Handle Force Health Probe action
  const handleTriggerProbe = (serviceId: string) => {
    setIsProbing(true);
    const target = services.find((s) => s.id === serviceId) || selectedService;

    setTimeout(() => {
      setIsProbing(false);
      const timeStr = new Date().toISOString().substring(11, 19);
      const latency = (0.8 + Math.random() * 0.6).toFixed(2);

      setLogs((prev) => [
        ...prev,
        {
          id: `probe-${Date.now()}`,
          timestamp: timeStr,
          probe: '[kprobe:sys_enter]',
          probeType: 'kprobe',
          serviceId: target.id,
          message: `Synthetic probe completed: Latency ${latency}ms · 0 drops across ${currentCluster.activeNodes} DaemonSet agents`,
        },
      ]);

      setAuditLogs((prev) => [
        {
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: `${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`,
          operator: 'sit24sc025@sairamtap.edu.in',
          action: 'Force Health Probe Run',
          targetService: target.name,
          pid: target.pid,
          result: 'SUCCESS',
          signatureHash: Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join(''),
          details: `Manual in-kernel health probe confirmed on ${activeCompanyName}. Latency: ${latency}ms.`,
        },
        ...prev,
      ]);

      addToast(
        'success',
        `Health Probe Verified: ${target.name}`,
        `In-kernel response: ${latency}ms. All ${currentCluster.activeNodes} DaemonSet nodes active and verified.`
      );
    }, 600);
  };

  // Handle Tweak Quota Save
  const handleSaveTweakQuota = (serviceId: string, updates: Partial<Microservice>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, ...updates } : s))
    );

    const s = services.find((srv) => srv.id === serviceId);

    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: `${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`,
        operator: 'sit24sc025@sairamtap.edu.in',
        action: 'Manual cgroup CFS Quota Rebalance',
        targetService: s?.name || serviceId,
        pid: s?.pid || 0,
        result: 'SUCCESS',
        signatureHash: Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join(''),
        details: `CFS Quota adjusted to ${updates.cfsQuota}%, Period: ${updates.cfsPeriodMs}ms, Memory: ${updates.memoryLimitMb}MB.`,
      },
      ...prev,
    ]);

    addToast(
      'success',
      'cgroup eBPF Quota Applied',
      `Tuned ${s?.name || serviceId} to ${updates.cfsQuota}% CFS limit (${updates.cfsPeriodMs}ms period).`
    );
  };

  // Handle Simulating Anomaly / Chaos Injection
  const handleSimulateAnomaly = (serviceId?: string) => {
    const target = services.find((s) => s.id === serviceId) || selectedService;

    setServices((prev) =>
      prev.map((s) =>
        s.id === target.id
          ? {
              ...s,
              status: 'anomalous',
              health: 94.2,
              cfsQuota: 68,
              statusText: 'Temporary CFS surge detected · Sentinel mitigation triggered',
            }
          : s
      )
    );

    addToast(
      'warning',
      `Anomaly Injected: ${target.name}`,
      `Simulated CPU spike (CFS 68%). Watching Sentinel self-healing...`
    );

    const timeStr = new Date().toISOString().substring(11, 19);
    setLogs((prev) => [
      ...prev,
      {
        id: `anom-${Date.now()}`,
        timestamp: timeStr,
        probe: '[isolation_forest]',
        probeType: 'isolation_forest',
        serviceId: target.id,
        message: `Anomalous pattern detected on PID ${target.pid}: CFS burst 68% > threshold`,
      },
    ]);

    // If in GATED mode, create a pending approval gate!
    if (mode === 'gated') {
      const newGate: IncidentGate = {
        id: `GATE-${Date.now().toString().slice(-4)}`,
        serviceId: target.id,
        serviceName: target.name,
        title: `CFS Quota Spike on ${target.name}`,
        description: `Sudden heap expansion under surge traffic exceeded threshold (68%).`,
        severity: 'HIGH',
        status: 'PENDING_GATE',
        detectedAt: 'Just now',
        rootCause: 'Worker thread memory allocation burst',
        ebpfActionTaken: 'Sentinel eBPF throttler prepared memory drain and quota pacing.',
        ebpfProposedFix: `Clamp CFS quota to 20% and drain 38MB inactive memory on ${target.name}.`,
      };
      setIncidents((prev) => [newGate, ...prev]);
      addToast(
        'warning',
        'Human Approval Required!',
        `Incident gate created for ${target.name}. Please approve to execute eBPF fix.`
      );
    } else {
      // In Armed mode, auto-heal in 3 seconds!
      setTimeout(() => {
        setServices((prev) =>
          prev.map((s) =>
            s.id === target.id
              ? {
                  ...s,
                  status: 'nominal',
                  health: 99.8,
                  cfsQuota: 16,
                  statusText: 'Auto-stabilized via sub-second memory drain · just now',
                }
              : s
          )
        );

        const healTime = new Date().toISOString().substring(11, 19);
        setLogs((prev) => [
          ...prev,
          {
            id: `heal-${Date.now()}`,
            timestamp: healTime,
            probe: '[bpf_prog_sentinel]',
            probeType: 'bpf',
            serviceId: target.id,
            message: `Autonomous in-kernel mitigation complete: Freed cgroup pressure in 340ms`,
          },
        ]);

        addToast(
          'success',
          `Auto-Stabilized: ${target.name}`,
          'Sentinel eBPF clamped burst and returned service to 99.8% health in 340ms.'
        );
      }, 3200);
    }
  };

  // Handle Human Approval Gate Execution (Approve / Reject)
  const handleUpdateIncidentStatus = (id: string, status: IncidentGate['status']) => {
    const targetInc = incidents.find((i) => i.id === id);

    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status } : inc))
    );

    if (status === 'APPROVED' && targetInc) {
      // Heal the corresponding microservice!
      setServices((prev) =>
        prev.map((s) =>
          s.id === targetInc.serviceId
            ? {
                ...s,
                status: 'nominal',
                health: 99.8,
                cfsQuota: 16,
                statusText: 'Human approval granted · eBPF mitigation applied successfully',
              }
            : s
        )
      );

      setAuditLogs((prev) => [
        {
          id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: `${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`,
          operator: 'sit24sc025@sairamtap.edu.in (Human Sign-off)',
          action: `Gate Approved: ${targetInc.title}`,
          targetService: targetInc.serviceName,
          pid: targetInc.serviceId ? 18420 : 0,
          result: 'SUCCESS',
          signatureHash: Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join(''),
          details: `Operator manually approved eBPF remediation for ${targetInc.id}. Pod stabilized without restart.`,
        },
        ...prev,
      ]);

      addToast(
        'success',
        '✅ Human Approval Executed',
        `Remediation approved for ${targetInc.serviceName}! In-kernel cgroup clamp applied.`
      );
    } else if (status === 'REJECTED' && targetInc) {
      addToast('info', 'Gate Rejected', `Incident ${id} rejected. No changes made to cluster.`);
    }
  };

  // Trigger test gated incident so user can try Human Approval anytime
  const handleTriggerGatedIncident = () => {
    const target = services[0];
    const newGate: IncidentGate = {
      id: `GATE-${Date.now().toString().slice(-4)}`,
      serviceId: target.id,
      serviceName: target.name,
      title: `High Memory Pressure on ${target.name}`,
      description: `Worker threads breached 80% RAM threshold. eBPF proposes freeing 42MB inactive cache.`,
      severity: 'HIGH',
      status: 'PENDING_GATE',
      detectedAt: 'Just now',
      rootCause: 'Sliding window baseline anomaly score: 0.72',
      ebpfActionTaken: 'Sentinel eBPF throttler staged slab drain and socket pacing.',
      ebpfProposedFix: `Free 42MB inactive heap cache and clamp CFS period to 100ms.`,
    };

    setIncidents((prev) => [newGate, ...prev]);
    addToast(
      'warning',
      '🚨 Approval Gate Created!',
      `You can approve it right now in the banner above or in the AI Chatbot.`
    );
  };

  // Handle Connect Company Preset (Transfers the ENTIRE website to match that company's cloud!)
  const handleConnectCompanyPreset = (preset: {
    cluster: ClusterRegion;
    services: Microservice[];
    companyName: string;
  }) => {
    setCurrentCluster(preset.cluster);
    setServices(preset.services);
    setSelectedServiceId(preset.services[0].id);
    setActiveCompanyName(preset.companyName);
    setIsSandboxActive(true);
    setHosting('customer-vpc');

    addToast(
      'success',
      `Connected: ${preset.companyName}!`,
      `Website updated to match ${preset.cluster.name} (${preset.cluster.location}). 14 company microservices live.`
    );
  };

  // Number of healthy services
  const healthyCount = services.filter((s) => s.health >= 99).length;

  return (
    <div className="min-h-screen bg-[#111417] text-[#e1e2e8] flex flex-col font-sans">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Top Application Header */}
      <Header
        mode={mode}
        onToggleMode={handleToggleMode}
        onOpenTerminal={() => setIsAiChatOpen(true)}
        onOpenClusterModal={() => setIsCloudConnectOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenDemoTour={() => {
          setDemoTourStep(1);
          setIsDemoTourOpen(true);
        }}
        onOpenCloudConnect={() => setIsCloudConnectOpen(true)}
        onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
        pendingApprovalsCount={pendingGates.length}
        hosting={hosting}
        currentCluster={currentCluster}
        healthyCount={healthyCount}
        totalServicesCount={services.length}
        lastFixText="last auto-fix 6 min ago"
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        pendingApprovalsCount={pendingGates.length}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen pt-16">
        {/* PROMINENT HUMAN APPROVAL ALERT BAR (Answers "where will I give human approval") */}
        {pendingGates.length > 0 && (
          <div className="bg-[#C9A66B]/20 border-b-2 border-[#C9A66B] px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[13px] animate-in slide-in-from-top duration-200 shadow-md">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#C9A66B] text-[22px] animate-bounce">
                warning
              </span>
              <div>
                <span className="font-bold text-[#e1e2e8]">
                  Human Approval Required ({pendingGates.length} pending):
                </span>
                <span className="text-[#C9A66B] ml-1.5 font-medium">
                  {pendingGates[0].title} on <strong>{pendingGates[0].serviceName}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleUpdateIncidentStatus(pendingGates[0].id, 'APPROVED')}
                className="px-4 py-1.5 rounded-lg bg-[#aacfb6] hover:bg-[#c5ecd1] text-[#153725] font-bold text-[12px] shadow-sm transition-all hover:scale-105 flex items-center gap-1 cursor-pointer"
              >
                <span>✅ Click to Approve Fix</span>
              </button>
              <button
                onClick={() => handleUpdateIncidentStatus(pendingGates[0].id, 'REJECTED')}
                className="px-3 py-1.5 rounded-lg bg-[#272a2e] text-[#ffb4ab] hover:bg-[#ffb4ab]/20 text-[12px] font-medium transition-colors cursor-pointer"
              >
                <span>Reject</span>
              </button>
              <button
                onClick={() => navigateTo('incidents')}
                className="px-2.5 py-1.5 rounded-lg text-[#b0c9e4] hover:underline text-[12px] font-mono"
              >
                View Gates Tab →
              </button>
            </div>
          </div>
        )}

        {/* Clear Sandbox Status Banner */}
        <div className="bg-[#0b0e12] border-b border-[#272a2e] px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#aacfb6]/20 border border-[#aacfb6]/40 text-[#aacfb6] font-mono text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#aacfb6] animate-pulse"></span>
              SANDBOX SIMULATION ACTIVE
            </span>
            <span className="text-[#e1e2e8] font-semibold">
              {activeCompanyName}
            </span>
            <span className="text-[#8d9197]">({currentCluster.location})</span>
            <span className="text-[#8d9197] hidden md:inline">·</span>
            <span className="text-[#b0c9e4] font-mono hidden md:inline">
              {currentCluster.activeNodes} Nodes Attached · eBPF Sentinel v4.18
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCloudConnectOpen(true)}
              className="px-2.5 py-1 rounded bg-[#1d2024] hover:bg-[#272a2e] text-[#b0c9e4] border border-[#272a2e] text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
              <span>Switch Company Cloud</span>
            </button>
            <button
              onClick={() => {
                setDemoTourStep(1);
                setIsDemoTourOpen(true);
              }}
              className="px-2.5 py-1 rounded bg-[#aacfb6]/15 hover:bg-[#aacfb6] text-[#aacfb6] hover:text-[#153725] border border-[#aacfb6]/40 font-semibold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>▶ 1-Min Guided Demo</span>
            </button>
          </div>
        </div>

        {/* Mode Notification Banners */}
        {mode === 'dry-run' && (
          <div className="bg-[#d4a373]/15 border-b border-[#d4a373]/30 px-6 py-2 flex items-center justify-between text-[12px] text-[#d4a373]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>
                <strong>Dry-run Mode Active:</strong> DaemonSet agents are reading kernel tracepoints without applying automated quota clamps.
              </span>
            </div>
            <button
              onClick={() => handleToggleMode('armed')}
              className="text-[#e1e2e8] font-mono underline hover:text-white"
            >
              Arm Sentinel Now →
            </button>
          </div>
        )}

        {mode === 'gated' && pendingGates.length === 0 && (
          <div className="bg-[#C9A66B]/15 border-b border-[#C9A66B]/30 px-6 py-2 flex items-center justify-between text-[12px] text-[#C9A66B]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>
                <strong>Human-Approval (Gated) Mode Active:</strong> Any detected anomalies will pause and require your approval before eBPF takes action.
              </span>
            </div>
            <button
              onClick={handleTriggerGatedIncident}
              className="text-[#e1e2e8] font-mono underline hover:text-white"
            >
              Test Approval Gate Now →
            </button>
          </div>
        )}

        <main className="w-full px-4 sm:px-6 py-6 flex-1 max-w-[1600px] mx-auto">
          {currentRoute === 'fleet' && (
            <FleetRadarView
              services={services}
              selectedService={selectedService}
              onSelectService={(s) => setSelectedServiceId(s.id)}
              logs={logs}
              mode={mode}
              onOpenTweakQuota={(s) => {
                setTargetTweakService(s);
                setIsTweakQuotaOpen(true);
              }}
              onOpenExpandModal={(s) => {
                setSelectedServiceId(s.id);
                setIsExpandModalOpen(true);
              }}
              onTriggerProbe={handleTriggerProbe}
              isProbing={isProbing}
              onSimulateAnomaly={handleSimulateAnomaly}
              onClearLogs={() => setLogs([])}
            />
          )}

          {currentRoute === 'nodes' && (
            <NodesView
              onOpenDeployModal={() => setIsDeployModalOpen(true)}
              onNavigateToFleet={() => navigateTo('fleet')}
            />
          )}

          {currentRoute === 'control-room' && (
            <ControlRoomView
              services={services}
              incidents={incidents}
              onNavigateToFleet={(serviceId) => {
                if (serviceId) setSelectedServiceId(serviceId);
                navigateTo('fleet');
              }}
              onNavigateToIncidents={() => navigateTo('incidents')}
              onNavigateToFaults={() => navigateTo('faults')}
            />
          )}

          {currentRoute === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              onUpdateIncidentStatus={handleUpdateIncidentStatus}
              onNavigateToFleet={(serviceId) => {
                setSelectedServiceId(serviceId);
                navigateTo('fleet');
              }}
              onTriggerGatedIncident={handleTriggerGatedIncident}
            />
          )}

          {currentRoute === 'faults' && (
            <FaultsView
              services={services}
              onInjectFault={(serviceId) => handleSimulateAnomaly(serviceId)}
              onNavigateToFleet={(serviceId) => {
                setSelectedServiceId(serviceId);
                navigateTo('fleet');
              }}
            />
          )}

          {currentRoute === 'chaos' && (
            <ChaosMatrixView
              services={services}
              onNavigateToFaults={() => navigateTo('faults')}
            />
          )}

          {currentRoute === 'ab' && <AbResilienceView />}

          {currentRoute === 'audit' && <AuditLedgerView logs={auditLogs} />}

          {currentRoute === 'roi' && <RoiSlaView />}

          {currentRoute === 'datasets' && <DatasetsView />}
        </main>
      </div>

      {/* AI Chatbot Assistant Widget controlling the whole Sentinel node */}
      <AiChatbot
        isOpen={isAiChatOpen}
        onToggle={() => setIsAiChatOpen(!isAiChatOpen)}
        services={services}
        currentCluster={currentCluster}
        activeMode={mode}
        pendingGates={pendingGates}
        onApproveGate={(id) => handleUpdateIncidentStatus(id || pendingGates[0]?.id, 'APPROVED')}
        onRejectGate={(id) => handleUpdateIncidentStatus(id || pendingGates[0]?.id, 'REJECTED')}
        onTriggerProbe={handleTriggerProbe}
        onSimulateSpike={(serviceId) => handleSimulateAnomaly(serviceId || services[0].id)}
        onSwitchMode={handleToggleMode}
        onSwitchCompanyCloud={(presetId) => {
          const p = COMPANY_PRESETS.find((c) => c.id === presetId);
          if (p) handleConnectCompanyPreset(p);
        }}
        onOpenCloudConnect={() => setIsCloudConnectOpen(true)}
        onNavigate={navigateTo}
        onOpenApprovalModal={() => setIsApprovalModalOpen(true)}
      />

      {/* Human-in-the-Loop Approval Console Modal */}
      <HumanApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        pendingGates={pendingGates}
        activeMode={mode}
        onApproveGate={(id) => handleUpdateIncidentStatus(id, 'APPROVED')}
        onRejectGate={(id) => handleUpdateIncidentStatus(id, 'REJECTED')}
        onSwitchMode={handleToggleMode}
        onTriggerTestIncident={handleTriggerGatedIncident}
        onNavigateToFleet={(serviceId) => {
          setSelectedServiceId(serviceId);
          navigateTo('fleet');
        }}
      />

      {/* Guided Interactive Demo Tour Modal */}
      <InteractiveDemoTour
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        step={demoTourStep}
        onNextStep={() => setDemoTourStep((prev) => Math.min(5, prev + 1))}
        onPrevStep={() => setDemoTourStep((prev) => Math.max(1, prev - 1))}
        onTriggerTestAnomaly={() => handleSimulateAnomaly(selectedService.id)}
        onOpenCloudConnect={() => setIsCloudConnectOpen(true)}
      />

      {/* Connect Company Cloud Modal (with full Presets) */}
      <CloudConnectModal
        isOpen={isCloudConnectOpen}
        onClose={() => setIsCloudConnectOpen(false)}
        onConnectCompanyPreset={handleConnectCompanyPreset}
      />

      {/* DaemonSet Installation Modal */}
      <InstallDaemonSetModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        activeMode={mode}
        onSelectMode={handleToggleMode}
        hosting={hosting}
        onSelectHosting={setHosting}
        activeNodesCount={currentCluster.activeNodes}
      />

      {/* Ask Sentinel CLI Terminal */}
      <AskSentinelModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        services={services}
        onInspectService={(serviceId) => {
          setSelectedServiceId(serviceId);
          navigateTo('fleet');
          setIsTerminalOpen(false);
        }}
        onTweakQuota={(s) => {
          setTargetTweakService(s);
          setIsTweakQuotaOpen(true);
          setIsTerminalOpen(false);
        }}
      />

      <TweakQuotaModal
        service={targetTweakService || selectedService}
        isOpen={isTweakQuotaOpen}
        onClose={() => setIsTweakQuotaOpen(false)}
        onSave={handleSaveTweakQuota}
      />

      <ExpandTelemetryModal
        service={selectedService}
        isOpen={isExpandModalOpen}
        onClose={() => setIsExpandModalOpen(false)}
        logs={logs}
        onTriggerProbe={handleTriggerProbe}
        isProbing={isProbing}
      />

      <ClusterRegionModal
        isOpen={isClusterModalOpen}
        onClose={() => setIsClusterModalOpen(false)}
        clusters={CLUSTER_REGIONS}
        currentCluster={currentCluster}
        onSelectCluster={(cluster) => {
          setCurrentCluster(cluster);
          addToast(
            'info',
            'Cluster Switched',
            `Connected to ${cluster.name} (${cluster.location}) · ${cluster.activeNodes} nodes active.`
          );
        }}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail="sit24sc025@sairamtap.edu.in"
      />
    </div>
  );
}
