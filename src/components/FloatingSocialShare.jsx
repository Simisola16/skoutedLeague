import React, { useState } from 'react';
import { Share2, X, Youtube, ExternalLink, Check, Sparkles } from 'lucide-react';
import { SOCIAL_LINKS_ARRAY, SOCIAL_LINKS } from '../constants/socialLinks';
import { SocialIcon } from './SocialIcons';

export default function FloatingSocialShare({ onOpenLiveStream }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col items-end">
      
      {/* Expanded Menu Panel */}
      {isOpen && (
        <div className="mb-3 w-72 rounded-2xl bg-[#0F131D]/95 border border-[#232A3B] p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Official SYL Channels</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Social Channels List */}
          <div className="space-y-1.5">
            {SOCIAL_LINKS_ARRAY.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 ${social.borderHover} ${social.textHover} transition-all group`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${social.accentColor}20`, color: social.accentColor }}
                  >
                    <SocialIcon platform={social.id} className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white group-hover:text-white leading-tight">
                      {social.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {social.handle}
                    </div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              </a>
            ))}
          </div>

          {/* Share Platform Link CTA */}
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={handleCopyLink}
              className="w-full py-2 px-3 rounded-xl bg-[#00E676]/15 hover:bg-[#00E676]/25 border border-[#00E676]/30 text-[#00E676] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Skouted Youth League</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-red-600 via-[#181D2C] to-[#0D1017] hover:from-red-500 hover:to-[#181D2C] border border-white/15 text-white font-bold text-xs shadow-xl shadow-black/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Social media and live links"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <Youtube className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline font-mono text-[11px] tracking-wide">LIVE & SOCIAL</span>
      </button>

    </div>
  );
}
