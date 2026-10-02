import React, { useState } from 'react';
import { SentinelMode, ControlPlaneHosting } from '../types/fleet';

interface ArchitectureViewProps {
  mode: SentinelMode;
  onSelectMode: (m: SentinelMode) => void;
  hosting: ControlPlaneHosting;
  onSelectHosting: (h: ControlPlaneHosting) => void;
  onOpenDeployModal: () => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  mode,
  onSelectMode,
  hosting,
  onSelectHosting,
  onOpenDeployModal,
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: 'Customer Containerized Apps',
      sub: 'Zero Code Changes',
      icon: 'layers',
      color: 'text-[#b0c9e4]',
      desc: 'Microservices (Payment, Auth, DB, Redis, etc.) run completely unmodified. No SDK imports, no sidecar proxies, and zero build pipeline adjustments.',
      tech: 'Docker / OCI Containers · Kubernetes Pods · cgroups v2',
    },
    {
      num: 2,
      title: 'Linux Kernel Space (eBPF)',
      sub: 'In-Kernel Tracing & Clamping',
      icon: 'memory',
      color: 'text-[#aacfb6]',
      desc: 'eBPF programs attach directly to kernel tracepoints, kprobes, and TC filters. It collects CPU CFS quotas, RSS memory fragmentation, and syscall latencies without overhead.',
      tech: 'kprobe:cgroup_rstat · tc:cls_bpf · BPF ring_buffer · CO-RE vmlinux.h',
    },
    {
      num: 3,
      title: 'Kubernetes DaemonSet Agent',
      sub: '1 Copy on Every Server',
      icon: 'dns',
      color: 'text-[#C9A66B]',
      desc: 'Deployed via single Helm chart or kubectl command. Automatically schedules one copy onto every node in the cluster to consume in-kernel ring buffers.',
      tech: 'DaemonSet: scyldai-sentinel · Resource Overhead < 0.3% CPU & 42MB RAM',
    },
    {
      num: 4,
      title: 'Kubernetes API & RBAC Controller',
      sub: `${mode.toUpperCase()} Execution Authority`,
      icon: 'admin_panel_settings',
      color: 'text-[#ffb4ab]',
      desc: `Talks to K8s API using RBAC permissions to execute remediations (cgroup freeze, pod drain, graceful worker cycle). Currently operating in ${mode.toUpperCase()} mode.`,
      tech: 'ClusterRole: scyld-sentinel-agent · Pod Eviction API · cgroup slice freeze',
    },
    {
      num: 5,
      title: 'Central Control Plane',
      sub: hosting === 'customer-vpc' ? 'Customer Private VPC (Banks & Hospitals)' : hosting === 'air-gapped' ? 'Air-Gapped On-Prem' : 'Scyld Cloud',
      icon: 'cloud_queue',
      color: 'text-[#b0c9e4]',
      desc: 'Aggregates metrics and trains the IsolationForest baseline models. Runs inside the customer private VPC for strict compliance (SOC2, HIPAA, PCI-DSS). Zero data egress.',
      tech: 'Private In-VPC Cluster · Mutual TLS Handshakes · HMAC-SHA256 Audit Trail',
    },
    {
      num: 6,
      title: 'ScyldAI Sentinel Dashboard',
      sub: 'Fleet & Radar Live Interface',
      icon: 'radar',
      color: 'text-[#aacfb6]',
      desc: 'Real-time telemetry, 14-service radar visualization, live kernel ring-buffer streams, and autonomous MTTR 2.8s mitigation controls.',
      tech: 'React 19 SPA · Tailored Cybernetic Dark UI · Sub-second Reactive Updates',
    },
  ];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#b0c9e4] text-[22px]">hub</span>
            <h2 className="text-[18px] font-semibold text-[#e1e2e8]">
              Sentinel End-to-End Architecture & Data Flow
            </h2>
          </div>
          <p className="text-[12px] text-[#8d9197] mt-1">
            How eBPF reads from the kernel, how DaemonSets deploy without app changes, and how RBAC modes govern remediation.
          </p>
        </div>

        <button
          onClick={onOpenDeployModal}
          className="px-4 py-2 rounded-lg bg-[#7a93ac] text-[#112c41] font-semibold text-[13px] hover:bg-[#b0c9e4] transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">terminal</span>
          <span>Deploy DaemonSet to Cluster</span>
        </button>
      </div>

      {/* Interactive Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step) => {
          const isSelected = selectedStep === step.num;
          return (
            <div
              key={step.num}
              onClick={() => setSelectedStep(step.num)}
              className={`bg-[#1d2024] rounded-lg p-5 border cursor-pointer transition-all shadow-sm flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-[#7a93ac] bg-[#272a2e]/60 ring-1 ring-[#7a93ac]/40 scale-[1.01]'
                  : 'border-[#272a2e] hover:border-[#43474c] hover:bg-[#191c20]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold text-[#8d9197]">
                    STEP 0{step.num}
                  </span>
                  <span className={`material-symbols-outlined text-[20px] ${step.color}`}>
                    {step.icon}
                  </span>
                </div>
                <h3 className="font-semibold text-[15px] text-[#e1e2e8] mt-2">{step.title}</h3>
                <span className="font-mono text-[11px] text-[#8d9197] block">{step.sub}</span>
                <p className="text-[12px] text-[#c3c7cd] mt-2.5 leading-relaxed">{step.desc}</p>
              </div>

              <div className="pt-2 border-t border-[#272a2e]/60 text-[11px] font-mono text-[#8d9197]">
                {step.tech}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive on the Selected Step */}
      <div className="bg-[#1d2024] rounded-lg p-6 border border-[#272a2e] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#272a2e]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] text-[#aacfb6]">DEEP DIVE:</span>
            <span className="font-semibold text-[15px] text-[#e1e2e8]">
              {steps[selectedStep - 1].title} — {steps[selectedStep - 1].sub}
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#8d9197]">
            Component 0{selectedStep} of 06
          </span>
        </div>

        {selectedStep === 1 && (
          <div className="space-y-2 text-[13px] text-[#c3c7cd] leading-relaxed">
            <p>
              Traditional monitoring tools require engineering teams to import vendor SDKs, recompile binaries, or attach heavy sidecar proxies that increase latency.
            </p>
            <p>
              <strong>ScyldAI Sentinel operates with zero application modification:</strong> Your microservices (whether written in Go, Java, Python, Node, or C++) run untouched in standard containers. The operating system kernel is where ScyldAI interfaces.
            </p>
          </div>
        )}

        {selectedStep === 2 && (
          <div className="space-y-2 text-[13px] text-[#c3c7cd] leading-relaxed">
            <p>
              eBPF (Extended Berkeley Packet Filter) allows sandboxed programs to execute safely within the Linux kernel at near-zero CPU overhead (&lt; 0.3%).
            </p>
            <p>
              Sentinel attaches probe handlers to <code>kprobe:cgroup_rstat</code> and <code>tc:cls_bpf</code> to monitor CFS quotas, page faults, and socket leaks. When an anomaly is detected, in-kernel memory drains occur in sub-second time (MTTR 2.8s) without killing the process.
            </p>
          </div>
        )}

        {selectedStep === 3 && (
          <div className="space-y-2 text-[13px] text-[#c3c7cd] leading-relaxed">
            <p>
              In Kubernetes, a <strong>DaemonSet</strong> guarantees that every server/node in the cluster automatically runs one copy of the <code>scyld-agent</code> pod.
            </p>
            <p>
              When your cluster scales from 42 to 100 nodes, Kubernetes automatically schedules the Sentinel agent on every new node with zero manual configuration. The agent loads the compiled CO-RE eBPF bytecode into the host kernel.
            </p>
          </div>
        )}

        {selectedStep === 4 && (
          <div className="space-y-3 text-[13px] text-[#c3c7cd] leading-relaxed">
            <p>
              To remediate issues, the DaemonSet agent interacts with the Kubernetes API using scoped RBAC roles. Your execution mode dictates the agent's authority:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e]">
                <strong className="text-[#aacfb6] block text-[12px]">ARMED MODE</strong>
                <span className="text-[11px] text-[#8d9197]">
                  Full automated remediation authority. The agent detects anomalies, clamps CFS quotas, and gracefully cycles workers autonomously.
                </span>
              </div>
              <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e]">
                <strong className="text-[#C9A66B] block text-[12px]">GATED (HUMAN APPROVAL)</strong>
                <span className="text-[11px] text-[#8d9197]">
                  The agent generates proposed remediations as policy tickets in the Incidents & Gates tab. Actions only run after an operator approves.
                </span>
              </div>
              <div className="p-3 bg-[#0b0e12] rounded border border-[#272a2e]">
                <strong className="text-[#d4a373] block text-[12px]">DRY-RUN MODE</strong>
                <span className="text-[11px] text-[#8d9197]">
                  Passive observation only. The agent reads tracepoints and logs what it would have done without executing any Kubernetes mutations.
                </span>
              </div>
            </div>
          </div>
        )}

        {selectedStep === 5 && (
          <div className="space-y-2 text-[13px] text-[#c3c7cd] leading-relaxed">
            <p>
              <strong>Tailored for Privacy-Sensitive Sectors (Banks & Healthcare):</strong>
            </p>
            <p>
              For financial institutions and healthcare networks handling HIPAA or PCI-DSS sensitive workloads, the entire Sentinel control plane can run <strong>inside your own private cloud or air-gapped on-premise datacenter</strong>.
            </p>
            <p>
              Zero customer telemetry, payload data, or internal IP addresses ever leave your security perimeter.
            </p>
          </div>
        )}

        {selectedStep === 6 && (
          <div className="space-y-2 text-[13px] text-[#c3c7cd] leading-relaxed">
            <p>
              The <strong>Fleet & Radar Dashboard</strong> brings all server nodes and container telemetry together. Operators get sub-second visibility into cgroup pressure, autonomous auto-fix logs, and radar network topologies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
