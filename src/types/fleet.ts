export type ServiceCategory = 'Core' | 'Edge' | 'Workers' | 'Cache';

export type ServiceStatus = 'nominal' | 'mitigating' | 'cycling' | 'anomalous';

export type SentinelMode = 'armed' | 'gated' | 'dry-run';

export type ControlPlaneHosting = 'customer-vpc' | 'air-gapped' | 'scyld-cloud';

export interface Microservice {
  id: string;
  name: string;
  category: ServiceCategory;
  pid: number;
  health: number; // 0 - 100
  cfsQuota: number; // percentage, e.g. 16%
  memoryMb: number;
  memoryLimitMb: number;
  status: ServiceStatus;
  statusText: string;
  actionText: string;
  badgeText?: string;
  badgeColor?: string;
  iconName?: string;
  cgroupPath: string;
  rssMb: number;
  anonMb: number;
  fileMb: number;
  zombiePids: number;
  ebpfHooksCount: number;
  hooks: string[];
  mmapRatePagesPerSec: number;
  vmaFragmentation: number;
  cfsPeriodMs: number;
  oomScoreAdj: number;
  anomalyScore: number;
  lastStabilizedAgo: string;
  syscallsPerSec: number;
  egressPacing: string;
  xCoord?: number;
  yCoord?: number;
}

export interface KernelTelemetryLog {
  id: string;
  timestamp: string;
  probe: string; // e.g. '[kprobe:cgroup_rstat]'
  probeType: 'kprobe' | 'bpf' | 'tc' | 'isolation_forest' | 'tracepoint';
  serviceId: string;
  message: string;
}

export interface ClusterRegion {
  id: string;
  name: string;
  companyName?: string;
  provider?: 'aws' | 'gcp' | 'azure' | 'k8s' | 'sandbox';
  isSandbox?: boolean;
  location: string;
  kernelVersion: string;
  activeNodes: number;
  totalNodes: number;
  activeServices: number;
  pingMs: number;
}

export interface NodeAgentInfo {
  id: string;
  name: string;
  zone: string;
  status: 'Ready' | 'Probing' | 'Updating';
  kernelVersion: string;
  daemonSetPod: string;
  ebpfDriverStatus: 'CO-RE Active' | 'Fallback JIT';
  cpuCores: number;
  memGb: number;
  runningContainers: number;
}

export interface IncidentGate {
  id: string;
  serviceId: string;
  serviceName: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING_GATE' | 'AUTO_MITIGATED' | 'APPROVED' | 'REJECTED';
  detectedAt: string;
  rootCause: string;
  ebpfActionTaken: string;
  ebpfProposedFix: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  targetService: string;
  pid: number;
  result: 'SUCCESS' | 'MITIGATED' | 'BLOCKED';
  signatureHash: string;
  details: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  nodeDetail?: NodeAgentInfo;
  pendingGate?: IncidentGate;
  quickActions?: {
    label: string;
    action: string;
    type?: 'approve' | 'reject' | 'navigate' | 'probe' | 'primary';
  }[];
}
