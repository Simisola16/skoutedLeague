import React from 'react';
import { Headphones, Play, ArrowRight, Radio } from 'lucide-react';

export default function PodcastWidget({ episodes = [], onNavigatePodcasts }) {
  const latestEpisode = episodes[0];
  if (!latestEpisode) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121622] via-[#0F141F] to-[#0B0E16] border border-[#1E2536] p-6 sm:p-8 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Thumbnail & Episode Details */}
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#181E2E] shrink-0 border border-white/10 shadow-lg group cursor-pointer"
               onClick={onNavigatePodcasts}>
            <img
              src={latestEpisode.coverImageUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400'}
              alt={latestEpisode.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-[#00E676] text-black flex items-center justify-center shadow-md shadow-[#00E676]/40 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-black ml-0.5" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                <Radio className="w-3 h-3" />
                LATEST EPISODE 0{latestEpisode.episodeNumber}
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                {latestEpisode.duration || '35 mins'}
              </span>
            </div>

            <h4
              onClick={onNavigatePodcasts}
              className="text-base sm:text-lg font-bold text-white hover:text-[#00E676] transition-colors cursor-pointer line-clamp-1"
            >
              {latestEpisode.title}
            </h4>

            <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">
              {latestEpisode.description}
            </p>
          </div>
        </div>

        {/* Right: CTA button */}
        <div className="shrink-0 w-full md:w-auto flex items-center justify-end">
          <button
            onClick={onNavigatePodcasts}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-[#00E676]/15 border border-[#1E2536] hover:border-[#00E676]/40 text-slate-200 hover:text-[#00E676] text-xs font-bold transition-all cursor-pointer"
          >
            <Headphones className="w-4 h-4" />
            <span>Listen on Audio Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
}
