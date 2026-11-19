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
  const [showInstallGuide, setShowInstallGuide] = useState(false);

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

  // Reset inline guide whenever the modal reopens so iPhone & Android always open with the clean Install App button
  useEffect(() => {
    if (isOpen) {
      setShowInstallGuide(false);
      setCopiedLink(false);
    }
  }, [isOpen]);

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
      // On iPhone (Apple Safari blocks native 1-tap prompts) or browsers without beforeinstallprompt:
      // Smoothly reveal the quick inline install steps after user taps "Install App Now"
      setShowInstallGuide(true);
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
        <div className="flex items-center gap-3.5 mb-5 pr-8">
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
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 mb-5">
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

        {/* Unified Android + iPhone Install CTA (Sleek Identical Design on Both Platforms) */}
        <div className="space-y-3">
          {showInstallGuide && (
            isIOS ? (
              iosBrowser === 'inapp' ? (
                <div className="p-3.5 rounded-xl bg-[#0D111A] border border-[#00E676]/30 space-y-2.5 text-xs text-slate-200 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 font-bold text-[#00E676]">
                    <Compass className="w-4 h-4 shrink-0" />
                    <span>Open in Safari to finish installing</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    In-app browsers (WhatsApp / Instagram) block app installs. Copy the link below and open it in <strong>Safari</strong>, then tap <strong>Install App Now</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-[#0D111A] border border-[#00E676]/30 space-y-2.5 text-xs text-slate-200 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-[#00E676]">
                      <Download className="w-3.5 h-3.5 shrink-0" />
                      <span>Complete Install on iPhone:</span>
                    </div>
                  </div>
                  {iosBrowser === 'chrome' ? (
                    <div className="space-y-1.5 text-[11px] text-slate-200">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>Tap <strong>Share</strong> (<Share className="w-3 h-3 inline text-[#00E676] mx-0.5 -mt-0.5" />) in Chrome&apos;s <strong>top-right</strong> bar</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>Tap <strong>&quot;Add to Home Screen&quot;</strong> (<Plus className="w-3 h-3 inline text-[#00E676] mx-0.5 -mt-0.5" />)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>Tap <strong>&quot;Add&quot;</strong> in the top-right corner</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-[11px] text-slate-200">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>
                          Tap{' '}
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/15 text-white align-middle mx-0.5">
                            <MoreHorizontal className="w-3 h-3" />
                          </span>{' '}
                          at bottom-right → <strong>Share</strong> (<Share className="w-3 h-3 inline text-[#00E676] mx-0.5 -mt-0.5" />) <span className="text-slate-400">(or Share at bottom)</span>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>Tap <strong>More</strong> / scroll down → <strong>&quot;Add to Home Screen&quot;</strong> (<Plus className="w-3 h-3 inline text-[#00E676] mx-0.5 -mt-0.5" />)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>Keep <strong>&quot;Open as Web App&quot;</strong> on → tap <strong>&quot;Add&quot;</strong></span>
                      </div>
                    </div>
                  )}
                  {iosBrowser === 'safari' && (
                    <div className="flex items-center justify-end gap-1 pt-1 text-[11px] font-bold text-[#00E676]">
                      <span>Tap ••• below to finish</span>
                      <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="p-3.5 rounded-xl bg-[#1C2030] border border-[#2B3247] space-y-2 text-xs text-slate-300 animate-in fade-in duration-200">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#00E676]" />
                  <span>Manual Installation:</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tap your browser menu (the <strong>3 vertical dots ⋮</strong> in Chrome at the top right) and select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                </p>
              </div>
            )
          )}

          {showInstallGuide && isIOS && iosBrowser === 'inapp' ? (
            <button
              onClick={handleCopyUrl}
              className="w-full btn-primary min-h-[46px] py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/25 hover:shadow-xl hover:shadow-[#00E676]/40 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Link Copied — Open in Safari!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link for Safari</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={showInstallGuide && isIOS ? handleDismiss : handleInstallClick}
              disabled={installing}
              className="w-full btn-primary min-h-[46px] py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/25 hover:shadow-xl hover:shadow-[#00E676]/40 transition-all cursor-pointer"
            >
              {showInstallGuide && isIOS ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Got It, Ready to Add</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{installing ? 'Preparing Install...' : 'Install App Now'}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Continue on Website
          </button>
        </div>
      </div>
    </div>
  );
}
