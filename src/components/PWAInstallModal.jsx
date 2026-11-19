import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, Plus, X, Sparkles, Check, Shield, Apple } from 'lucide-react';

export default function PWAInstallModal({ isOpen, onClose, deferredPrompt, onInstallAccepted }) {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showAndroidManualGuide, setShowAndroidManualGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(iOS);

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

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('syl_install_dismissed', 'true');
    } catch {}
    if (onClose) onClose();
  };

  return (
    <div
      onClick={handleDismiss}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 cursor-pointer animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#12151F] border-t sm:border border-[#262C3D] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative cursor-default animate-in slide-in-from-bottom duration-300"
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Logo and Badges */}
        <div className="flex items-center gap-3.5 mb-5">
          <img
            src="/icon-192.png"
            alt="SYL App Icon"
            className="w-14 h-14 rounded-2xl border-2 border-[#00E676]/30 shadow-lg shadow-[#00E676]/15 object-cover bg-[#0D0F14]"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                Official App
              </span>
              <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                ★ 4.9
              </span>
            </div>
            <h3 className="text-lg font-black font-display text-white mt-0.5">
              Skouted Youth League
            </h3>
            <p className="text-xs text-slate-400">
              Championship Season 2026/2027
            </p>
          </div>
        </div>

        {/* Why Install Highlights */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 mb-5">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <span className="w-5 h-5 rounded-lg bg-[#00E676]/15 text-[#00E676] flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3" />
            </span>
            <span><strong>Instant Push Alerts:</strong> Lock-screen goals, kickoff & subs</span>
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
            <span><strong>Fast & Lightweight:</strong> Uses &lt;3MB memory, no app store needed</span>
          </div>
        </div>

        {/* Dynamic Platform Instructions */}
        {isIOS ? (
          /* 🍏 iOS / iPhone Instructions */
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Apple className="w-4 h-4" />
                <span>Install on your iPhone in 2 steps:</span>
              </div>
              <div className="space-y-2 text-xs text-slate-200">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button at the bottom of Safari (
                    <Share className="w-3.5 h-3.5 inline text-amber-300 mx-0.5" />
                    square with arrow pointing up).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>"Add to Home Screen"</strong> (
                    <Plus className="w-3.5 h-3.5 inline text-amber-300 mx-0.5" />
                    ).
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Tap <strong>"Add"</strong> in the top right. The app will appear on your home screen!
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              Got It, Thanks!
            </button>
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
                  Tap your browser menu (the <strong>3 vertical dots ⋮</strong> in Chrome at the top right) and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </div>
            ) : null}

            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full btn-primary py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/25 hover:shadow-xl hover:shadow-[#00E676]/40 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{installing ? 'Preparing Install...' : 'Install App Now'}</span>
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Continue on Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
