import React, { useState, useRef, useEffect } from 'react';
import { Microservice } from '../types/fleet';

interface AskSentinelModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Microservice[];
  onInspectService: (serviceId: string) => void;
  onTweakQuota: (service: Microservice) => void;
}

interface CommandHistoryItem {
  id: string;
  type: 'cmd' | 'output' | 'error' | 'success' | 'system';
  text: string;
  timestamp: string;
}

export const AskSentinelModal: React.FC<AskSentinelModalProps> = ({
  isOpen,
  onClose,
  services,
  onInspectService,
  onTweakQuota,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'ScyldAI Sentinel Autonomous Kernel Agent v4.18 [CO-RE Active]',
      timestamp: '00:00:01',
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'Connected to eBPF ring buffer /sys/kernel/debug/tracing/trace_pipe (prod-us-east-1)',
      timestamp: '00:00:01',
    },
    {
      id: 'init-3',
      type: 'output',
      text: 'Type "help" for a list of available sentinel kernel commands or ask diagnostic questions.',
      timestamp: '00:00:02',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  if (!isOpen) return null;

  const handleCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    const time = new Date().toISOString().substring(11, 19);
    const newItems: CommandHistoryItem[] = [
      {
        id: `cmd-${Date.now()}`,
        type: 'cmd',
        text: `sentinel@us-east-1:~$ ${trimmed}`,
        timestamp: time,
      },
    ];

    const lower = trimmed.toLowerCase();

    if (lower === 'help') {
      newItems.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `AVAILABLE COMMANDS:
  status                - View cluster overview & eBPF hooks health
  list                  - List all 14 microservices and CFS quota metrics
  inspect <service>     - Deep probe service telemetry (e.g. "inspect payment-service")
  quota <service>       - Open CFS quota adjustment panel
  maps                  - Dump in-kernel BPF maps (bpf_map_lookup_elem)
  threats               - Query active anomaly detection and cgroup pressure
  whoami                - Display current operator credentials and security clearance
  clear                 - Clear terminal output
  <question>            - Ask natural language query to Sentinel AI Co-Pilot`,
        timestamp: time,
      });
    } else if (lower === 'clear') {
      setHistory([]);
      setInput('');
      return;
    } else if (lower === 'status') {
      const avgHealth = (services.reduce((acc, s) => acc + s.health, 0) / services.length).toFixed(1);
      newItems.push({
        id: `out-${Date.now()}`,
        type: 'success',
        text: `[CLUSTER NOMINAL] 14 Services Active · Avg Health ${avgHealth}% · 42 Nodes
eBPF Probes Loaded: 72 hooks across kprobe, kretprobe, tracepoints, tc filters
Ring Buffer Drops: 0 frames · Telemetry Throughput: 4.8MB/s
Autonomous Mitigations: 18 actions in past 24 hours · MTTR 2.8s`,
        timestamp: time,
      });
    } else if (lower === 'list') {
      const rows = services
        .map(
          (s) =>
            `• [PID ${s.pid.toString().padEnd(5)}] ${s.name.padEnd(24)} | Quota: ${s.cfsQuota.toString().padStart(2)}% | RSS: ${s.rssMb}MB | Health: ${s.health}% [${s.status.toUpperCase()}]`
        )
        .join('\n');
      newItems.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `ACTIVE MICROSERVICES IN PROD-US-EAST-1:\n${rows}`,
        timestamp: time,
      });
    } else if (lower.startsWith('inspect')) {
      const target = trimmed.split(' ')[1];
      const match = services.find(
        (s) => s.name.toLowerCase() === target?.toLowerCase() || s.id === target?.toLowerCase() || s.pid.toString() === target
      );
      if (match) {
        onInspectService(match.id);
        newItems.push({
          id: `out-${Date.now()}`,
          type: 'success',
          text: `[INSPECT] Switched inspection drawer to "${match.name}" (PID ${match.pid}).
  cgroup path: ${match.cgroupPath}
  RSS: ${match.rssMb}MB (Anon: ${match.anonMb}MB, File: ${match.fileMb}MB)
  Syscalls: ${match.syscallsPerSec}/sec · eBPF Hooks: ${match.ebpfHooksCount}
  VMA Frag: ${match.vmaFragmentation}% · Status: ${match.statusText}`,
          timestamp: time,
        });
      } else {
        newItems.push({
          id: `out-${Date.now()}`,
          type: 'error',
          text: `Service "${target}" not found. Try "inspect payment-service" or "list".`,
          timestamp: time,
        });
      }
    } else if (lower.startsWith('quota')) {
      const target = trimmed.split(' ')[1];
      const match = services.find(
        (s) => s.name.toLowerCase() === target?.toLowerCase() || s.id === target?.toLowerCase()
      );
      if (match) {
        onTweakQuota(match);
        newItems.push({
          id: `out-${Date.now()}`,
          type: 'success',
          text: `Opening CFS Quota adjustment modal for ${match.name}...`,
          timestamp: time,
        });
      } else {
        newItems.push({
          id: `out-${Date.now()}`,
          type: 'error',
          text: `Please specify a valid service name. Example: "quota payment-service".`,
          timestamp: time,
        });
      }
    } else if (lower === 'maps') {
      newItems.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `KERNEL BPF HASH & RINGBUF MAPS:
  0x1: map_sentinel_cgroup_rss       (type: BPF_MAP_TYPE_HASH, max_entries: 1024, flags: 0x0)
  0x2: map_sentinel_rate_pacing      (type: BPF_MAP_TYPE_ARRAY, max_entries: 256, flags: 0x0)
  0x3: map_sentinel_ringbuf_events   (type: BPF_MAP_TYPE_RINGBUF, max_entries: 4194304)
  0x4: map_isolation_forest_scores   (type: BPF_MAP_TYPE_PERCPU_HASH, max_entries: 512)
All maps synched with CO-RE vmlinux.h relocations.`,
        timestamp: time,
      });
    } else if (lower === 'threats') {
      newItems.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `[ANOMALY THREAT MATRIX]
  • db-connection-pool (PID 9281): Minor cycling anomaly (score 0.18). SIGUSR1 workers recyclying cleanly.
  • payment-service (PID 18420): Memory drain auto-completed 3.2s ago. Anomaly score 0.04 (Nominal).
No unhandled panics or cascade risks detected across 42 cluster nodes.`,
        timestamp: time,
      });
    } else if (lower === 'whoami') {
      newItems.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: `OPERATOR: sit24sc025@sairamtap.edu.in
ROLE: SecOps Kernel Commander / SRE Lead
CLEARANCE: Level-5 (Full eBPF JIT & cgroup clamp authority)
SESSION: live-sess-ebpf-99214 · Token valid until 2026-10-02 23:59:59 UTC`,
        timestamp: time,
      });
    } else {
      // Natural language response
      const answer = generateAiAnswer(trimmed, services);
      newItems.push({
        id: `out-${Date.now()}`,
        type: 'output',
        text: answer,
        timestamp: time,
      });
    }

    setHistory((prev) => [...prev, ...newItems]);
    setInput('');
  };

  const generateAiAnswer = (prompt: string, servs: Microservice[]): string => {
    const p = prompt.toLowerCase();
    if (p.includes('cfs') || p.includes('quota') || p.includes('cpu')) {
      const highest = [...servs].sort((a, b) => b.cfsQuota - a.cfsQuota)[0];
      return `[Sentinel Co-Pilot Analysis]: Current cluster CFS quota utilization is average 14.8%. The highest load microservice is "${highest.name}" at ${highest.cfsQuota}% quota. Proactive eBPF suppression is currently holding throttle rates at 0%.`;
    }
    if (p.includes('memory') || p.includes('leak') || p.includes('rss')) {
      return `[Sentinel Co-Pilot Analysis]: Payment-service recently experienced an anonymous memory spike which was drained in 320ms via kprobe:cgroup_rstat. Total cluster memory is healthy with zero OOM killer events in the past 7 days.`;
    }
    if (p.includes('db') || p.includes('database') || p.includes('pool')) {
      const db = servs.find((s) => s.id === 'db-connection-pool');
      return `[Sentinel Co-Pilot Analysis]: "db-connection-pool" (PID ${db?.pid}) is performing graceful SIGUSR1 worker recycling to maintain pristine socket pools. It is currently at ${db?.health}% health with 243MB RSS.`;
    }
    return `[Sentinel Co-Pilot]: ScyldAI Sentinel is monitoring all 14 containerized microservices in kernel-space. Ring-buffer latency is 1.4ms with continuous eBPF trace vector sampling. Type "help" to view quick commands.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-4xl h-[560px] max-h-[90vh] bg-[#0b0e12] border border-[#272a2e] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Terminal Header */}
        <div className="h-11 px-4 bg-[#191c20] border-b border-[#272a2e] flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ffb4ab]/80 inline-block cursor-pointer" onClick={onClose}></span>
            <span className="w-3 h-3 rounded-full bg-[#C9A66B]/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#aacfb6]/80 inline-block"></span>
            <span className="ml-2 font-mono text-[12px] text-[#e1e2e8] flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[15px] text-[#b0c9e4]">terminal</span>
              Ask Sentinel — eBPF Query & Co-Pilot Console
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#8d9197] hover:text-[#e1e2e8] text-[18px] p-1 rounded hover:bg-[#272a2e] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Quick Command Pills */}
        <div className="px-4 py-2 bg-[#111417] border-b border-[#272a2e]/60 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
          <span className="text-[#8d9197] shrink-0">Quick Run:</span>
          {['status', 'list', 'inspect payment-service', 'maps', 'threats', 'whoami', 'clear'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => handleCommand(cmd)}
              className="px-2 py-0.5 rounded bg-[#1d2024] hover:bg-[#272a2e] text-[#b0c9e4] border border-[#272a2e] transition-colors shrink-0"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Terminal Body */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-[12px] leading-relaxed space-y-2 selection:bg-[#7a93ac]/40">
          {history.map((item) => (
            <div key={item.id} className="whitespace-pre-wrap break-all">
              {item.type === 'cmd' && (
                <div className="text-[#b0c9e4] font-medium">{item.text}</div>
              )}
              {item.type === 'system' && (
                <div className="text-[#8d9197]">{item.text}</div>
              )}
              {item.type === 'success' && (
                <div className="text-[#aacfb6]">{item.text}</div>
              )}
              {item.type === 'error' && (
                <div className="text-[#ffb4ab]">{item.text}</div>
              )}
              {item.type === 'output' && (
                <div className="text-[#e1e2e8]">{item.text}</div>
              )}
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(input);
          }}
          className="p-3 bg-[#111417] border-t border-[#272a2e] flex items-center gap-2"
        >
          <span className="text-[#aacfb6] font-mono text-[13px] font-bold">sentinel@kernel:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type 'help' or ask a diagnostic question (e.g. 'cfs pressure' or 'inspect db-connection-pool')..."
            className="flex-1 bg-transparent font-mono text-[13px] text-[#e1e2e8] focus:outline-none placeholder:text-[#8d9197]"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded bg-[#7a93ac]/30 hover:bg-[#7a93ac] text-[#cde5ff] hover:text-[#112c41] text-[12px] font-mono transition-colors font-medium"
          >
            Execute
          </button>
        </form>
      </div>
    </div>
  );
};
