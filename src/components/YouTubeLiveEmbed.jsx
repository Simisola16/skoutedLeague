import React, { useState, useEffect } from 'react';
import { Radio, ExternalLink, Sparkles, Youtube, Maximize2, ChevronDown, ChevronUp, Bell, RefreshCw } from 'lucide-react';
import { SOCIAL_LINKS, YOUTUBE_LIVE_EMBED_URL } from '../constants/socialLinks';
import { SocialIcon } from './SocialIcons';
import { api } from '../services/api';
import socket from '../services/socket';

export default function YouTubeLiveEmbed({ 
  className = "",
  compact = false,
  showTitle = true,
  autoExpand = true
}) {
  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [liveInfo, setLiveInfo] = useState({
    videoId: 'lU5MVdwXWvE',
    title: 'SYL 2026/2027 SEASON WEEK 1  IWALEWA FA  VS  RISING ROOTS FA',
    isLive: true,
    embedUrl: YOUTUBE_LIVE_EMBED_URL
  });
  const [loadingLive, setLoadingLive] = useState(false);

  // Fetch active live stream and listen for realtime updates
  useEffect(() => {
    let isMounted = true;
    api.getLiveStream()
      .then(res => {
        if (isMounted && res.success && res.data?.videoId) {
          setLiveInfo(res.data);
        }
      })
      .catch(() => {});

    const handleLiveUpdated = (updated) => {
      if (updated && updated.videoId) {
        setLiveInfo(updated);
      }
    };

    socket.on('live_stream_updated', handleLiveUpdated);
    return () => {
      isMounted = false;
      socket.off('live_stream_updated', handleLiveUpdated);
    };
  }, []);

  const handleManualRefresh = () => {
    setLoadingLive(true);
    api.getLiveStream(true)
      .then(res => {
        if (res.success && res.data?.videoId) {
          setLiveInfo(res.data);
        }
      })
      .finally(() => setLoadingLive(false));
  };

  const watchUrl = liveInfo.videoId 
    ? `https://www.youtube.com/watch?v=${liveInfo.videoId}`
    : SOCIAL_LINKS.youtube.url;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141724] via-[#0E111A] to-[#0A0D14] border border-[#22293A] shadow-2xl ${className}`}>
      
      {/* Ambient Red Glow for Live Atmosphere */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#00E676]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      {showTitle && (
        <div className="relative z-10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex items-center justify-center shrink-0">
              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75"></span>
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>🔴 LIVE STREAM BROADCAST</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-[10px] font-mono font-bold text-red-400">
                  OFFICIAL FEED
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-display text-white tracking-tight truncate mt-0.5">
                {liveInfo.title || 'Skouted Youth League Matchday Broadcast'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleManualRefresh}
              disabled={loadingLive}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Refresh live stream detection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingLive ? 'animate-spin text-red-400' : ''}`} />
            </button>

            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Open stream directly on YouTube"
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
              src={liveInfo.embedUrl || `https://www.youtube.com/embed/${liveInfo.videoId || 'lU5MVdwXWvE'}?autoplay=1&mute=1`} 
              title={liveInfo.title || "Skouted Youth League Live Stream"}
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
              className="w-full aspect-video rounded-xl shadow-lg border border-slate-800"
            ></iframe>
          </div>

          {/* Stream Footer with Channel Details and Social Quick Links */}
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-400 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-white">Live Stream Active:</span>
              <span className="text-slate-300 font-mono truncate max-w-xs">{liveInfo.title}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
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
