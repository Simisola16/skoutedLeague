import React, { useState } from 'react';
import { Star, Share2, Check, Clock, ChevronRight, MapPin } from 'lucide-react';

export default function MatchCard({
  fixture,
  onSelect,
  isFavoriteHome = false,
  isFavoriteAway = false,
  onToggleFavorite
}) {
  const [copied, setCopied] = useState(false);

  const isLive = fixture.status === '1ST HALF' || fixture.status === '2ND HALF' || fixture.status === 'HT' || fixture.status === 'PENS';
  const isFT = fixture.status === 'FT';
  const isUpcoming = fixture.status === 'UPCOMING';

  const handleShare = (e) => {
    e.stopPropagation();
    const shareText = `🏆 Skouted League: ${fixture.homeTeam?.name} ${fixture.homeScore ?? 0} - ${fixture.awayScore ?? 0} ${fixture.awayTeam?.name} (${isLive ? `${fixture.minute}' LIVE` : fixture.status})!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: 'Skouted League Match',
        text: shareText,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={() => onSelect(fixture)}
      className={`glass-card rounded-2xl p-4 sm:p-5 transition-all cursor-pointer border hover:translate-y-[-1px] ${
        isLive
          ? 'border-[#FF4B4B]/40 hover:border-[#FF4B4B] bg-[#161922] shadow-lg shadow-[#FF4B4B]/5'
          : 'border-[#222735] hover:border-slate-600 bg-[#141720]'
      }`}
    >
      {/* Top Meta Bar: Stage, Status / Clock, Share & Follow */}
      <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
        
        {/* Stage & Status */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-400">{fixture.stage}</span>
          <span className="text-slate-600">•</span>
          
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 text-[#FF4B4B] font-mono font-black text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping"></span>
              <span>{fixture.status === 'HT' ? 'HALF TIME' : `${fixture.minute}' LIVE`}</span>
            </span>
          ) : isFT ? (
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold text-[11px]">
              FULL TIME
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[#00E676] font-mono font-bold text-[11px]">
              <Clock className="w-3.5 h-3.5" />
              <span>{fixture.date} • {fixture.time}</span>
            </span>
          )}
        </div>

        {/* Action icons: Share & Venue */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="Share match via WhatsApp or X"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00E676]" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

      {/* Main Score & Teams Grid */}
      <div className="py-3.5 grid grid-cols-12 items-center gap-2">
        
        {/* Home Team */}
        <div className="col-span-5 flex items-center gap-2.5 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(fixture.homeTeam?._id);
            }}
            className="text-slate-500 hover:text-[#FFB800] transition-colors shrink-0"
            title="Follow team"
          >
            <Star className={`w-3.5 h-3.5 ${isFavoriteHome ? 'fill-[#FFB800] text-[#FFB800]' : ''}`} />
          </button>
          {fixture.homeTeam?.logo ? (
            <img
              src={fixture.homeTeam.logo}
              alt={fixture.homeTeam?.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shrink-0 border border-white/10 bg-slate-800 shadow"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1C2030] border border-white/10 flex items-center justify-center text-xs font-black text-[#00E676] shrink-0 shadow">
              {fixture.homeTeam?.shortCode || 'H'}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-white truncate">{fixture.homeTeam?.name}</h4>
            <span className="text-[10px] font-mono text-slate-400 font-semibold">{fixture.homeTeam?.shortCode}</span>
          </div>
        </div>

        {/* Center Scores / VS */}
        <div className="col-span-2 flex flex-col items-center justify-center text-center">
          {isUpcoming ? (
            <div className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] font-mono font-bold text-slate-400 border border-white/5">
              VS
            </div>
          ) : (
            <div className="flex items-center gap-1.5 font-mono text-xl sm:text-2xl font-black">
              <span className={fixture.homeScore > fixture.awayScore ? 'text-[#00E676]' : 'text-white'}>
                {fixture.homeScore}
              </span>
              <span className="text-slate-500 text-base font-normal">-</span>
              <span className={fixture.awayScore > fixture.homeScore ? 'text-[#00E676]' : 'text-white'}>
                {fixture.awayScore}
              </span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-5 flex items-center justify-end gap-2.5 min-w-0 text-right">
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-white truncate">{fixture.awayTeam?.name}</h4>
            <span className="text-[10px] font-mono text-slate-400 font-semibold">{fixture.awayTeam?.shortCode}</span>
          </div>
          {fixture.awayTeam?.logo ? (
            <img
              src={fixture.awayTeam.logo}
              alt={fixture.awayTeam?.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover shrink-0 border border-white/10 bg-slate-800 shadow"
            />
          ) : (
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1C2030] border border-white/10 flex items-center justify-center text-xs font-black text-[#00E676] shrink-0 shadow">
              {fixture.awayTeam?.shortCode || 'A'}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(fixture.awayTeam?._id);
            }}
            className="text-slate-500 hover:text-[#FFB800] transition-colors shrink-0"
            title="Follow team"
          >
            <Star className={`w-3.5 h-3.5 ${isFavoriteAway ? 'fill-[#FFB800] text-[#FFB800]' : ''}`} />
          </button>
        </div>

      </div>

      {/* Bottom Footer Bar: Venue and quick lineup status */}
      <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1 text-[11px] truncate max-w-[200px] sm:max-w-none">
          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{fixture.venue}</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 group-hover:text-[#00E676]">
          <span>Match Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

    </div>
  );
}
