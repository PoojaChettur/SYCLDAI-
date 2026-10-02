import React from 'react';

interface InteractiveDemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onTriggerTestAnomaly: () => void;
  onOpenCloudConnect: () => void;
}

export const InteractiveDemoTour: React.FC<InteractiveDemoTourProps> = ({
  isOpen,
  onClose,
  step,
  onNextStep,
  onPrevStep,
  onTriggerTestAnomaly,
  onOpenCloudConnect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-[#191c20] border-2 border-[#7a93ac] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Tour Header with friendly badge */}
        <div className="p-5 bg-[#1d2024] border-b border-[#272a2e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#aacfb6] text-[#153725] font-bold text-[14px] flex items-center justify-center">
              {step}/5
            </span>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#aacfb6] font-semibold block">
                Interactive Guided Tour
              </span>
              <h3 className="text-[16px] font-semibold text-[#e1e2e8]">
                {step === 1 && 'Welcome! What is ScyldAI Sentinel?'}
                {step === 2 && 'Your Microservice Fleet (The 14 Apps)'}
                {step === 3 && 'Live Test: Let’s Break Something Safely!'}
                {step === 4 && 'You Have Control: Armed vs Dry-Run'}
                {step === 5 && 'Connecting Your Company’s Cloud'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#8d9197] hover:text-[#e1e2e8] p-1.5 rounded-lg hover:bg-[#272a2e]"
          >
            ✕
          </button>
        </div>

        {/* Tour Content */}
        <div className="p-6 space-y-4 text-[13px] leading-relaxed text-[#c3c7cd]">
          {step === 1 && (
            <div className="space-y-3">
              <div className="p-3.5 bg-[#0b0e12] rounded-xl border border-[#272a2e] flex items-start gap-3">
                <span className="text-[28px] shrink-0">🏥</span>
                <div>
                  <h4 className="font-semibold text-[14px] text-[#e1e2e8]">
                    Think of ScyldAI as an automated doctor for your servers.
                  </h4>
                  <p className="text-[12px] text-[#8d9197] mt-1">
                    Usually when a server runs out of memory or freezes, a human engineer gets woken up at 3 AM to restart it, causing downtime and lost revenue.
                  </p>
                </div>
              </div>

              <p>
                ScyldAI sits directly inside the server's operating system (using a technology called <strong>eBPF</strong>). It monitors apps 24/7 without needing you to rewrite any code.
              </p>

              <div className="grid grid-cols-2 gap-2 text-[12px]">
                <div className="p-2.5 bg-[#1d2024] rounded-lg border border-[#272a2e]">
                  <strong className="text-[#aacfb6] block">⚡ 2.8 Seconds MTTR</strong>
                  <span className="text-[#8d9197] text-[11px]">Fixes memory spikes in under 3 seconds</span>
                </div>
                <div className="p-2.5 bg-[#1d2024] rounded-lg border border-[#272a2e]">
                  <strong className="text-[#b0c9e4] block">🛡️ 0 Code Changes</strong>
                  <span className="text-[#8d9197] text-[11px]">Runs underneath your apps safely</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p>
                In the main dashboard behind this popup, you’ll see <strong>14 service cards</strong> representing typical microservices in a company (like <code className="text-[#b0c9e4]">payment-service</code>, <code className="text-[#b0c9e4]">auth-identity-service</code>, and <code className="text-[#b0c9e4]">db-connection-pool</code>).
              </p>

              <div className="p-3.5 bg-[#0b0e12] rounded-xl border border-[#272a2e] space-y-2">
                <div className="font-semibold text-[13px] text-[#e1e2e8]">Each card gives you 3 simple numbers:</div>
                <ul className="space-y-1.5 text-[12px] text-[#8d9197]">
                  <li>• <strong className="text-[#aacfb6]">Health (e.g. 99.8%)</strong>: Overall server wellness score.</li>
                  <li>• <strong className="text-[#b0c9e4]">CFS Quota (e.g. 16%)</strong>: How much CPU muscle it’s using. If this hits 85%, traditional servers freeze.</li>
                  <li>• <strong className="text-[#e1e2e8]">Memory (e.g. 140/512M)</strong>: Current RAM usage.</li>
                </ul>
              </div>

              <p className="text-[12px] text-[#8d9197]">
                👉 When you click any card, the panel on the right side instantly shows deep live diagnostics for that app!
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="p-3.5 bg-[#d4a373]/15 rounded-xl border border-[#d4a373]/30 text-[#d4a373]">
                <strong className="block text-[14px]">Let’s see the AI in action right now:</strong>
                <p className="text-[12px] text-[#e1e2e8] mt-1">
                  Click the button below to inject a simulated memory and CPU surge into <span className="font-mono text-[#b0c9e4]">payment-service</span>.
                </p>
              </div>

              <div className="text-center py-2">
                <button
                  type="button"
                  onClick={() => {
                    onTriggerTestAnomaly();
                    onNextStep();
                  }}
                  className="px-5 py-3 rounded-xl bg-[#d4a373] hover:bg-[#C9A66B] text-[#191c20] font-bold text-[14px] transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                  <span>⚡ Click to Inject Spike & Watch Auto-Heal</span>
                </button>
              </div>

              <p className="text-[11px] text-[#8d9197] text-center">
                (Watch the top right toasts and payment-service card automatically recover in ~3 seconds!)
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p>
                In the top right header, you’ll notice a 3-way switch: <strong className="text-[#b0c9e4]">Armed</strong>, <strong className="text-[#C9A66B]">Gated</strong>, and <strong className="text-[#d4a373]">Dry-run</strong>.
              </p>

              <div className="space-y-2 text-[12px]">
                <div className="p-2.5 bg-[#0b0e12] rounded-lg border border-[#272a2e]">
                  <strong className="text-[#aacfb6]">1. ARMED (Autonomous Pilot):</strong>
                  <p className="text-[#8d9197] mt-0.5">
                    ScyldAI takes action automatically. If an app begins to crash, ScyldAI clamps CPU bursts and frees memory in milliseconds.
                  </p>
                </div>

                <div className="p-2.5 bg-[#0b0e12] rounded-lg border border-[#C9A66B]/50">
                  <strong className="text-[#C9A66B]">2. GATED (Human Approval Required):</strong>
                  <p className="text-[#8d9197] mt-0.5">
                    ScyldAI detects the issue, prepares a safe fix, and pauses for your approval. You can give human approval in 3 places:
                  </p>
                  <ul className="text-[11px] text-[#e1e2e8] mt-1 space-y-0.5 font-mono">
                    <li>• Click <strong>"Human Approval"</strong> in the top header</li>
                    <li>• Visit the <strong>"Incidents & Approval Gates"</strong> tab</li>
                    <li>• Tell the <strong>Sentinel AI Chatbot</strong>: <em>"Approve"</em></li>
                  </ul>
                </div>

                <div className="p-2.5 bg-[#0b0e12] rounded-lg border border-[#272a2e]">
                  <strong className="text-[#d4a373]">3. DRY-RUN (Observation Only):</strong>
                  <p className="text-[#8d9197] mt-0.5">
                    ScyldAI monitors everything and writes logs, but never changes any server settings.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3">
              <div className="p-4 bg-[#aacfb6]/15 rounded-xl border border-[#aacfb6]/40 text-[#aacfb6]">
                <strong className="text-[14px] block">You’re ready to test with a real or prototype cloud!</strong>
                <p className="text-[12px] text-[#e1e2e8] mt-1">
                  You don’t have to configure complex files. Click below to launch the <strong>Cloud Connect Wizard</strong> for AWS, Google Cloud, Azure, or an instant sandbox.
                </p>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCloudConnect();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#aacfb6] hover:bg-[#c5ecd1] text-[#153725] font-bold text-[13px] shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
                  <span>Open Cloud Connect Wizard</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-[#1d2024] border-t border-[#272a2e] flex items-center justify-between">
          <button
            type="button"
            onClick={step === 1 ? onClose : onPrevStep}
            className="px-3.5 py-1.5 rounded-lg bg-[#272a2e] text-[#c3c7cd] hover:text-[#e1e2e8] text-[12px] font-medium transition-colors"
          >
            {step === 1 ? 'Skip Tour' : 'Back'}
          </button>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === i ? 'w-5 bg-[#aacfb6]' : 'bg-[#272a2e]'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={step === 5 ? onClose : onNextStep}
            className="px-4 py-1.5 rounded-lg bg-[#7a93ac] text-[#112c41] hover:bg-[#b0c9e4] text-[12px] font-semibold transition-colors flex items-center gap-1"
          >
            <span>{step === 5 ? 'Finish & Explore' : 'Next Step →'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
