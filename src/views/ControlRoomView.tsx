import React, { useState } from 'react';
import { Microservice, IncidentGate } from '../types/fleet';

interface ControlRoomViewProps {
  services: Microservice[];
  incidents: IncidentGate[];
  onNavigateToFleet: (serviceId?: string) => void;
  onNavigateToIncidents: () => void;
  onNavigateToFaults: () => void;
}

export const ControlRoomView: React.FC<ControlRoomViewProps> = ({
  services,
  incidents,
  onNavigateToFleet,
  onNavigateToIncidents,
  onNavigateToFaults,
}) => {
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState(0);

  const timelineEvents = [
    {
      time: '03:14 AM',
      service: services[0]?.name || 'payment-service',
      title: 'Autonomous Tier-1 Micro-Drain',
      desc: 'Freed 42MB inactive heap without container restart · 2.8s MTTR',
      tag: 'Auto-Mitigated',
      status: 'nominal',
    },
    {
      time: '02:51 AM',
      service: services[2]?.name || 'db-connection-pool',
      title: 'SIGUSR1 Worker Rebalance',
      desc: 'Recycled socket pool without dropping active queries · 1.4s MTTR',
      tag: 'Graceful Cycle',
      status: 'cycling',
    },
    {
      time: '01:22 AM',
      service: services[4]?.name || 'order-fulfillment',
      title: 'cgroup CFS Burst Suppression',
      desc: 'Throttled CPU spike without client timeout or SLA breach',
      tag: 'Pacing Active',
      status: 'nominal',
    },
    {
      time: '12:45 AM',
      service: services[3]?.name || 'edge-gateway-router',
      title: 'eBPF TC Egress Shaping',
      desc: 'Stabilized wire-speed TCP packets under microburst traffic',
      tag: 'TC Optimal',
      status: 'nominal',
    },
  ];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* 4 High-Level Telemetry Cards matching original */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Cluster Health */}
        <div className="bg-[#1d2024] p-5 rounded-lg shadow-sm border border-[#272a2e] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8d9197] uppercase tracking-wider">
              Cluster Health
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#272a2e]">
              <span className="h-2 w-2 rounded-full bg-[#aacfb6]"></span>
              <span className="font-mono text-[11px] text-[#aacfb6]">Nominal</span>
            </div>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="font-mono text-[26px] font-semibold text-[#e1e2e8]">99.8%</span>
            <span className="text-[13px] text-[#8d9197]">42 / 42 Nodes</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#8d9197] font-mono text-[11px]">
            <span className="material-symbols-outlined text-[16px] text-[#aacfb6]">check_circle</span>
            <span>Zero unhandled panics</span>
          </div>
        </div>

        {/* Metric 2: Autonomous Fixes */}
        <div className="bg-[#1d2024] p-5 rounded-lg shadow-sm border border-[#272a2e] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8d9197] uppercase tracking-wider">
              Autonomous Fixes
            </span>
            <span className="font-mono text-[11px] text-[#b0c9e4] px-2 py-0.5 rounded bg-[#272a2e]">
              24h window
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="font-mono text-[26px] font-semibold text-[#e1e2e8]">18</span>
            <span className="text-[13px] text-[#aacfb6] font-medium">100% mitigated</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#8d9197] font-mono text-[11px]">
            <span className="material-symbols-outlined text-[16px] text-[#b0c9e4]">speed</span>
            <span>Avg recovery 2.8s</span>
          </div>
        </div>

        {/* Metric 3: cgroup Quota Pressure */}
        <div className="bg-[#1d2024] p-5 rounded-lg shadow-sm border border-[#272a2e] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8d9197] uppercase tracking-wider">
              cgroup Quota Pressure
            </span>
            <span className="font-mono text-[11px] text-[#c3c7cd] px-2 py-0.5 rounded bg-[#272a2e]">
              Normal
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="font-mono text-[26px] font-semibold text-[#e1e2e8]">18%</span>
            <span className="text-[13px] text-[#8d9197]">Peak 23%</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#8d9197] font-mono text-[11px]">
            <span className="material-symbols-outlined text-[16px] text-[#c3c7cd]">tune</span>
            <span>Zero throttled periods</span>
          </div>
        </div>

        {/* Metric 4: Sentinel Protection */}
        <div className="bg-[#1d2024] p-5 rounded-lg shadow-sm border border-[#272a2e] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#8d9197] uppercase tracking-wider">
              Sentinel Protection
            </span>
            <span className="font-mono text-[11px] text-[#aacfb6] px-2 py-0.5 rounded bg-[#272a2e]">
              Kernel CO-RE
            </span>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-[20px] font-semibold text-[#b0c9e4]">Armed & In-Kernel</span>
            <span className="material-symbols-outlined text-[#aacfb6] text-[20px]">verified</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#8d9197] font-mono text-[11px] truncate">
            <span>Ring Buffer 4.8MB/s · 0 drop</span>
          </div>
        </div>
      </section>

      {/* Main Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (60%): 6 Microservice Core Cards */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-[17px] font-semibold text-[#e1e2e8]">
                Protected Microservices Overview
              </h2>
              <span className="text-[12px] text-[#8d9197]">
                Continuous eBPF trace vector sampling · Calm window nominal
              </span>
            </div>
            <button
              onClick={() => onNavigateToFleet()}
              className="text-[12px] font-mono text-[#b0c9e4] hover:underline"
            >
              Full 14 Fleet View →
            </button>
          </div>

          {/* 6 Microservice Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.slice(0, 6).map((service) => {
              const isCycling = service.status === 'cycling';
              return (
                <div
                  key={service.id}
                  onClick={() => onNavigateToFleet(service.id)}
                  className="bg-[#1d2024] p-5 rounded-lg border border-[#272a2e] hover:border-[#43474c] hover:bg-[#272a2e]/40 transition-colors cursor-pointer flex flex-col justify-between space-y-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isCycling ? 'bg-[#C9A66B] animate-pulse' : 'bg-[#aacfb6]'
                            }`}
                          ></span>
                          <span className="font-semibold text-[14px] text-[#e1e2e8]">
                            {service.name}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-[#8d9197] block mt-0.5">
                          {service.category.toUpperCase()} · PID {service.pid}
                        </span>
                      </div>

                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded bg-[#0b0e12] border border-[#272a2e] ${
                          service.badgeColor || (isCycling ? 'text-[#C9A66B]' : 'text-[#aacfb6]')
                        }`}
                      >
                        {service.badgeText || (isCycling ? 'Investigating' : 'Baseline Synced')}
                      </span>
                    </div>

                    {/* 3 Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2 bg-[#0b0e12] p-2 rounded border border-[#272a2e]/40 text-center">
                      <div>
                        <div className="font-mono text-[10px] text-[#8d9197]">Health</div>
                        <div
                          className={`font-mono text-[13px] font-semibold ${
                            isCycling ? 'text-[#C9A66B]' : 'text-[#aacfb6]'
                          }`}
                        >
                          {service.health}%
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-[#8d9197]">CFS Quota</div>
                        <div className="font-mono text-[13px] font-semibold text-[#e1e2e8]">
                          {service.cfsQuota}%
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-[10px] text-[#8d9197]">Memory</div>
                        <div className="font-mono text-[13px] font-semibold text-[#e1e2e8]">
                          {service.memoryMb}
                          <span className="text-[#8d9197] text-[10px]">
                            /{service.memoryLimitMb}M
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-[11px] text-[#8d9197] flex items-center gap-1.5 leading-snug">
                    <span className="material-symbols-outlined text-[15px] text-[#b0c9e4] shrink-0">
                      {service.iconName || 'model_training'}
                    </span>
                    <span className="truncate">{service.statusText}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspection Banner Drawer Hint */}
          <div
            onClick={() => onNavigateToFleet()}
            className="p-3.5 rounded-lg bg-[#191c20] border border-[#272a2e] flex items-center justify-between text-[#c3c7cd] hover:border-[#7a93ac] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 font-mono text-[12px]">
              <span className="material-symbols-outlined text-[18px] text-[#b0c9e4]">terminal</span>
              <span>Click any card to inspect cgroup RSS, zombie PIDs, and eBPF trace vectors</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#8d9197]">chevron_right</span>
          </div>
        </div>

        {/* Right Column (40%): Incidents & Auto-Recovery Timeline */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex flex-col pb-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-[#e1e2e8]">
                Incidents & Auto-Recovery
              </h2>
              <span className="font-mono text-[11px] text-[#aacfb6] px-2 py-0.5 rounded bg-[#272a2e]">
                3am shift calm
              </span>
            </div>
            <span className="text-[12px] text-[#8d9197] mt-0.5">
              Quiet autonomous actions resolved without paging engineers
            </span>
          </div>

          {/* Shift Event Stream List */}
          <div className="space-y-2.5">
            {timelineEvents.map((evt, idx) => {
              const isSelected = selectedTimelineIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedTimelineIndex(idx)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between shadow-sm ${
                    isSelected
                      ? 'bg-[#272a2e] border-[#7a93ac] ring-1 ring-[#7a93ac]/30'
                      : 'bg-[#1d2024] border-[#272a2e] hover:bg-[#191c20]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-[#8d9197]">{evt.time}</span>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        evt.status === 'cycling' ? 'bg-[#C9A66B]' : 'bg-[#aacfb6]'
                      }`}
                    ></div>
                    <div>
                      <span className="text-[13px] font-medium text-[#e1e2e8] block">
                        {evt.service}
                      </span>
                      <span className="text-[11px] font-mono text-[#8d9197]">{evt.title}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0e12] border border-[#272a2e] ${
                      evt.status === 'cycling' ? 'text-[#C9A66B]' : 'text-[#aacfb6]'
                    }`}
                  >
                    {evt.tag}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Action Details for Selected Event */}
          <div className="p-4 bg-[#0b0e12] rounded-lg border border-[#272a2e] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#8d9197]">
              <span>Event Details</span>
              <span className="text-[#aacfb6]">Verified Safe</span>
            </div>
            <p className="text-[12px] text-[#c3c7cd]">
              {timelineEvents[selectedTimelineIndex].desc}
            </p>
            <div className="pt-1 flex items-center justify-between border-t border-[#272a2e]/60 text-[11px] font-mono">
              <span className="text-[#8d9197]">PagerDuty Alerts: 0</span>
              <button
                onClick={onNavigateToIncidents}
                className="text-[#b0c9e4] hover:underline"
              >
                Inspect Policy Gates →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
