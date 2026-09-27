import React from 'react';
import { Radio, ArrowLeft, ExternalLink, Sparkles, Newspaper, Headphones } from 'lucide-react';
import YouTubeLiveEmbed from './YouTubeLiveEmbed';
import SocialFeedWidget from './SocialFeedWidget';
import { SOCIAL_LINKS_ARRAY } from '../constants/socialLinks';
import { SocialIcon } from './SocialIcons';

export default function MediaPage({ onBackToHome, onNavigateNews, onNavigatePodcasts }) {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-200">
      
      {/* 1. Header Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121622] via-[#0D1017] to-[#0A0D13] border border-[#1E2536] p-6 sm:p-10">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Matches</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold">
            <Radio className="w-3.5 h-3.5 text-[#00E676]" />
            <span>OFFICIAL BROADCAST & SOCIAL AGGREGATION HUB</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            League Media Center
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Watch live match broadcasts, full-length matchday videos, Instagram reels, and official Facebook updates from across the Skouted Youth League in one unified social stream.
          </p>

          {/* Official Channel Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {SOCIAL_LINKS_ARRAY.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all group"
              >
                <SocialIcon platform={social.id} className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>{social.name}</span>
                <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Official YouTube Live Broadcast Center */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
          <Sparkles className="w-4 h-4 text-[#00E676]" />
          <span>Channel Live Stream & Recent Broadcasts</span>
        </div>
        <YouTubeLiveEmbed />
      </section>

      {/* 3. Automated Social Feed Reel & Grid */}
      <section className="pt-4 border-t border-[#1E2330]">
        <SocialFeedWidget
          title="Official League Social Reel"
          subtitle="Latest official matchday uploads & tournament video highlights"
          badge="OFFICIAL MATCH VIDEO REEL"
          platform="youtube"
          showTabs={false}
          limit={4}
        />
      </section>

      {/* 4. Quick Links to News & Podcasts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#1E2330]">
        <div 
          onClick={onNavigateNews}
          className="p-5 rounded-2xl bg-[#111520] border border-[#1E2536] hover:border-[#00E676]/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-[#00E676] transition-colors">
                  League Editorial & News
                </h4>
                <p className="text-xs text-slate-400">Read in-depth match recaps & scouting reports</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#00E676] group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </div>

        <div 
          onClick={onNavigatePodcasts}
          className="p-5 rounded-2xl bg-[#111520] border border-[#1E2536] hover:border-[#00E676]/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">
                  SYL Official Podcasts
                </h4>
                <p className="text-xs text-slate-400">Listen to coach discussions & player interviews</p>
              </div>
            </div>
            <span className="text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </div>
      </section>

    </div>
  );
}
