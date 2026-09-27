import React, { useState } from 'react';
import { Radio, ExternalLink, Sparkles, Youtube, Maximize2, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { SOCIAL_LINKS, YOUTUBE_LIVE_EMBED_URL } from '../constants/socialLinks';
import { SocialIcon } from './SocialIcons';

export default function YouTubeLiveEmbed({ 
  className = "",
  compact = false,
  showTitle = true,
  autoExpand = true
}) {
  const [isExpanded, setIsExpanded] = useState(autoExpand);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141724] via-[#0E111A] to-[#0A0D14] border border-[#22293A] shadow-2xl ${className}`}>
      
      {/* Ambient Red Glow for Live Atmosphere */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#00E676]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      {showTitle && (
        <div className="relative z-10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75"></span>
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-red-500" />
                  <span>Automated YouTube Live Stream</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-[10px] font-mono font-bold text-red-400">
                  OFFICIAL FEED
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-display text-white tracking-tight">
                Skouted Youth League Matchday Broadcast
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={SOCIAL_LINKS.youtube.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Open stream on YouTube channel"
            >
              <Youtube className="w-3.5 h-3.5 text-red-400" />
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              aria-label={isExpanded ? "Collapse broadcast" : "Expand broadcast"}
              title={isExpanded ? "Collapse broadcast" : "Expand broadcast"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Video Embed Player */}
      {isExpanded && (
        <div className="relative z-10 p-3 sm:p-5">
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl border border-slate-800 group">
            <iframe 
              src={YOUTUBE_LIVE_EMBED_URL} 
              title="Skouted Youth League Live Stream"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              className="w-full aspect-video rounded-xl shadow-lg border border-slate-800"
            ></iframe>
          </div>

          {/* Stream Footer with Channel Details and Social Quick Links */}
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-[#00E676]" />
              <span>Live Pitch Feed & Commentary</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-300">Channel ID: UCy_dA9AmAWwGcDhh1PQtARA</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-mono text-[11px]">Follow live:</span>
              <a
                href={SOCIAL_LINKS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#E1306C] transition-colors flex items-center gap-1 font-semibold"
                title="Follow on Instagram"
              >
                <SocialIcon platform="instagram" className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
              <a
                href={SOCIAL_LINKS.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#1877F2] transition-colors flex items-center gap-1 font-semibold"
                title="Join Facebook Community"
              >
                <SocialIcon platform="facebook" className="w-3.5 h-3.5" />
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
