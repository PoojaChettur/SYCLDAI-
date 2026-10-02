import React, { useState } from 'react';

export const DatasetsView: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<any>(null);

  const datasets = [
    {
      id: 'DS-EBPF-001',
      title: 'Linux eBPF High-Throughput Ring Buffer Trace',
      format: 'JSON',
      records: '1,420,800 events',
      size: '48.2 MB',
      category: 'Kernel Traces',
      date: '2026-10-01',
      sample: {
        timestamp_ns: 1727829142810420,
        pid: 18420,
        comm: 'payment-service',
        probe: 'kprobe:cgroup_rstat',
        rss_bytes: 147008512,
        anon_bytes: 117440512,
        cfs_throttles: 0,
        status: 'NOMINAL',
      },
    },
    {
      id: 'DS-CHAOS-002',
      title: '14-Microservice Chaos Fault Injection Benchmark',
      format: 'CSV',
      records: '450 runs',
      size: '8.4 MB',
      category: 'Anomaly Vectors',
      date: '2026-09-28',
      sample: {
        experiment_id: 'EXP-9921',
        target_service: 'db-connection-pool',
        fault: 'SIGUSR1_POOL_RECYCLE',
        mttr_ms: 1820,
        dropped_queries: 0,
        cluster_nodes: 42,
      },
    },
    {
      id: 'DS-SLO-003',
      title: 'Sub-Second MTTR Resilience Log Stream',
      format: 'PARQUET',
      records: '82,400 mitigation cycles',
      size: '12.1 MB',
      category: 'MTTR Logs',
      date: '2026-09-25',
      sample: {
        cycle_id: 'CYC-142',
        autonomous_agent: 'sentinel-core-v4.18',
        recovery_time_sec: 2.8,
        cost_avoided_usd: 5400,
        validation_sig: '0x8fba...4491',
      },
    },
  ];

  const handleDownload = (ds: any) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(ds, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${ds.id.toLowerCase()}-sample.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      <div className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold text-[#e1e2e8]">
            ScyldAI Telemetry Datasets & Results
          </h2>
          <p className="text-[12px] text-[#8d9197] mt-1">
            Raw eBPF trace captures, chaos matrix evaluations, and verifiable machine learning ground-truth logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {datasets.map((ds) => (
          <div
            key={ds.id}
            className="bg-[#1d2024] rounded-lg p-5 border border-[#272a2e] hover:border-[#43474c] transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#8d9197]">
                <span className="text-[#b0c9e4] font-semibold">{ds.id}</span>
                <span className="bg-[#0b0e12] px-2 py-0.5 rounded border border-[#272a2e]">
                  {ds.format}
                </span>
              </div>
              <h3 className="font-semibold text-[14px] text-[#e1e2e8] mt-2">{ds.title}</h3>
              <div className="text-[11px] text-[#8d9197] mt-1">
                {ds.records} · {ds.size}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#272a2e]">
              <button
                onClick={() => setSelectedDataset(ds)}
                className="flex-1 py-1.5 rounded bg-[#272a2e] hover:bg-[#323539] text-[#e1e2e8] text-[12px] font-medium transition-colors"
              >
                Preview Sample
              </button>
              <button
                onClick={() => handleDownload(ds)}
                className="px-3 py-1.5 rounded bg-[#7a93ac]/20 hover:bg-[#7a93ac] text-[#b0c9e4] hover:text-[#112c41] text-[12px] font-medium transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Get</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedDataset && (
        <div className="p-5 bg-[#0b0e12] rounded-lg border border-[#272a2e] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#272a2e]">
            <span className="text-[12px] font-mono text-[#aacfb6]">
              Previewing Sample Record for: {selectedDataset.title}
            </span>
            <button
              onClick={() => setSelectedDataset(null)}
              className="text-[#8d9197] hover:text-[#e1e2e8] text-[12px]"
            >
              ✕ Close
            </button>
          </div>
          <pre className="font-mono text-[12px] text-[#e1e2e8] overflow-x-auto p-3 bg-[#111417] rounded">
            {JSON.stringify(selectedDataset.sample, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
