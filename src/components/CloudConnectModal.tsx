import React, { useState } from 'react';
import { ClusterRegion, Microservice } from '../types/fleet';
import { COMPANY_PRESETS, createCustomCompanyPreset } from '../data/companyPresets';

interface CloudConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectCompanyPreset: (preset: {
    cluster: ClusterRegion;
    services: Microservice[];
    companyName: string;
  }) => void;
}

export const CloudConnectModal: React.FC<CloudConnectModalProps> = ({
  isOpen,
  onClose,
  onConnectCompanyPreset,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('acme-bank');
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [customProvider, setCustomProvider] = useState<'aws' | 'gcp' | 'azure' | 'k8s'>('aws');
  const [customClusterName, setCustomClusterName] = useState('');
  const [customRegion, setCustomRegion] = useState('us-east-1');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  if (!isOpen) return null;

  const handleConnectPreset = (presetId: string) => {
    setIsVerifying(true);
    const preset = COMPANY_PRESETS.find((p) => p.id === presetId) || COMPANY_PRESETS[1];
    setVerifyStep(`Connecting to ${preset.companyName} (${preset.cloudName})...`);

    setTimeout(() => {
      setVerifyStep(`Handshaking with ${preset.provider.toUpperCase()} API endpoint...`);
      setTimeout(() => {
        setVerifyStep(`Loading eBPF CO-RE telemetry for 14 ${preset.companyName} microservices...`);
        setTimeout(() => {
          setIsVerifying(false);
          onConnectCompanyPreset({
            cluster: preset.cluster,
            services: preset.services,
            companyName: preset.companyName,
          });
          onClose();
        }, 600);
      }, 600);
    }, 600);
  };

  const handleConnectCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCompanyName.trim()) return;

    setIsVerifying(true);
    setVerifyStep(`Creating company sandbox for ${customCompanyName}...`);

    setTimeout(() => {
      setVerifyStep(`Synthesizing 14 containerized microservices for ${customCompanyName}...`);
      setTimeout(() => {
        const custom = createCustomCompanyPreset(
          customCompanyName,
          customProvider,
          customClusterName,
          customRegion
        );
        setIsVerifying(false);
        onConnectCompanyPreset({
          cluster: custom.cluster,
          services: custom.services,
          companyName: custom.companyName,
        });
        onClose();
      }, 600);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#191c20] border-2 border-[#7a93ac] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-5 bg-[#1d2024] border-b border-[#272a2e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#aacfb6]/20 border border-[#aacfb6] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#aacfb6] text-[22px]">
                cloud_sync
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-semibold text-[#e1e2e8]">
                  Connect Company Cloud (Sandbox & Prototype)
                </h2>
                <span className="font-mono text-[10px] bg-[#aacfb6]/20 text-[#aacfb6] px-2 py-0.5 rounded font-semibold">
                  LIVE CLOUD SIMULATION
                </span>
              </div>
              <p className="text-[12px] text-[#8d9197] mt-0.5">
                Select your industry cloud below, or type your company name. The entire dashboard will update to match!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8d9197] hover:text-[#e1e2e8] p-1.5 rounded-lg hover:bg-[#272a2e]"
          >
            ✕
          </button>
        </div>

        {/* Tab switch: Presets vs Custom */}
        <div className="px-5 pt-4 bg-[#191c20] flex items-center gap-2 border-b border-[#272a2e]">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 px-3 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'presets'
                ? 'border-[#aacfb6] text-[#aacfb6]'
                : 'border-transparent text-[#8d9197] hover:text-[#e1e2e8]'
            }`}
          >
            🏢 Company Cloud Presets (Recommended)
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 text-[13px] font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'custom'
                ? 'border-[#aacfb6] text-[#aacfb6]'
                : 'border-transparent text-[#8d9197] hover:text-[#e1e2e8]'
            }`}
          >
            ✍️ Type Your Company Name
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <span className="text-[11px] uppercase tracking-wider text-[#8d9197] font-semibold block">
                Choose a Company Sandbox:
              </span>

              {COMPANY_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPresetId(p.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#1d2024] border-[#aacfb6] ring-1 ring-[#aacfb6]/40 shadow-sm'
                        : 'bg-[#0b0e12] border-[#272a2e] hover:border-[#43474c]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-[#e1e2e8]">
                          {p.companyName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#191c20] text-[#b0c9e4] border border-[#272a2e]">
                          {p.provider.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8d9197]">{p.description}</p>
                      <div className="text-[11px] font-mono text-[#aacfb6]">
                        {p.cloudName} · {p.regionName}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isVerifying}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnectPreset(p.id);
                      }}
                      className="px-4 py-2 rounded-lg bg-[#aacfb6] hover:bg-[#c5ecd1] text-[#153725] font-bold text-[12px] transition-all shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isVerifying && selectedPresetId === p.id ? 'Connecting...' : 'Connect This Cloud →'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleConnectCustom} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#c3c7cd] uppercase mb-1">
                  Your Company Name
                </label>
                <input
                  type="text"
                  required
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                  placeholder="e.g. JPMorgan Chase, Stripe, Uber, Airbnb, Acme Corp..."
                  className="w-full bg-[#0b0e12] p-3 rounded-xl border border-[#272a2e] text-[#e1e2e8] text-[14px] focus:outline-none focus:border-[#aacfb6]"
                />
                <span className="text-[11px] text-[#8d9197] mt-1 block">
                  All 14 microservices and server nodes will instantly re-brand to your company!
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8d9197] uppercase mb-1">
                    Cloud Provider
                  </label>
                  <select
                    value={customProvider}
                    onChange={(e) => setCustomProvider(e.target.value as any)}
                    className="w-full bg-[#0b0e12] p-2.5 rounded-lg border border-[#272a2e] text-[#e1e2e8] text-[12px]"
                  >
                    <option value="aws">Amazon Web Services (AWS EKS)</option>
                    <option value="gcp">Google Cloud Platform (GKE)</option>
                    <option value="azure">Microsoft Azure (AKS)</option>
                    <option value="k8s">On-Premises Kubernetes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#8d9197] uppercase mb-1">
                    Region
                  </label>
                  <input
                    type="text"
                    value={customRegion}
                    onChange={(e) => setCustomRegion(e.target.value)}
                    placeholder="e.g. us-east-1, eu-west-1..."
                    className="w-full bg-[#0b0e12] p-2.5 rounded-lg border border-[#272a2e] text-[#e1e2e8] text-[12px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying || !customCompanyName.trim()}
                className="w-full py-3 rounded-xl bg-[#aacfb6] hover:bg-[#c5ecd1] text-[#153725] font-bold text-[13px] transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isVerifying ? 'Generating Company Cloud Sandbox...' : `🚀 Connect ${customCompanyName || 'Company'} Cloud`}
              </button>
            </form>
          )}

          {/* Verification Status */}
          {isVerifying && (
            <div className="p-3 bg-[#0b0e12] rounded-lg border border-[#aacfb6]/40 flex items-center gap-2 text-[12px] font-mono text-[#aacfb6] animate-pulse">
              <span className="material-symbols-outlined text-[18px] animate-spin">
                progress_activity
              </span>
              <span>{verifyStep}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1d2024] border-t border-[#272a2e] flex items-center justify-between text-[12px] text-[#8d9197]">
          <span>Sandbox mode is safe: zero impact on real customer production servers.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#272a2e] text-[#c3c7cd] hover:text-[#e1e2e8]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
