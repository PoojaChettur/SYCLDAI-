import React, { useState } from 'react';
import { SentinelMode, ControlPlaneHosting } from '../types/fleet';

interface InstallDaemonSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMode: SentinelMode;
  onSelectMode: (mode: SentinelMode) => void;
  hosting: ControlPlaneHosting;
  onSelectHosting: (hosting: ControlPlaneHosting) => void;
  activeNodesCount: number;
}

export const InstallDaemonSetModal: React.FC<InstallDaemonSetModalProps> = ({
  isOpen,
  onClose,
  activeMode,
  onSelectMode,
  hosting,
  onSelectHosting,
  activeNodesCount,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'helm' | 'kubectl' | 'terraform' | 'rbac'>('helm');
  const [isSimulatingDeploy, setIsSimulatingDeploy] = useState(false);
  const [deployProgress, setDeployProgress] = useState(100);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSimulateRollout = () => {
    setIsSimulatingDeploy(true);
    setDeployProgress(0);
    const interval = setInterval(() => {
      setDeployProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulatingDeploy(false);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const helmCmd = `helm repo add scyld https://charts.scyld.ai
helm install scyldai-sentinel scyld/sentinel \\
  --namespace scyld-system --create-namespace \\
  --set mode=${activeMode} \\
  --set controlPlane.hosting=${hosting} \\
  --set ebpf.coreEnabled=true`;

  const kubectlCmd = `curl -sSL https://get.scyld.ai/daemonset.yaml | kubectl apply -f -`;

  const terraformSnippet = `module "scyldai_sentinel" {
  source       = "scyld/sentinel/kubernetes"
  version      = "4.18.0"
  namespace    = "scyld-system"
  mode         = "${activeMode}"
  air_gapped   = ${hosting === 'air-gapped' ? 'true' : 'false'}
  node_selector = { "kubernetes.io/os" = "linux" }
}`;

  const rbacManifest = `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: scyld-sentinel-agent
rules:
  # 1. Read cgroup & node kernel statistics (eBPF telemetry)
  - apiGroups: [""]
    resources: ["nodes", "nodes/proxy", "nodes/status", "pods"]
    verbs: ["get", "list", "watch"]
  # 2. Remediation actions (Controlled by ${activeMode.toUpperCase()} mode)
  - apiGroups: [""]
    resources: ["pods/eviction"]
    verbs: [${activeMode === 'dry-run' ? '"get"' : '"create"'}]
  # 3. Read container namespace metadata without code injection
  - apiGroups: ["apps"]
    resources: ["daemonsets", "deployments", "statefulsets"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: scyld-sentinel-agent-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: scyld-sentinel-agent
subjects:
  - kind: ServiceAccount
    name: sentinel-node-agent
    namespace: scyld-system`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#111417] border border-[#272a2e] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#191c20] border-b border-[#272a2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#7a93ac]/20 border border-[#7a93ac]/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#b0c9e4] text-[22px]">dns</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-semibold text-[#e1e2e8]">
                  Deploy Sentinel eBPF DaemonSet to Cluster
                </h2>
                <span className="font-mono text-[10px] bg-[#0b0e12] px-2 py-0.5 rounded text-[#aacfb6] border border-[#272a2e]">
                  1 Copy Per Node · 0 Code Changes
                </span>
              </div>
              <p className="text-[12px] text-[#8d9197] mt-0.5">
                Install one agent on every server. eBPF reads kernel tracepoints directly without touching application containers.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8d9197] hover:text-[#e1e2e8] p-1.5 rounded-lg hover:bg-[#272a2e] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 4 Architectural Pillars Explained */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[12px]">
            <div className="p-3.5 bg-[#1d2024] rounded-lg border border-[#272a2e]">
              <div className="flex items-center gap-2 text-[#b0c9e4] font-semibold">
                <span className="material-symbols-outlined text-[18px]">developer_board</span>
                <span>1. Kubernetes DaemonSet</span>
              </div>
              <p className="text-[#8d9197] text-[11px] mt-1.5 leading-relaxed">
                Runs exactly one copy on every worker node. Automatically schedules on new nodes during autoscaling.
              </p>
            </div>

            <div className="p-3.5 bg-[#1d2024] rounded-lg border border-[#272a2e]">
              <div className="flex items-center gap-2 text-[#aacfb6] font-semibold">
                <span className="material-symbols-outlined text-[18px]">memory</span>
                <span>2. In-Kernel eBPF</span>
              </div>
              <p className="text-[#8d9197] text-[11px] mt-1.5 leading-relaxed">
                Reads CPU, CFS quota, RSS memory, and system calls directly from Linux kernel space. Zero app modification.
              </p>
            </div>

            <div className="p-3.5 bg-[#1d2024] rounded-lg border border-[#272a2e]">
              <div className="flex items-center gap-2 text-[#C9A66B] font-semibold">
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>3. RBAC & Execution Modes</span>
              </div>
              <p className="text-[#8d9197] text-[11px] mt-1.5 leading-relaxed">
                Talks to K8s API with scoped RBAC roles. Your ARMED, GATED, and DRY-RUN modes dictate whether actions auto-apply.
              </p>
            </div>

            <div className="p-3.5 bg-[#1d2024] rounded-lg border border-[#272a2e]">
              <div className="flex items-center gap-2 text-[#b0c9e4] font-semibold">
                <span className="material-symbols-outlined text-[18px]">security</span>
                <span>4. Bank-Grade Private VPC</span>
              </div>
              <p className="text-[#8d9197] text-[11px] mt-1.5 leading-relaxed">
                Control plane runs completely inside the customer's cloud or on-prem. Ideal for healthcare & financial data privacy.
              </p>
            </div>
          </div>

          {/* Interactive Controls: Mode & Hosting Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode Selector */}
            <div className="p-4 bg-[#1d2024] rounded-lg border border-[#272a2e] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#e1e2e8] uppercase tracking-wider">
                  Agent Remediation Power (RBAC Mode)
                </span>
                <span className="font-mono text-[11px] text-[#b0c9e4] capitalize">
                  Current: {activeMode}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectMode('armed')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    activeMode === 'armed'
                      ? 'bg-[#7a93ac]/25 border-[#7a93ac] text-[#b0c9e4]'
                      : 'bg-[#0b0e12] border-[#272a2e] text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  <div className="font-semibold text-[12px]">ARMED</div>
                  <div className="text-[10px] mt-0.5 text-[#8d9197]">
                    Full auto-remediation (freeze, drain, throttle)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectMode('gated')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    activeMode === 'gated'
                      ? 'bg-[#C9A66B]/20 border-[#C9A66B] text-[#C9A66B]'
                      : 'bg-[#0b0e12] border-[#272a2e] text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  <div className="font-semibold text-[12px]">GATED</div>
                  <div className="text-[10px] mt-0.5 text-[#8d9197]">
                    Requires human approval gate in Incidents tab
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectMode('dry-run')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    activeMode === 'dry-run'
                      ? 'bg-[#d4a373]/20 border-[#d4a373] text-[#d4a373]'
                      : 'bg-[#0b0e12] border-[#272a2e] text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  <div className="font-semibold text-[12px]">DRY-RUN</div>
                  <div className="text-[10px] mt-0.5 text-[#8d9197]">
                    Zero mutation permissions. Logs actions only
                  </div>
                </button>
              </div>
            </div>

            {/* Privacy & Hosting Selector (Banks & Hospitals) */}
            <div className="p-4 bg-[#1d2024] rounded-lg border border-[#272a2e] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#e1e2e8] uppercase tracking-wider">
                  Data Flow & Control Plane Hosting
                </span>
                <span className="font-mono text-[11px] text-[#aacfb6]">
                  {hosting === 'customer-vpc'
                    ? 'Customer Private Cloud'
                    : hosting === 'air-gapped'
                    ? 'Air-Gapped On-Prem'
                    : 'Scyld Managed Cloud'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onSelectHosting('customer-vpc')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    hosting === 'customer-vpc'
                      ? 'bg-[#aacfb6]/15 border-[#aacfb6] text-[#aacfb6]'
                      : 'bg-[#0b0e12] border-[#272a2e] text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  <div className="font-semibold text-[12px]">Private VPC</div>
                  <div className="text-[10px] mt-0.5 text-[#8d9197]">
                    Runs in Bank / Hospital AWS / Azure VPC
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectHosting('air-gapped')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    hosting === 'air-gapped'
                      ? 'bg-[#b0c9e4]/20 border-[#b0c9e4] text-[#b0c9e4]'
                      : 'bg-[#0b0e12] border-[#272a2e] text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  <div className="font-semibold text-[12px]">Air-Gapped</div>
                  <div className="text-[10px] mt-0.5 text-[#8d9197]">
                    Strict zero-egress isolated physical DC
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectHosting('scyld-cloud')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    hosting === 'scyld-cloud'
                      ? 'bg-[#7a93ac]/20 border-[#7a93ac] text-[#cde5ff]'
                      : 'bg-[#0b0e12] border-[#272a2e] text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  <div className="font-semibold text-[12px]">Scyld Cloud</div>
                  <div className="text-[10px] mt-0.5 text-[#8d9197]">
                    Multi-region fully managed SaaS plane
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Single Command Deploy Snippets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#272a2e] pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('helm')}
                  className={`px-3 py-1 rounded text-[12px] font-mono transition-colors ${
                    activeTab === 'helm' ? 'bg-[#7a93ac] text-[#112c41] font-semibold' : 'text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  Helm Chart (Recommended)
                </button>
                <button
                  onClick={() => setActiveTab('kubectl')}
                  className={`px-3 py-1 rounded text-[12px] font-mono transition-colors ${
                    activeTab === 'kubectl' ? 'bg-[#7a93ac] text-[#112c41] font-semibold' : 'text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  Single kubectl Apply
                </button>
                <button
                  onClick={() => setActiveTab('terraform')}
                  className={`px-3 py-1 rounded text-[12px] font-mono transition-colors ${
                    activeTab === 'terraform' ? 'bg-[#7a93ac] text-[#112c41] font-semibold' : 'text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  Terraform Module
                </button>
                <button
                  onClick={() => setActiveTab('rbac')}
                  className={`px-3 py-1 rounded text-[12px] font-mono transition-colors ${
                    activeTab === 'rbac' ? 'bg-[#7a93ac] text-[#112c41] font-semibold' : 'text-[#8d9197] hover:text-[#e1e2e8]'
                  }`}
                >
                  Inspect RBAC Manifest
                </button>
              </div>

              <button
                onClick={() => {
                  const text =
                    activeTab === 'helm'
                      ? helmCmd
                      : activeTab === 'kubectl'
                      ? kubectlCmd
                      : activeTab === 'terraform'
                      ? terraformSnippet
                      : rbacManifest;
                  copyToClipboard(text, activeTab);
                }}
                className="px-3 py-1 rounded bg-[#272a2e] hover:bg-[#323539] text-[#e1e2e8] text-[11px] font-mono flex items-center gap-1.5 transition-colors border border-[#43474c]"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copiedKey === activeTab ? 'check' : 'content_copy'}
                </span>
                <span>{copiedKey === activeTab ? 'Copied!' : 'Copy Command'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 bg-[#0b0e12] rounded-lg border border-[#272a2e] font-mono text-[12px] text-[#e1e2e8] overflow-x-auto leading-relaxed">
                {activeTab === 'helm' && helmCmd}
                {activeTab === 'kubectl' && kubectlCmd}
                {activeTab === 'terraform' && terraformSnippet}
                {activeTab === 'rbac' && rbacManifest}
              </pre>
            </div>
          </div>

          {/* Live Node Rollout Status */}
          <div className="p-4 bg-[#1d2024] rounded-lg border border-[#272a2e] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#aacfb6] text-[18px]">verified</span>
                <span className="text-[13px] font-semibold text-[#e1e2e8]">
                  DaemonSet Pod Status Across Cluster
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[12px] text-[#aacfb6]">
                  {Math.round((activeNodesCount * deployProgress) / 100)} / {activeNodesCount} Nodes Running
                </span>
                <button
                  onClick={handleSimulateRollout}
                  disabled={isSimulatingDeploy}
                  className="px-2.5 py-1 rounded bg-[#272a2e] hover:bg-[#323539] text-[#b0c9e4] text-[11px] font-mono transition-colors"
                >
                  {isSimulatingDeploy ? 'Deploying...' : 'Redeploy DaemonSet'}
                </button>
              </div>
            </div>

            <div className="h-2 bg-[#0b0e12] rounded-full overflow-hidden">
              <div
                className="bg-[#aacfb6] h-full rounded-full transition-all duration-300"
                style={{ width: `${deployProgress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-[#8d9197] pt-1">
              <div>• Image: scyld/agent:v4.18-ebpf</div>
              <div>• Restart Policy: Always</div>
              <div>• CPU Overhead: &lt; 0.3% core</div>
              <div>• Memory Overhead: 42MB RSS</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#191c20] border-t border-[#272a2e] flex items-center justify-between text-[12px]">
          <div className="text-[#8d9197] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#aacfb6]"></span>
            <span>Zero instrumentation required: no sidecars, no SDK imports, no pod restarts.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#272a2e] text-[#e1e2e8] hover:bg-[#323539] font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
