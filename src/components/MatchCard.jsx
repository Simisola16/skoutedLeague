import React, { useState } from 'react';
import { Star, Share2, Check, Clock, MapPin, ChevronRight } from 'lucide-react';

export default function MatchCard({
  fixture,
  onSelect,
  isFavoriteHome = false,
  isFavoriteAway = false,
  onToggleFavorite
}) {
  const [copied, setCopied] = useState(false);

  const isLive = ['1ST HALF', '2ND HALF', 'HT', 'PENS', 'LIVE'].includes(fixture?.status);
  const isFT = fixture?.status === 'FT';
  const isUpcoming = fixture?.status === 'UPCOMING';

  const handleShare = (e) => {
    e.stopPropagation();
    const shareText = `🏆 Skouted League: ${fixture.homeTeam?.name || 'Home'} ${fixture.homeScore ?? 0} - ${fixture.awayScore ?? 0} ${fixture.awayTeam?.name || 'Away'} (${isLive ? `${fixture.minute}' LIVE` : fixture.status})!`;
    const shareUrl = window.location.origin + '/fixtures';

    if (navigator.share) {
      navigator.share({
        title: 'Skouted Youth League Match',
        text: shareText,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Clean venue name for concise chip display
  const venueDisplay = fixture.venue
    ? fixture.venue.split(',')[0].replace(/Stadium/i, '').trim() || 'Lekan Salami'
    : 'Lekan Salami';

  return (
    <div
      onClick={() => onSelect(fixture)}
      role="button"
      tabIndex={0}
      className={`group relative w-full bg-slate-900/90 border transition-all duration-200 rounded-xl py-2.5 px-3 sm:py-3.5 sm:px-4 cursor-pointer select-none min-h-[48px] active:scale-[0.99] ${
        isLive
          ? 'border-red-500/50 bg-slate-900/95 shadow-md shadow-red-500/10 hover:border-red-400'
          : 'border-slate-800/90 hover:border-slate-700 hover:bg-slate-900 shadow-sm shadow-black/20'
      }`}
    >
      {/* Top Meta Bar: Stage, Status Pill & Quick Action */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5 mb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-slate-300 truncate text-[11px]">
            {fixture.stage || 'Championship'}
          </span>
          {fixture.leg && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 font-bold border border-blue-500/30 shrink-0">
              Leg {fixture.leg}
            </span>
          )}
          {fixture.matchday && (
            <span className="text-slate-500 hidden sm:inline">• MD {fixture.matchday}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Venue Chip for Scheduled/FT */}
          <div className="hidden xs:flex items-center gap-1 text-[10px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/40">
            <MapPin className="w-2.5 h-2.5 text-[#00E676] shrink-0" />
            <span className="truncate max-w-[100px] sm:max-w-[140px]">{venueDisplay}</span>
          </div>

          <button
            onClick={handleShare}
            className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Share match update"
          >
            {copied ? <Check className="w-3 h-3 text-[#00E676]" /> : <Share2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Main Row: Home Team (Left) | Score / Kickoff (Center) | Away Team (Right) */}
      <div className="grid grid-cols-12 items-center gap-1 sm:gap-2">
        
        {/* Left: Home Team */}
        <div className="col-span-5 flex items-center gap-2 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(fixture.homeTeam?._id);
            }}
            className="text-slate-600 hover:text-[#FFB800] transition-colors shrink-0 p-0.5"
            title="Follow club"
          >
            <Star className={`w-3.5 h-3.5 ${isFavoriteHome ? 'fill-[#FFB800] text-[#FFB800]' : ''}`} />
          </button>

          {fixture.homeTeam?.logo ? (
            <img
              src={fixture.homeTeam.logo}
              alt={fixture.homeTeam?.name || 'Home'}
              className="w-8 h-8 rounded-lg object-contain bg-slate-800/90 border border-slate-700/60 p-0.5 shrink-0 shadow-sm"
              loading="lazy"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#1C2030] border border-slate-700/60 flex items-center justify-center text-xs font-black text-[#00E676] shrink-0 shadow-sm">
              {fixture.homeTeam?.shortCode || 'H'}
            </div>
          )}

          <div className="min-w-0 leading-tight">
            <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#00E676] transition-colors">
              {fixture.homeTeam?.name || 'Home Club'}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 font-medium">
              {fixture.homeTeam?.shortCode || 'HOM'}
            </span>
          </div>
        </div>

        {/* Center: Live Minute & Scores or Kickoff Time */}
        <div className="col-span-2 flex flex-col items-center justify-center text-center px-1">
          {isLive ? (
            <div className="flex flex-col items-center justify-center">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 text-[#FF4B4B] font-mono font-black text-[10px] leading-none mb-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping" />
                <span>{fixture.status === 'HT' ? 'HT' : `${fixture.minute || 0}'`}</span>
              </span>
              <div className="font-mono text-lg sm:text-2xl font-black text-white tracking-wider flex items-center justify-center gap-1">
                <span className={fixture.homeScore > fixture.awayScore ? 'text-[#00E676]' : 'text-white'}>
                  {fixture.homeScore ?? 0}
                </span>
                <span className="text-slate-600 font-light text-sm sm:text-base">-</span>
                <span className={fixture.awayScore > fixture.homeScore ? 'text-[#00E676]' : 'text-white'}>
                  {fixture.awayScore ?? 0}
                </span>
              </div>
            </div>
          ) : isUpcoming ? (
            <div className="flex flex-col items-center justify-center">
              <div className="px-2 py-0.5 rounded-md bg-[#00E676]/10 border border-[#00E676]/25 text-[#00E676] font-mono font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-sm">
                {fixture.time || '15:00'}
              </div>
              <span className="text-[9px] font-mono text-slate-400 font-semibold mt-0.5">
                {fixture.date ? fixture.date.slice(5) : 'WAT'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 mb-0.5">
                FT
              </span>
              <div className="font-mono text-base sm:text-xl font-black text-white tracking-wider flex items-center justify-center gap-1">
                <span className={fixture.homeScore > fixture.awayScore ? 'text-[#00E676]' : 'text-slate-200'}>
                  {fixture.homeScore ?? 0}
                </span>
                <span className="text-slate-600 font-light text-xs sm:text-sm">-</span>
                <span className={fixture.awayScore > fixture.homeScore ? 'text-[#00E676]' : 'text-slate-200'}>
                  {fixture.awayScore ?? 0}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Away Team */}
        <div className="col-span-5 flex items-center justify-end gap-2 min-w-0 text-right">
          <div className="min-w-0 leading-tight">
            <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#00E676] transition-colors">
              {fixture.awayTeam?.name || 'Away Club'}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 font-medium">
              {fixture.awayTeam?.shortCode || 'AWY'}
            </span>
          </div>

          {fixture.awayTeam?.logo ? (
            <img
              src={fixture.awayTeam.logo}
              alt={fixture.awayTeam?.name || 'Away'}
              className="w-8 h-8 rounded-lg object-contain bg-slate-800/90 border border-slate-700/60 p-0.5 shrink-0 shadow-sm"
              loading="lazy"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#1C2030] border border-slate-700/60 flex items-center justify-center text-xs font-black text-[#00E676] shrink-0 shadow-sm">
              {fixture.awayTeam?.shortCode || 'A'}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite && onToggleFavorite(fixture.awayTeam?._id);
            }}
            className="text-slate-600 hover:text-[#FFB800] transition-colors shrink-0 p-0.5"
            title="Follow club"
          >
            <Star className={`w-3.5 h-3.5 ${isFavoriteAway ? 'fill-[#FFB800] text-[#FFB800]' : ''}`} />
          </button>
        </div>

      </div>

      {/* Tap indicator footer bar (Subtle) */}
      <div className="mt-2 pt-1.5 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400">
        <span className="truncate max-w-[180px] xs:max-w-none text-slate-400">
          {fixture.date ? `${fixture.date} • ` : ''}{venueDisplay}
        </span>
        <span className="flex items-center gap-0.5 font-medium text-slate-400 group-hover:text-[#00E676] transition-colors shrink-0">
          <span>Match Center</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>

    </div>
  );
}
