import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar, RouteKey } from './components/Sidebar';
import { FleetRadarView } from './views/FleetRadarView';
import { NodesView } from './views/NodesView';
import { ArchitectureView } from './views/ArchitectureView';
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
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  INITIAL_SERVICES,
  INITIAL_LOGS,
  CLUSTER_REGIONS,
  INITIAL_INCIDENTS,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
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

  // Core Data States
  const [services, setServices] = useState<Microservice[]>(INITIAL_SERVICES);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('payment-service');
  const [logs, setLogs] = useState<KernelTelemetryLog[]>(INITIAL_LOGS);
  const [mode, setMode] = useState<SentinelMode>('armed');
  const [hosting, setHosting] = useState<ControlPlaneHosting>('customer-vpc');
  const [currentCluster, setCurrentCluster] = useState<ClusterRegion>(CLUSTER_REGIONS[0]);
  const [incidents, setIncidents] = useState<IncidentGate[]>(INITIAL_INCIDENTS);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);

  // Modals & Panels
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isTweakQuotaOpen, setIsTweakQuotaOpen] = useState(false);
  const [isExpandModalOpen, setIsExpandModalOpen] = useState(false);
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [targetTweakService, setTargetTweakService] = useState<Microservice | null>(null);

  // Probing and Toast notifications
  const [isProbing, setIsProbing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Selected microservice object
  const selectedService =
    services.find((s) => s.id === selectedServiceId) || services[0];

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
    } else if (clean === 'architecture' || clean === 'ebpf-flow' || clean === 'pipeline') {
      setCurrentRoute('architecture');
    } else if (clean === 'control-room' || clean === 'control') {
      setCurrentRoute('control-room');
    } else if (clean === 'incidents' || clean === 'incidents-gates') {
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

  // Listen for hashchange
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
        'Agent will detect anomalies and queue proposed remediations in Incidents & Gates for operator approval.'
      );
    } else {
      addToast(
        'warning',
        'DRY-RUN Mode Active',
        'Sentinel will passively observe eBPF tracepoints without modifying cgroups or invoking K8s mutations.'
      );
    }

    // Log to audit
    setAuditLogs((prev) => [
      {
        id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: `${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`,
        operator: 'sit24sc025@sairamtap.edu.in',
        action: `Execution Mode Shifted to ${newMode.toUpperCase()}`,
        targetService: 'Cluster Nodes (42)',
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
          msg: `cgroup v2 CPU CFS slice verified: 0 periods throttled across 42 DaemonSet nodes`,
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
          msg: `DaemonSet keepalive heartbeat acked from node-${Math.floor(Math.random() * 42 + 1)}`,
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
  }, [services]);

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
          message: `Synthetic probe completed: Latency ${latency}ms · 0 drops across 42 DaemonSet agents`,
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
          details: `Manual in-kernel health probe execution confirmed. RTT latency: ${latency}ms.`,
        },
        ...prev,
      ]);

      addToast(
        'success',
        `Health Probe Verified: ${target.name}`,
        `In-kernel response: ${latency}ms. All 42 DaemonSet nodes active and verified.`
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
  const handleSimulateAnomaly = (serviceId: string) => {
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
  };

  // Handle Incident status change
  const handleUpdateIncidentStatus = (id: string, status: IncidentGate['status']) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status } : inc))
    );
    addToast('info', 'Incident Gate Updated', `Incident ${id} marked as ${status}.`);
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
        onOpenTerminal={() => setIsTerminalOpen(true)}
        onOpenClusterModal={() => setIsClusterModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
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
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen pt-16">
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

        {mode === 'gated' && (
          <div className="bg-[#C9A66B]/15 border-b border-[#C9A66B]/30 px-6 py-2 flex items-center justify-between text-[12px] text-[#C9A66B]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span>
                <strong>Human-Approval (Gated) Mode Active:</strong> In-kernel remediations require ticket sign-off in the Incidents & Gates tab.
              </span>
            </div>
            <button
              onClick={() => navigateTo('incidents')}
              className="text-[#e1e2e8] font-mono underline hover:text-white"
            >
              View Pending Gates →
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

          {currentRoute === 'architecture' && (
            <ArchitectureView
              mode={mode}
              onSelectMode={handleToggleMode}
              hosting={hosting}
              onSelectHosting={setHosting}
              onOpenDeployModal={() => setIsDeployModalOpen(true)}
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

      {/* Modals & Dialogs */}
      <InstallDaemonSetModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        activeMode={mode}
        onSelectMode={handleToggleMode}
        hosting={hosting}
        onSelectHosting={setHosting}
        activeNodesCount={42}
      />

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
