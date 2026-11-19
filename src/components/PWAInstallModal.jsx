import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  Share,
  Plus,
  X,
  Sparkles,
  Check,
  Shield,
  Apple,
  MoreHorizontal,
  Copy,
  ArrowDown,
  Compass
} from 'lucide-react';

export default function PWAInstallModal({ isOpen, onClose, deferredPrompt, onInstallAccepted }) {
  const [isIOS, setIsIOS] = useState(false);
  const [iosBrowser, setIosBrowser] = useState('safari'); // 'safari' | 'chrome' | 'inapp'
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAndroidManualGuide, setShowAndroidManualGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || '';
      const iOS = /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(iOS);

      if (iOS) {
        const isInApp = /FBAN|FBAV|Instagram|WhatsApp|Snapchat|Line|MicroMessenger|Twitter|TikTok|Bytedance/i.test(ua);
        const isChrome = /CriOS/i.test(ua);
        if (isInApp) {
          setIosBrowser('inapp');
        } else if (isChrome) {
          setIosBrowser('chrome');
        } else {
          setIosBrowser('safari');
        }
      }

      const standalone = window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);
    }
  }, []);

  // Never render if already installed and running standalone
  if (!isOpen || isStandalone) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          try {
            localStorage.setItem('syl_app_installed', 'true');
          } catch {}
          if (onInstallAccepted) onInstallAccepted();
          onClose();
        }
      } catch (err) {
        console.warn('[PWA Install Error]:', err);
      } finally {
        setInstalling(false);
      }
    } else {
      // If browser hasn't fired beforeinstallprompt yet
      setShowAndroidManualGuide(true);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('syl_install_dismissed', 'true');
    } catch {}
    if (onClose) onClose();
  };

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-[#12151F] border-t sm:border border-[#262C3D] rounded-t-3xl sm:rounded-3xl px-5 pt-3 pb-6 sm:p-6 safe-bottom shadow-2xl relative cursor-default animate-in slide-in-from-bottom duration-300"
      >
        {/* Mobile Bottom-Sheet Drag Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-3.5 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close"
          aria-label="Close install prompt"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Logo and Badges */}
        <div className="flex items-center gap-3.5 mb-4 pr-8">
          <img
            src="/icon-192.png"
            alt="SYL App Icon"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-[#00E676]/30 shadow-lg shadow-[#00E676]/15 object-cover bg-[#0D0F14] shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                Official App
              </span>
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                ★ 4.9
              </span>
            </div>
            <h3 className="text-lg font-black font-display text-white mt-0.5 leading-tight">
              Skouted Youth League
            </h3>
            <p className="text-xs text-slate-400">
              Championship Season 2026/2027
            </p>
          </div>
        </div>

        {/* Why Install Highlights */}
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 mb-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-lg bg-[#00E676]/15 text-[#00E676] flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3" />
            </span>
            <span><strong>Instant Push Alerts:</strong> Lock-screen goals, kickoff &amp; subs</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-lg bg-[#00E676]/15 text-[#00E676] flex items-center justify-center shrink-0">
              <Smartphone className="w-3 h-3" />
            </span>
            <span><strong>Home Screen Icon:</strong> 1-Tap access directly to live match scores</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-lg bg-[#00E676]/15 text-[#00E676] flex items-center justify-center shrink-0">
              <Shield className="w-3 h-3" />
            </span>
            <span><strong>Fast &amp; Lightweight:</strong> Uses &lt;3MB memory, no App Store needed</span>
          </div>
        </div>

        {/* Dynamic Platform Instructions */}
        {isIOS ? (
          /* 🍏 iOS / iPhone Instructions */
          <div className="space-y-3">
            {iosBrowser === 'inapp' ? (
              /* Opened inside WhatsApp / Instagram / Facebook in-app browser */
              <>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Compass className="w-4 h-4 shrink-0" />
                    <span>Open in Safari to Install on iPhone</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    In-app browsers (like WhatsApp or Instagram) don&apos;t allow installing apps. Tap the <strong>Safari / Open in Browser</strong> icon, or copy the link below and open it in <strong>Safari</strong>.
                  </p>
                </div>

                <button
                  onClick={handleCopyUrl}
                  className="w-full btn-primary min-h-[44px] py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/25 cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Link Copied — Paste in Safari!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link to Open in Safari</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDismiss}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Continue on Website
                </button>
              </>
            ) : (
              /* Safari (iOS 26 & classic iOS) or Chrome on iPhone */
              <>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Apple className="w-4 h-4 shrink-0" />
                      <span>Install on your iPhone in 3 quick steps:</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-200/80 leading-snug">
                    Apple iOS installs web apps through your browser menu (takes 5 seconds):
                  </p>

                  {iosBrowser === 'chrome' ? (
                    <div className="space-y-2 text-xs text-slate-200 pt-0.5">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <span className="leading-relaxed">
                          Tap the <strong>Share</strong> icon (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 text-amber-300 align-middle mx-0.5">
                            <Share className="w-3 h-3" />
                          </span>
                          ) in Chrome&apos;s <strong>top-right</strong> address bar.
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <span className="leading-relaxed">
                          Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> (
                          <span className="inline-flex items-center px-1 py-0.5 rounded bg-white/10 text-amber-300 align-middle mx-0.5">
                            <Plus className="w-3 h-3" />
                          </span>
                          ).
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <span className="leading-relaxed">
                          Tap <strong>&quot;Add&quot;</strong> in the top-right. The SYL app will appear on your Home Screen!
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs text-slate-200 pt-0.5">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <span className="leading-relaxed">
                          Tap the{' '}
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-white/15 text-white font-bold align-middle mx-0.5">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </span>{' '}
                          button at the <strong>bottom-right</strong> of Safari, then tap <strong>Share</strong> (
                          <Share className="w-3.5 h-3.5 inline text-amber-300 mx-0.5 -mt-0.5" />
                          ) <span className="text-slate-400">(or tap Share directly at the bottom on older iOS)</span>.
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <span className="leading-relaxed">
                          Scroll down (or tap <strong>More</strong>) and tap <strong>&quot;Add to Home Screen&quot;</strong> (
                          <span className="inline-flex items-center px-1 py-0.5 rounded bg-white/10 text-amber-300 align-middle mx-0.5">
                            <Plus className="w-3 h-3" />
                          </span>
                          ).
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <span className="leading-relaxed">
                          Keep <strong>&quot;Open as Web App&quot;</strong> on and tap <strong>&quot;Add&quot;</strong> in the top-right. Open SYL from your Home Screen!
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {iosBrowser === 'safari' && (
                  <div className="flex items-center justify-end gap-1.5 pr-1 text-[11px] font-bold text-[#00E676]">
                    <span>Tap ••• below to start</span>
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                  </div>
                )}

                <button
                  onClick={handleDismiss}
                  className="w-full min-h-[44px] py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Continue on Website
                </button>
              </>
            )}
          </div>
        ) : (
          /* 🤖 Android / Chrome / Windows / Mac */
          <div className="space-y-3">
            {showAndroidManualGuide ? (
              <div className="p-3.5 rounded-xl bg-[#1C2030] border border-[#2B3247] space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#00E676]" />
                  <span>Manual Installation:</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tap your browser menu (the <strong>3 vertical dots ⋮</strong> in Chrome at the top right) and select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                </p>
              </div>
            ) : null}

            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full btn-primary min-h-[44px] py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/25 hover:shadow-xl hover:shadow-[#00E676]/40 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{installing ? 'Preparing Install...' : 'Install App Now'}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Continue on Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
