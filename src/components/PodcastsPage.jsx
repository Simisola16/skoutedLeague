import React, { useState, useRef, useEffect } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Clock, 
  Calendar, 
  ArrowLeft,
  Radio,
  Sparkles,
  Share2
} from 'lucide-react';

export default function PodcastsPage({ episodes = [], onBackToHome }) {
  const [activeEpisode, setActiveEpisode] = useState(episodes[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (episodes.length > 0 && !activeEpisode) {
      setActiveEpisode(episodes[0]);
    }
  }, [episodes]);

  useEffect(() => {
    if (audioRef.current && activeEpisode?.audioUrl) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [activeEpisode]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!duration && audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 pb-12">
      
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
            <Radio className="w-3.5 h-3.5" />
            <span>SYL AUDIO NETWORK</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
            Podcasts & Scouting Media Hub
          </h1>

          <p className="text-sm sm:text-base text-slate-300">
            Listen to tactical match analysis, behind-the-scenes interviews with club managers, talent identification discussions, and grassroots development stories.
          </p>
        </div>
      </section>

      {/* 2. Featured Interactive Player Card */}
      {activeEpisode && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#141926] via-[#10141F] to-[#0C0F17] border-2 border-[#00E676]/30 p-6 sm:p-8 shadow-2xl shadow-[#00E676]/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Episode Cover Art */}
            <div className="lg:col-span-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#181E2E] border border-white/10 shadow-lg">
                <img
                  src={activeEpisode.coverImageUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800'}
                  alt={activeEpisode.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#00E676] text-black">
                    EPISODE {activeEpisode.episodeNumber}
                  </span>
                  <span className="text-[11px] text-slate-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                    {activeEpisode.duration || '30 mins'}
                  </span>
                </div>
              </div>
            </div>

            {/* Player Controls & Info */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#00E676] tracking-wide">
                  NOW PLAYING
                </span>
                {activeEpisode.guest && (
                  <span className="text-xs text-slate-400">
                    • Featuring: <strong className="text-white">{activeEpisode.guest}</strong>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-display text-white leading-tight">
                {activeEpisode.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeEpisode.description}
              </p>

              {/* Native Audio Element */}
              <audio
                ref={audioRef}
                src={activeEpisode.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Scrub Slider */}
              <div className="space-y-1.5 pt-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-[#00E676] cursor-pointer h-1.5 bg-[#222838] rounded-lg"
                />
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls & External Links */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-[#00E676] hover:bg-[#00C853] text-black flex items-center justify-center shadow-lg shadow-[#00E676]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    {activeEpisode.host || 'Skouted Youth League Media'}
                  </span>
                </div>

                {/* External Streaming Platform Links */}
                <div className="flex items-center gap-2">
                  {activeEpisode.spotifyUrl && (
                    <a
                      href={activeEpisode.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/30 text-[#1DB954] text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span>Spotify</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {activeEpisode.youtubeUrl && (
                    <a
                      href={activeEpisode.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#FF0000]/15 hover:bg-[#FF0000]/25 border border-[#FF0000]/30 text-[#FF0000] text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* 3. All Episodes Playlist */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#1E2536]">
          <Headphones className="w-4 h-4 text-[#00E676]" />
          <h3 className="text-base sm:text-lg font-black font-display text-white tracking-tight uppercase">
            All Episodes ({episodes.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {episodes.map(ep => {
            const isCurrent = activeEpisode?._id === ep._id;
            return (
              <div
                key={ep._id}
                onClick={() => {
                  setActiveEpisode(ep);
                  setIsPlaying(true);
                }}
                className={`group cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between space-y-3 ${
                  isCurrent
                    ? 'bg-[#151B28] border-[#00E676] shadow-md shadow-[#00E676]/10'
                    : 'bg-[#111520] border-[#1E2536] hover:border-[#00E676]/40 hover:bg-[#141926]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#181E2E] shrink-0 border border-white/5">
                    <img
                      src={ep.coverImageUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400'}
                      alt={ep.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-[#00E676] text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#00E676]">
                        EP 0{ep.episodeNumber}
                      </span>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[10px] text-slate-400">{ep.duration || '30 mins'}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E676] transition-colors line-clamp-2">
                      {ep.title}
                    </h4>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {ep.description}
                </p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Guest: {ep.guest || 'League Panel'}</span>
                  <span className="text-[#00E676] font-bold">Listen Now &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
