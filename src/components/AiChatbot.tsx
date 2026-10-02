import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Microservice, ClusterRegion, ChatMessage, SentinelMode, IncidentGate, NodeAgentInfo } from '../types/fleet';

interface AiChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
  services: Microservice[];
  currentCluster: ClusterRegion;
  activeMode: SentinelMode;
  pendingGates: IncidentGate[];
  onApproveGate: (incidentId?: string) => void;
  onRejectGate: (incidentId?: string) => void;
  onTriggerProbe: (serviceId: string) => void;
  onSimulateSpike: (serviceId?: string) => void;
  onSwitchMode: (mode: SentinelMode) => void;
  onSwitchCompanyCloud: (presetId: string) => void;
  onOpenCloudConnect: () => void;
  onNavigate: (route: any) => void;
  onOpenApprovalModal?: () => void;
}

export const AiChatbot: React.FC<AiChatbotProps> = ({
  isOpen,
  onToggle,
  services,
  currentCluster,
  activeMode,
  pendingGates,
  onApproveGate,
  onRejectGate,
  onTriggerProbe,
  onSimulateSpike,
  onSwitchMode,
  onSwitchCompanyCloud,
  onOpenCloudConnect,
  onNavigate,
  onOpenApprovalModal,
}) => {
  // Generate 42 real-time server nodes in cluster matching NodesView
  const nodes: NodeAgentInfo[] = useMemo(() => {
    return Array.from({ length: 42 }, (_, i) => {
      const num = i + 1;
      const zone = num % 3 === 0 ? 'us-east-1a' : num % 3 === 1 ? 'us-east-1b' : 'us-east-1c';
      return {
        id: `node-${num.toString().padStart(2, '0')}`,
        name: `ip-10-0-${Math.floor(num / 10) + 1}-${10 + (num % 20)}.ec2.internal`,
        zone,
        status: 'Ready',
        kernelVersion: '6.5.0-ebpf-sentinel',
        daemonSetPod: `scyld-sentinel-${(num * 1337).toString(36).substring(0, 5)}`,
        ebpfDriverStatus: 'CO-RE Active',
        cpuCores: 16,
        memGb: 64,
        runningContainers: 6 + (num % 8),
      };
    });
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `👋 **Hello! I am Sentinel AI**, your command & control co-pilot for the entire cluster.\n\nI monitor and manage all **42 server nodes** and **14 microservices** running the eBPF DaemonSet agent.\n\nAsk me anything or give commands:\n• *"Where will I give human approval?"*\n• *"How is node 1?" or "Inspect all 42 nodes"*\n• *"Run health probe across nodes"*\n• *"Simulate anomaly spike"*\n• *"Connect Acme Bank cloud"*`,
      timestamp: 'Just now',
      quickActions: [
        { label: '⚠️ Where is Human Approval?', action: 'where will I give human approval' },
        { label: '🖥️ Status of Whole Sentinel Node', action: 'whole sentinel node status' },
        { label: '🔄 Run Node Health Probe', action: 'run health probe on all nodes' },
        { label: '⚡ Simulate Anomaly', action: 'simulate spike' },
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const quickPrompts = [
    pendingGates.length > 0 ? '✅ Approve Pending Gate' : '⚠️ Where is Human Approval?',
    '🖥️ Whole Sentinel Node Status',
    '🔍 Check Node-01',
    '🔄 Probe All 42 Nodes',
    '⚡ Simulate Anomaly',
    '🏢 Connect Company Cloud',
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processCommandAndGenerateResponse(text);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nodeDetail: response.nodeDetail,
        pendingGate: response.pendingGate,
        quickActions: response.quickActions,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const processCommandAndGenerateResponse = (
    query: string
  ): {
    text: string;
    nodeDetail?: NodeAgentInfo;
    pendingGate?: IncidentGate;
    quickActions?: { label: string; action: string; type?: 'approve' | 'reject' | 'navigate' | 'probe' | 'primary' }[];
  } => {
    const q = query.toLowerCase().trim();

    // 1. "Where will I give human approval?" & Human approval questions
    if (
      q.includes('where') && (q.includes('human approval') || q.includes('approval') || q.includes('gate') || q.includes('approve')) ||
      q === 'human approval' || q.includes('how to give approval')
    ) {
      if (pendingGates.length > 0) {
        const gate = pendingGates[0];
        return {
          text: `🛡️ **You can give Human Approval in 3 easy places:**\n\n1. **Right here in this chat!** Click the green **Approve** button on the card below or type *"Approve"*.\n2. **Top Navigation Bar:** Click the glowing **"Human Approval (${pendingGates.length})"** button in the header.\n3. **Navigation Sidebar:** Go to the **Incidents & Approval Gates** tab.\n\nHere is the current action awaiting your human authorization:`,
          pendingGate: gate,
          quickActions: [
            { label: '✅ Approve In-Kernel Fix', action: `approve ${gate.id}`, type: 'approve' },
            { label: '❌ Reject Action', action: `reject ${gate.id}`, type: 'reject' },
            { label: '📋 Open Approval Center', action: 'open approval modal', type: 'primary' },
          ],
        };
      } else {
        return {
          text: `🛡️ **Where to give Human Approval:**\n\n• **Top Header Button:** Look at the top bar for **"Human Approval"**. Clicking it opens the approval console anytime.\n• **Sidebar Tab:** Select **"Incidents & Approval Gates"** in the left menu.\n• **Right Here in Chat:** Whenever an anomaly occurs in **GATED mode**, I will show you the exact proposed in-kernel fix with 1-click **Approve** and **Reject** buttons!\n\nCurrently, **all approval gates are clear** (0 pending). Would you like to create a test incident to see the approval workflow in action?`,
          quickActions: [
            { label: '⚡ Create Test Gated Incident', action: 'simulate a gated incident requiring human approval', type: 'primary' },
            { label: '🛡️ Switch to Gated Mode', action: 'switch to gated mode', type: 'primary' },
            { label: '📋 Open Approval Center', action: 'open approval modal', type: 'primary' },
          ],
        };
      }
    }

    // 2. Open Approval Modal
    if (q.includes('open approval modal') || q.includes('open approval center')) {
      if (onOpenApprovalModal) onOpenApprovalModal();
      return {
        text: `✅ Opened the **Human Approval Center** modal on your screen. You can review all pending actions, toggle between Armed/Gated/Dry-run modes, or generate a test incident.`,
      };
    }

    // 3. User grants or rejects approval directly
    if (q.includes('approve') || q.includes('accept') || q.includes('sign off') || q.includes('grant') || q === 'yes') {
      if (pendingGates.length > 0) {
        const targetGate = pendingGates[0];
        onApproveGate(targetGate.id);
        return {
          text: `✅ **Human Approval Granted!**\n\nI have authorized and executed the in-kernel remediation for **${targetGate.serviceName}** (${targetGate.id}):\n\n• **Action:** \`${targetGate.ebpfProposedFix || targetGate.ebpfActionTaken}\`\n• **Result:** Applied instantly via eBPF cgroup clamp in **< 1.8ms** with zero container restart.\n• **Audit Trail:** Recorded with cryptographic HMAC-SHA256 signature in Audit Ledger.`,
          quickActions: [
            { label: '🔄 Run Health Probe on payment-service', action: 'probe payment-service', type: 'probe' },
            { label: '📊 View Incidents Tab', action: 'view incidents', type: 'navigate' },
          ],
        };
      } else {
        return {
          text: `ℹ️ **No Pending Gates:** All human-approval queues are currently clear!\n\nWant to test the approval flow? Say *"simulate a gated incident"* or click below.`,
          quickActions: [
            { label: '⚡ Simulate Test Gated Incident', action: 'simulate a gated incident', type: 'primary' },
          ],
        };
      }
    }

    if (q.includes('reject') || q.includes('deny') || q.includes('dismiss gate') || q === 'no') {
      if (pendingGates.length > 0) {
        const targetGate = pendingGates[0];
        onRejectGate(targetGate.id);
        return {
          text: `❌ **Gate Vetoed:** Remediation ticket \`${targetGate.id}\` for **${targetGate.serviceName}** has been rejected by operator.\n\nNo modifications were made to Kubernetes pods or cgroup parameters.`,
          quickActions: [
            { label: '⚡ Simulate New Anomaly', action: 'simulate spike', type: 'primary' },
          ],
        };
      } else {
        return {
          text: `ℹ️ No pending approval gates to reject.`,
        };
      }
    }

    // 4. "Whole Sentinel Node" queries or "Inspect All Nodes"
    if (
      q.includes('whole sentinel node') ||
      q.includes('all nodes') ||
      q.includes('node status') ||
      q.includes('list nodes') ||
      q.includes('how many nodes') ||
      q.includes('servers') ||
      q === 'nodes'
    ) {
      const zoneACount = nodes.filter((n) => n.zone === 'us-east-1a').length;
      const zoneBCount = nodes.filter((n) => n.zone === 'us-east-1b').length;
      const zoneCCount = nodes.filter((n) => n.zone === 'us-east-1c').length;
      const totalContainers = nodes.reduce((acc, n) => acc + n.runningContainers, 0);

      return {
        text: `🖥️ **Whole Sentinel Node Fleet Telemetry (42 / 42 Active):**\n\n• **Cluster Region:** \`${currentCluster.name}\` (${currentCluster.location})\n• **Active Server Nodes:** **42 physical/cloud worker nodes**\n• **DaemonSet Status:** 42/42 \`scyld-sentinel\` pods running healthy\n• **eBPF Kernel Driver:** \`CO-RE Active (Kernel 6.5.0-ebpf-sentinel)\`\n• **Total Running Containers:** ${totalContainers} microservice containers monitored\n• **Multi-Zone Distribution:**\n  - \`us-east-1a\`: ${zoneACount} nodes\n  - \`us-east-1b\`: ${zoneBCount} nodes\n  - \`us-east-1c\`: ${zoneCCount} nodes\n• **Ring-Buffer Drop Rate:** **0.00%** (zero telemetry loss)\n\nEvery server node runs a lightweight eBPF DaemonSet agent requiring **zero application code changes**.`,
        quickActions: [
          { label: '🔍 Inspect Node-01', action: 'check node-01', type: 'primary' },
          { label: '🔄 Run Fleet-Wide Health Probe', action: 'run health probe on all nodes', type: 'probe' },
          { label: '📋 Open DaemonSet & Nodes Tab', action: 'view nodes', type: 'navigate' },
        ],
      };
    }

    // 5. Specific Node Query (e.g. "node 1", "node-04", "how is node 12")
    const nodeMatch = q.match(/node[- ]?([0-9]{1,2})/i);
    if (nodeMatch) {
      const nodeNum = parseInt(nodeMatch[1], 10);
      const targetNode = nodes.find(
        (n) => n.id === `node-${nodeNum.toString().padStart(2, '0')}`
      ) || nodes[0];

      return {
        text: `🔍 **Sentinel Node Diagnostic: \`${targetNode.id}\`**\n\nHere is the real-time kernel telemetry for this node:`,
        nodeDetail: targetNode,
        quickActions: [
          { label: `🔄 Probe ${targetNode.id}`, action: `probe ${targetNode.id}`, type: 'probe' },
          { label: '⚡ Simulate Spike on this Node', action: `simulate spike on ${targetNode.id}`, type: 'primary' },
          { label: '📋 View All 42 Nodes', action: 'all nodes', type: 'navigate' },
        ],
      };
    }

    // 6. Run Health Probe
    if (q.includes('probe') || q.includes('ping') || q.includes('synthetic test')) {
      const targetService = services[0] || { id: 'payment-service', name: 'payment-service' };
      onTriggerProbe(targetService.id);
      return {
        text: `🔄 **In-Kernel Health Probe Executed Across All 42 Nodes:**\n\n• **Target Nodes:** Attached to 42 \`scyld-sentinel\` DaemonSet pods in \`${currentCluster.name}\`.\n• **eBPF Bytecode:** \`kprobe:cgroup_rstat_updated\` & \`tc:cls_bpf\`\n• **Probe Roundtrip Latency:** **1.14 ms**\n• **Kernel Ring-Buffer Drops:** **0 drops** · Throughput: **4.8 MB/s**\n• **Integrity:** 100% of physical nodes verified nominal.`,
        quickActions: [
          { label: '⚡ Test Anomaly Detection', action: 'simulate spike', type: 'primary' },
          { label: '🖥️ Inspect Node Fleet', action: 'whole sentinel node status', type: 'navigate' },
        ],
      };
    }

    // 7. Simulate Spike / Fault Injection
    if (
      q.includes('anomaly') ||
      q.includes('spike') ||
      q.includes('break') ||
      q.includes('crash') ||
      q.includes('leak') ||
      q.includes('fault')
    ) {
      const target = services[0] || { id: 'payment-service', name: 'payment-service' };
      onSimulateSpike(target.id);
      return {
        text: `⚡ **Chaos Surge Injected on \`${target.name}\` (Node-01)!**\n\n• **Anomaly:** Memory surge & CFS Quota spike to 68%\n• **Sentinel Action:** eBPF kernel hook detects threshold breach within **14ms**.\n• ${
          activeMode === 'gated'
            ? '🚨 **Gated Mode:** Action has been paused awaiting your **Human Approval**!'
            : '🛡️ **Armed Mode:** Sentinel will autonomously clamp the cgroup within **2.8 seconds**.'
        }`,
        quickActions: [
          { label: '⚠️ Review Human Approval Gate', action: 'where will I give human approval', type: 'approve' },
          { label: '🔄 Run Health Probe', action: 'run health probe', type: 'probe' },
        ],
      };
    }

    // 8. Navigation shortcuts
    if (q.includes('view incidents') || q.includes('open incidents')) {
      onNavigate('incidents');
      return { text: `Navigated to **Incidents & Approval Gates** tab.` };
    }
    if (q.includes('view nodes') || q.includes('open nodes') || q.includes('daemonset tab')) {
      onNavigate('nodes');
      return { text: `Navigated to **DaemonSet & Nodes** tab (displaying all 42 server nodes).` };
    }
    if (q.includes('view fleet') || q.includes('radar')) {
      onNavigate('fleet');
      return { text: `Navigated to **Fleet & Radar** microservices view.` };
    }

    // 9. Sentinel Mode Switch
    if (q.includes('armed') || (q.includes('switch') && q.includes('arm'))) {
      onSwitchMode('armed');
      return {
        text: `🛡️ **Mode Switched to ARMED:** Sentinel is now actively protecting all 42 nodes with autonomous in-kernel self-healing (no human wait).`,
        quickActions: [{ label: '⚡ Test Auto-Heal', action: 'simulate spike', type: 'primary' }],
      };
    }

    if (q.includes('dry') || q.includes('dry-run') || q.includes('passive')) {
      onSwitchMode('dry-run');
      return {
        text: `🛡️ **Mode Switched to DRY-RUN:** Sentinel is in passive observation mode. Kernel telemetry is collected, but no cgroups or Kubernetes pods will be mutated.`,
      };
    }

    if (q.includes('gated') || q.includes('human approval mode')) {
      onSwitchMode('gated');
      return {
        text: `🛡️ **Mode Switched to GATED (Human Approval Required):** Every remediation will pause and wait for your explicit approval before modifying containers or cgroup limits.`,
        quickActions: [
          { label: '⚡ Test Gated Approval Flow', action: 'simulate a gated incident', type: 'primary' },
        ],
      };
    }

    // 10. Company Clouds
    if (q.includes('acme') || q.includes('bank')) {
      onSwitchCompanyCloud('acme-bank');
      return {
        text: `🏢 **Switched to Acme Global Financial Corp (AWS EKS):**\n\n• **VPC:** Private PCI-DSS Banking VPC (us-east-1)\n• **Nodes:** 48 worker nodes with eBPF agents\n• **Services:** Payment gateway, ledger, fraud detection, ACH transfer.`,
      };
    }

    if (q.includes('metro') || q.includes('health') || q.includes('hospital')) {
      onSwitchCompanyCloud('metro-health');
      return {
        text: `🏥 **Switched to MetroHealth Medical Systems (GCP GKE):**\n\n• **VPC:** HIPAA-Compliant Healthcare Cluster (us-central1)\n• **Nodes:** 36 worker nodes with eBPF agents\n• **Services:** EHR query, telemetry vital sync, pharmacy dispatch.`,
      };
    }

    if (q.includes('logistics') || q.includes('azure')) {
      onSwitchCompanyCloud('global-logistics');
      return {
        text: `🚚 **Switched to Global Logistics Telematics (Azure AKS):**\n\n• **VPC:** Supply Chain Edge Cluster (eastus)\n• **Nodes:** 54 worker nodes with eBPF agents\n• **Services:** GPS stream, route optimizer, warehouse inventory.`,
      };
    }

    if (q.includes('connect cloud') || q.includes('company cloud') || q.includes('sandbox')) {
      onOpenCloudConnect();
      return {
        text: `🌐 **Company Cloud Prototype Manager Opened!**\n\nYou can select any cloud provider (AWS, GCP, Azure, Kubernetes) or simulate customer enterprise clusters like Acme Bank or MetroHealth.`,
      };
    }

    // 11. Tab Comparisons and Definitions
    if (q.includes('control room') && (q.includes('fleet') || q.includes('radar') || q.includes('difference'))) {
      return {
        text: `📊 **Difference: Fleet & Radar vs. Control Room**\n\n• **Fleet & Radar (\`#/fleet\`): Microscopic View**\n  Focuses on the **14 individual microservices** (like payment-service, auth, cart). You see live CPU/RAM metrics, the circular radar topology, and deep in-kernel telemetry inspection for each container.\n\n• **Control Room (\`#/control-room\`): Macroscopic View**\n  The cluster-wide executive command center. It gives you aggregate cluster KPIs (global uptime, MTTR recovery speed, real-time throughput spikes, and overall incident streams) without needing to inspect individual containers.`,
        quickActions: [
          { label: '📡 Open Fleet & Radar', action: 'view fleet', type: 'navigate' },
          { label: '🖥️ Open Control Room', action: 'view control room', type: 'primary' },
        ],
      };
    }

    if ((q.includes('chaos') || q.includes('matrix')) && (q.includes('inject') || q.includes('fault') || q.includes('difference'))) {
      return {
        text: `⚡ **Difference: Inject Faults vs. Chaos Matrix**\n\n• **Inject Faults (\`#/faults\`): Live Execution Console**\n  This is your active test trigger. You pick a service and fire off an immediate simulation (like a sudden memory leak, CFS throttle, or packet drop) to watch Sentinel detect and heal it in real-time.\n\n• **Chaos Matrix (\`#/chaos\`): Resilience Scorecard & Test Report**\n  A complete bird's-eye grid showing all services against all failure scenarios. It shows which services passed previous chaos tests, their recovery times (MTTR), and highlights any untested services.`,
        quickActions: [
          { label: '⚡ Go to Inject Faults', action: 'view faults', type: 'navigate' },
          { label: '🎛️ Go to Chaos Matrix', action: 'view chaos', type: 'primary' },
        ],
      };
    }

    if (q.includes('daemonset') || q.includes('what is daemonset') || (q.includes('node') && q.includes('what is'))) {
      return {
        text: `🖥️ **What is "DaemonSet & Nodes"?**\n\n• **Nodes:**\n  These are the physical or virtual Linux servers in your cloud (e.g. AWS EC2 or Google Cloud compute instances). In this cluster, you have **42 worker nodes** providing CPU and memory.\n\n• **DaemonSet:**\n  A Kubernetes rule that commands: *"Automatically run exactly one copy of the ScyldAI Sentinel agent on every single server node."*\n\n• **Why it's game-changing:**\n  Because the agent runs directly on the host server using **eBPF**, it reads directly from the Linux kernel. Companies deploy it with **1 single command** and need **0 changes to their apps or code**!`,
        quickActions: [
          { label: '🖥️ View DaemonSet & Nodes Tab', action: 'view nodes', type: 'navigate' },
          { label: '🔄 Run Health Probe on 42 Nodes', action: 'run health probe on all nodes', type: 'probe' },
        ],
      };
    }

    // 12. Simple Explanation / Non-Technical Overview
    if (
      q.includes('simple') ||
      q.includes('what is') ||
      q.includes('explain') ||
      q.includes('help') ||
      q.includes('how does it work')
    ) {
      return {
        text: `### 💡 How Sentinel Works for the Whole Node Fleet:\n\n1. **One Agent on Every Server:**\n   Runs as a Kubernetes \`DaemonSet\`. You deploy it with 1 command. **Zero changes to your apps**.\n\n2. **Direct In-Kernel eBPF:**\n   The agent listens to Linux kernel system calls and cgroup stats from the host itself, with < 0.3% CPU overhead.\n\n3. **Sub-Second Auto-Heal (2.8s):**\n   When an app memory-leaks or CPU-throttles, Sentinel clamps the cgroup or dynamically sheds noisy neighbor threads before an out-of-memory crash occurs.\n\n4. **Human Approval Safeguard:**\n   In **Gated mode**, Sentinel freezes the process in kernel memory and pauses for your approval before modifying anything!\n\nAsk me: *"Where will I give human approval?"*, *"Inspect Node 1"*, or *"Run health probe"*!`,
        quickActions: [
          { label: '⚠️ Where is Human Approval?', action: 'where will I give human approval' },
          { label: '🖥️ Status of Whole Sentinel Node', action: 'whole sentinel node status' },
          { label: '🔄 Run Health Probe', action: 'run health probe on all nodes' },
        ],
      };
    }

    // Default Fallback
    return {
      text: `### 🤖 Sentinel Node Fleet Co-Pilot:\n\nI received your query: *"I received: "${query}"*.\n\nAll **42 server nodes** and **14 microservices** are currently reporting nominal status in \`${currentCluster.name}\`.\n\nHere are commands you can execute right now:`,
      quickActions: [
        { label: '⚠️ Where will I give human approval?', action: 'where will I give human approval' },
        { label: '🖥️ Inspect Whole Sentinel Node', action: 'whole sentinel node status' },
        { label: '🔄 Run In-Kernel Health Probe', action: 'run health probe on all nodes' },
        { label: '⚡ Simulate Test Spike', action: 'simulate spike' },
      ],
    };
  };

  return (
    <>
      {/* Floating Chat Trigger Button in Bottom Right */}
      {!isOpen && (
        <button
          onClick={onToggle}
          type="button"
          className="fixed bottom-5 right-5 z-40 px-4 py-3 rounded-full bg-[#7a93ac] hover:bg-[#b0c9e4] text-[#112c41] font-bold text-[13px] shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer border border-[#cde5ff]/30 group"
          title="Open AI Sentinel Assistant"
        >
          <div className="relative">
            <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">
              smart_toy
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#aacfb6] border-2 border-[#112c41] absolute -top-1 -right-1 animate-pulse"></span>
          </div>
          <span>Sentinel AI Assistant</span>
          {pendingGates.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#C9A66B] text-[#191c20] text-[10px] font-mono font-bold animate-bounce">
              {pendingGates.length} Gate
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Dialog Window */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-full max-w-[460px] h-[640px] max-h-[92vh] bg-[#111417] border-2 border-[#7a93ac] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Chat Header */}
          <div className="p-3.5 bg-[#191c20] border-b border-[#272a2e] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#aacfb6]/20 border border-[#aacfb6] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#aacfb6] text-[18px]">
                  smart_toy
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-[14px] text-[#e1e2e8]">
                    Sentinel Node Co-Pilot
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-[#aacfb6] animate-pulse"></span>
                </div>
                <span className="text-[10px] font-mono text-[#8d9197] block">
                  Cluster: {currentCluster.name} · 42 Server Nodes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setMessages([
                    {
                      id: `welcome-${Date.now()}`,
                      sender: 'assistant',
                      text: `Conversation cleared. I am ready to assist with all 42 sentinel nodes, human approvals, or cloud connections!`,
                      timestamp: 'Just now',
                      quickActions: [
                        { label: '⚠️ Where is Human Approval?', action: 'where will I give human approval' },
                        { label: '🖥️ Status of Whole Sentinel Node', action: 'whole sentinel node status' },
                      ],
                    },
                  ]);
                }}
                className="p-1 rounded text-[#8d9197] hover:text-[#e1e2e8] hover:bg-[#272a2e] text-[11px] font-mono"
                title="Clear conversation"
              >
                Clear
              </button>
              <button
                onClick={onToggle}
                className="p-1 rounded text-[#8d9197] hover:text-[#e1e2e8] hover:bg-[#272a2e]"
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Pending Approval Gate Alert Banner inside Chat if any */}
          {pendingGates.length > 0 && (
            <div className="p-2.5 bg-[#C9A66B]/25 border-b border-[#C9A66B]/50 flex items-center justify-between text-[11px] text-[#C9A66B] animate-pulse">
              <span className="font-semibold flex items-center gap-1">
                <span>⚠️</span>
                <span>{pendingGates.length} Action Awaiting Human Approval</span>
              </span>
              <button
                onClick={() => handleSendMessage('Approve the pending gate')}
                className="px-2.5 py-0.5 rounded bg-[#aacfb6] text-[#153725] font-bold hover:bg-[#c5ecd1] transition-colors cursor-pointer"
              >
                Click to Approve
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 font-sans text-[13px] leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] p-3.5 rounded-2xl ${
                    m.sender === 'user'
                      ? 'bg-[#7a93ac] text-[#112c41] font-semibold rounded-tr-xs'
                      : 'bg-[#1d2024] text-[#e1e2e8] border border-[#272a2e] rounded-tl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>

                  {/* Rich Node Detail Card if present */}
                  {m.nodeDetail && (
                    <div className="mt-2.5 p-3 rounded-xl bg-[#0b0e12] border border-[#272a2e] text-[11px] font-mono space-y-2">
                      <div className="flex items-center justify-between text-[#aacfb6] font-bold">
                        <span>{m.nodeDetail.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#aacfb6]/20 text-[#aacfb6]">
                          {m.nodeDetail.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[#8d9197]">
                        <div>Zone: <span className="text-[#e1e2e8]">{m.nodeDetail.zone}</span></div>
                        <div>CPU: <span className="text-[#e1e2e8]">{m.nodeDetail.cpuCores} Cores</span></div>
                        <div>RAM: <span className="text-[#e1e2e8]">{m.nodeDetail.memGb} GB</span></div>
                        <div>Containers: <span className="text-[#e1e2e8]">{m.nodeDetail.runningContainers}</span></div>
                        <div className="col-span-2">
                          Pod: <span className="text-[#b0c9e4]">{m.nodeDetail.daemonSetPod}</span>
                        </div>
                        <div className="col-span-2 text-[#aacfb6]">
                          Driver: {m.nodeDetail.ebpfDriverStatus} ({m.nodeDetail.kernelVersion})
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rich Pending Approval Gate Card if present */}
                  {m.pendingGate && (
                    <div className="mt-2.5 p-3 rounded-xl bg-[#0b0e12] border-2 border-[#C9A66B] text-[12px] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#e1e2e8]">
                          {m.pendingGate.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-[#C9A66B]/20 text-[#C9A66B] font-mono text-[10px] font-bold">
                          GATE REQUIRED
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8d9197]">
                        Target: <strong className="text-[#b0c9e4]">{m.pendingGate.serviceName}</strong> ({m.pendingGate.id})
                      </div>
                      <div className="p-2 rounded bg-[#191c20] text-[#aacfb6] font-mono text-[11px]">
                        <strong>Proposed Fix:</strong> {m.pendingGate.ebpfProposedFix || m.pendingGate.ebpfActionTaken}
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleSendMessage(`reject ${m.pendingGate?.id}`)}
                          className="px-2.5 py-1 rounded bg-[#272a2e] text-[#ffb4ab] hover:bg-[#ffb4ab]/20 text-[11px] font-medium cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleSendMessage(`approve ${m.pendingGate?.id}`)}
                          className="px-3.5 py-1 rounded bg-[#aacfb6] text-[#153725] hover:bg-[#c5ecd1] font-bold text-[11px] cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          <span>Approve & Execute Fix</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Interactive Action Chips inside Message */}
                  {m.quickActions && m.quickActions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-[#272a2e]/60 flex flex-wrap gap-1.5">
                      {m.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(qa.action)}
                          className={`px-2 py-0.8 rounded-md text-[10px] font-medium transition-all cursor-pointer ${
                            qa.type === 'approve'
                              ? 'bg-[#aacfb6] text-[#153725] font-bold hover:bg-[#c5ecd1]'
                              : qa.type === 'reject'
                              ? 'bg-[#272a2e] text-[#ffb4ab] hover:bg-[#ffb4ab]/20 border border-[#ffb4ab]/30'
                              : qa.type === 'primary'
                              ? 'bg-[#7a93ac]/20 text-[#b0c9e4] border border-[#7a93ac]/40 hover:bg-[#7a93ac]/40'
                              : 'bg-[#0b0e12] text-[#c3c7cd] hover:text-[#e1e2e8] border border-[#272a2e] hover:border-[#7a93ac]'
                          }`}
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] font-mono text-[#8d9197] mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-[#1d2024] text-[#8d9197] max-w-[120px] border border-[#272a2e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#aacfb6] animate-bounce"></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#aacfb6] animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#aacfb6] animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Command Action Pills at bottom */}
          <div className="px-3 py-2 bg-[#191c20] border-t border-[#272a2e] flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-[#8d9197] shrink-0 font-mono">Action:</span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-[#0b0e12] hover:bg-[#272a2e] text-[#b0c9e4] border border-[#272a2e] transition-colors shrink-0 whitespace-nowrap cursor-pointer font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#191c20] border-t border-[#272a2e] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about node 1, human approval, or probe..."
              className="flex-1 bg-[#0b0e12] text-[#e1e2e8] text-[13px] px-3 py-2 rounded-xl border border-[#272a2e] focus:outline-none focus:border-[#7a93ac] placeholder:text-[#8d9197]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-9 h-9 rounded-xl bg-[#7a93ac] hover:bg-[#b0c9e4] text-[#112c41] flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
};
