import React, { useState, useMemo, useRef, useCallback } from 'react';
import MatchCard from './MatchCard';
import {
  Calendar, Search, Clock, ArrowLeft, Bell,
  Share2, Image as ImageIcon, FileText, Check,
  Filter, Loader2
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/* ── Branded export row ─────────────────────────────────────────────────── */
function ExportCard({ fixture }) {
  const isLive = ['1ST HALF', '2ND HALF', 'HT', 'PENS', 'LIVE'].includes(fixture.status);
  const isFinished = fixture.status === 'FT';
  const homeLogo = fixture.homeTeam?.logoUrl || fixture.homeTeam?.logo;
  const awayLogo = fixture.awayTeam?.logoUrl || fixture.awayTeam?.logo;
  const statusColor = isLive ? '#FF4B4B' : isFinished ? '#94a3b8' : '#00E676';
  const statusLabel = isLive ? 'LIVE' : isFinished ? 'FT' : (fixture.status || 'TBD');
  const matchDate = fixture.date
    ? new Date(fixture.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
    : 'TBD';

  const cellRow = { display: 'flex', alignItems: 'center', gap: 8 };
  const logoBox = { width: 32, height: 32, borderRadius: 6, background: '#1C2030', overflow: 'hidden', border: '1px solid #2A3045', flexShrink: 0 };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#141720', border: '1px solid #222735', borderRadius: 12, marginBottom: 8, gap: 12 }}>
      {/* Home */}
      <div style={{ ...cellRow, flex: 1, justifyContent: 'flex-end' }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'right', fontFamily: 'Inter,sans-serif' }}>{fixture.homeTeam?.name || 'TBD'}</span>
        <div style={logoBox}>{homeLogo && <img src={homeLogo} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}</div>
      </div>
      {/* Score */}
      <div style={{ textAlign: 'center', minWidth: 80, flexShrink: 0 }}>
        {(isFinished || isLive) ? (
          <div style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 20, color: isLive ? '#FF4B4B' : '#fff', letterSpacing: 2 }}>
            {fixture.homeScore ?? 0}&nbsp;–&nbsp;{fixture.awayScore ?? 0}
          </div>
        ) : (
          <div style={{ fontWeight: 700, fontSize: 12, color: '#00E676' }}>{fixture.time || 'TBD'}</div>
        )}
        <div style={{ fontSize: 9, color: statusColor, fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1, marginTop: 2 }}>{statusLabel}</div>
        <div style={{ fontSize: 9, color: '#64748b', marginTop: 1 }}>{fixture.stage || ''}</div>
      </div>
      {/* Away */}
      <div style={{ ...cellRow, flex: 1 }}>
        <div style={logoBox}>{awayLogo && <img src={awayLogo} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}</div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'Inter,sans-serif' }}>{fixture.awayTeam?.name || 'TBD'}</span>
      </div>
      {/* Date */}
      <div style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace', flexShrink: 0, textAlign: 'right', minWidth: 60 }}>{matchDate}</div>
    </div>
  );
}

/* ── Off-screen export template ─────────────────────────────────────────── */
function ExportTemplate({ fixtures: list, filterLabel }) {
  return (
    <div style={{ width: 800, background: 'linear-gradient(160deg,#0D1117 0%,#0A0D14 50%,#0D1117 100%)', padding: '36px 40px 32px', fontFamily: 'Inter,system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -120, left: -120, width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,230,118,0.05)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: -120, right: -60, width: 360, height: 360, borderRadius: '50%', background: 'rgba(59,130,246,0.07)', filter: 'blur(80px)' }} />

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1E2330', paddingBottom: 20, marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(0,230,118,0.15)', border: '1px solid rgba(0,230,118,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏆</div>
            <div>
              <div style={{ color: '#00E676', fontWeight: 900, fontSize: 15, letterSpacing: 1, textTransform: 'uppercase' }}>Skouted Youth League Championship</div>
              <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, marginTop: 1 }}>Official Fixture Sheet — Season 2026/2027</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 10, color: '#64748b' }}>📍</span>
            <span style={{ fontSize: 10, color: '#64748b', fontWeight: 500 }}>Lekan Salami Stadium, Adamasingba, Ibadan</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{filterLabel}</div>
          <div style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', marginTop: 2 }}>{list.length} FIXTURE{list.length !== 1 ? 'S' : ''}</div>
          <div style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace', marginTop: 2 }}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Column labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, padding: '0 16px' }}>
        {['HOME', 'SCORE / TIME', 'AWAY', 'DATE'].map(l => (
          <span key={l} style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>{l}</span>
        ))}
      </div>

      {/* Rows */}
      <div>{list.map(f => <ExportCard key={f._id} fixture={f} />)}</div>

      {/* Footer */}
      <div style={{ marginTop: 24, borderTop: '1px solid #1E2330', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace' }}>skoutedyouthleague.com</span>
        <span style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace' }}>© 2026 Skouted Youth League. All rights reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#00E676', fontFamily: 'monospace' }}>OFFICIAL</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#00E676', display: 'inline-block' }} />
          <span style={{ fontSize: 9, color: '#334155', fontFamily: 'monospace' }}>FIXTURE SHEET</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function FixturesPage({
  fixtures = [],
  onSelectFixture,
  onBackToHome,
  favoriteTeamIds = [],
  onToggleFavorite,
  onOpenFanAlerts
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedStage, setSelectedStage] = useState('ALL');

  /* export */
  const [exportMode, setExportMode]   = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [exportScope, setExportScope] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportFmt, setExportFmt]     = useState(null);
  const exportRef = useRef(null);

  /* counts */
  const liveCount     = useMemo(() => fixtures.filter(f => ['1ST HALF','2ND HALF','HT','PENS','LIVE'].includes(f.status)).length, [fixtures]);
  const upcomingCount = useMemo(() => fixtures.filter(f => f.status === 'UPCOMING').length, [fixtures]);
  const finishedCount = useMemo(() => fixtures.filter(f => f.status === 'FT').length, [fixtures]);
  const stages        = useMemo(() => { const s = new Set(); fixtures.forEach(f => f.stage && s.add(f.stage)); return [...s]; }, [fixtures]);

  /* filtered display list */
  const filteredFixtures = useMemo(() => fixtures.filter(f => {
    const live = ['1ST HALF','2ND HALF','HT','PENS','LIVE'].includes(f.status);
    if (statusFilter === 'live'     && !live)                return false;
    if (statusFilter === 'upcoming' && f.status !== 'UPCOMING') return false;
    if (statusFilter === 'finished' && f.status !== 'FT')    return false;
    if (selectedStage !== 'ALL' && f.stage !== selectedStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const hit = s => (s || '').toLowerCase().includes(q);
      if (!hit(f.homeTeam?.name) && !hit(f.homeTeam?.shortCode) &&
          !hit(f.awayTeam?.name) && !hit(f.awayTeam?.shortCode) &&
          !hit(f.venue) && !hit(f.stage)) return false;
    }
    return true;
  }), [fixtures, statusFilter, selectedStage, searchQuery]);

  /* export set */
  const exportFixtures = useMemo(() => {
    if (exportScope === 'selected') return fixtures.filter(f => selectedIds.has(f._id));
    if (exportScope === 'leg1')     return fixtures.filter(f => { const md = parseInt(f.matchday || f.stage?.replace(/\D/g,'') || '0'); return md >= 1 && md <= 11; });
    if (exportScope === 'leg2')     return fixtures.filter(f => { const md = parseInt(f.matchday || f.stage?.replace(/\D/g,'') || '0'); return md >= 12 && md <= 22; });
    return filteredFixtures;
  }, [exportScope, fixtures, filteredFixtures, selectedIds]);

  const scopeLabel = useMemo(() => ({ all: 'All Fixtures', leg1: 'Leg 1 (Weeks 1–11)', leg2: 'Leg 2 (Weeks 12–22)', selected: `Selected (${selectedIds.size})` }[exportScope]), [exportScope, selectedIds.size]);

  const toggleId  = useCallback(id => setSelectedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);
  const selectAll = () => setSelectedIds(new Set(filteredFixtures.map(f => f._id)));
  const clearAll  = () => setSelectedIds(new Set());

  const handleExport = useCallback(async (fmt) => {
    if (!exportFixtures.length) return;
    setExportFmt(fmt); setIsExporting(true);
    await new Promise(r => setTimeout(r, 150));
    try {
      const node = exportRef.current;
      if (!node) throw new Error('no node');
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2, backgroundColor: '#0D1117' });
      const slug = (scopeLabel || 'fixtures').replace(/\s+/g, '-').toLowerCase();
      if (fmt === 'image') {
        Object.assign(document.createElement('a'), { download: `skouted-${slug}.png`, href: dataUrl }).click();
      } else {
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [800, node.offsetHeight] });
        pdf.addImage(dataUrl, 'PNG', 0, 0, 800, node.offsetHeight);
        pdf.save(`skouted-${slug}.pdf`);
      }
    } catch (e) { console.error('[Export]', e); }
    finally { setIsExporting(false); setExportFmt(null); }
  }, [exportFixtures, scopeLabel]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Hidden export mount */}
      <div style={{ position: 'fixed', top: 0, left: -9999, zIndex: -999, pointerEvents: 'none' }}>
        <div ref={exportRef}>
          {isExporting && <ExportTemplate fixtures={exportFixtures} filterLabel={scopeLabel} />}
        </div>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E2330]">
        <div className="flex items-center gap-3">
          <button onClick={onBackToHome} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#00E676]" />
              <span>Championship Fixtures &amp; Results</span>
              {liveCount > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FF4B4B]/15 border border-[#FF4B4B]/30 text-[#FF4B4B] text-[10px] font-mono font-bold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping" />
                  {liveCount} LIVE
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Complete tournament schedule — real-time scores &amp; export tools</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenFanAlerts && (
            <button onClick={onOpenFanAlerts} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFB800]/10 hover:bg-[#FFB800]/20 border border-[#FFB800]/25 text-[#FFB800] text-xs font-semibold cursor-pointer transition-all">
              <Bell className="w-3.5 h-3.5" /><span>Goal Alerts</span>
            </button>
          )}
          <button
            onClick={() => { setExportMode(m => !m); clearAll(); }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${exportMode ? 'bg-[#00E676]/15 border-[#00E676]/50 text-[#00E676]' : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'}`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{exportMode ? 'Exit Export' : 'Export / Share'}</span>
          </button>
        </div>
      </div>

      {/* ── Export Panel ────────────────────────────────────────────────── */}
      {exportMode && (
        <div className="rounded-2xl bg-[#10131B] border border-[#00E676]/20 p-4 space-y-4 shadow-lg shadow-[#00E676]/5">
          {/* Scope selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-4 h-4 text-[#00E676]" />
              <span className="text-xs font-bold text-white">Export Scope:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all',      label: 'All Visible' },
                { id: 'leg1',     label: 'Leg 1 (Wks 1–11)' },
                { id: 'leg2',     label: 'Leg 2 (Wks 12–22)' },
                { id: 'selected', label: `Selected (${selectedIds.size})` },
              ].map(o => (
                <button key={o.id} onClick={() => setExportScope(o.id)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${exportScope === o.id ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]' : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {exportScope === 'selected' && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Click fixtures below to select.</span>
              <button onClick={selectAll} className="text-[#00E676] font-bold hover:underline cursor-pointer">Select all visible</button>
              <span>·</span>
              <button onClick={clearAll} className="hover:text-white cursor-pointer">Clear</button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1 border-t border-[#1E2330]">
            <button onClick={() => handleExport('pdf')} disabled={isExporting || !exportFixtures.length}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#1A3356] hover:from-[#243F67] hover:to-[#1E3A5F] border border-[#3B82F6]/30 hover:border-[#3B82F6]/60 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isExporting && exportFmt === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-[#3B82F6]" />}
              <span>Download Fixture Sheet (PDF)</span>
              <span className="text-[10px] font-mono bg-[#3B82F6]/15 px-1.5 py-0.5 rounded text-[#3B82F6]">{exportFixtures.length}</span>
            </button>
            <button onClick={() => handleExport('image')} disabled={isExporting || !exportFixtures.length}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00E676]/15 to-[#10B981]/10 hover:from-[#00E676]/25 hover:to-[#10B981]/20 border border-[#00E676]/30 hover:border-[#00E676]/60 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isExporting && exportFmt === 'image' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4 text-[#00E676]" />}
              <span>Share / Export as Image (PNG)</span>
              <span className="text-[10px] font-mono bg-[#00E676]/15 px-1.5 py-0.5 rounded text-[#00E676]">{exportFixtures.length}</span>
            </button>
          </div>

          {!exportFixtures.length && (
            <p className="text-xs text-amber-400/80 text-center">No fixtures match this scope. Change scope or adjust filters.</p>
          )}
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all',      label: 'ALL FIXTURES', count: fixtures.length },
              { id: 'live',     label: 'LIVE NOW',     count: liveCount,     isLive: true },
              { id: 'upcoming', label: 'UPCOMING',     count: upcomingCount },
              { id: 'finished', label: 'RESULTS',      count: finishedCount },
            ].map(tab => (
              <button key={tab.id} onClick={() => setStatusFilter(tab.id)}
                className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                  statusFilter === tab.id
                    ? tab.isLive ? 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-white shadow-md shadow-[#FF4B4B]/20' : 'bg-[#00E676]/15 border-[#00E676] text-[#00E676] shadow-md shadow-[#00E676]/15'
                    : 'bg-[#141720] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600'
                }`}>
                {tab.isLive && tab.count > 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#FF4B4B] animate-ping" />}
                <span>{tab.label}</span>
                <span className={`text-[10px] font-mono px-1.5 rounded ${statusFilter === tab.id ? (tab.isLive ? 'bg-[#FF4B4B]/30 text-white' : 'bg-[#00E676]/20 text-[#00E676]') : 'bg-white/5 text-slate-400'}`}>{tab.count}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search team, venue, stage..."
              className="w-full bg-[#141720] border border-[#222735] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] transition-colors" />
          </div>
        </div>

        {stages.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {['ALL', ...stages].map(st => (
              <button key={st} onClick={() => setSelectedStage(st)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border ${selectedStage === st ? (st === 'ALL' ? 'bg-white/10 text-white border-white/20' : 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30') : 'bg-white/[0.02] text-slate-400 border-white/5 hover:text-white'}`}>
                {st === 'ALL' ? 'All Stages' : st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Fixture Grid ─────────────────────────────────────────────────── */}
      {filteredFixtures.length === 0 ? (
        <div className="rounded-2xl p-8 sm:p-12 text-center space-y-3 border border-slate-800 bg-slate-900/60">
          <Clock className="w-10 h-10 mx-auto text-slate-600" />
          <h4 className="font-bold text-white text-base">No Matching Fixtures Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Try adjusting your search or status filter.</p>
          {(searchQuery || statusFilter !== 'all' || selectedStage !== 'ALL') && (
            <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); setSelectedStage('ALL'); }}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors">
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
          {filteredFixtures.map(fixture => {
            const isSelected = selectedIds.has(fixture._id);
            const selectable = exportMode && exportScope === 'selected';
            return (
              <div key={fixture._id} className={`relative transition-all duration-150 ${selectable ? 'cursor-pointer' : ''}`}
                onClick={selectable ? () => toggleId(fixture._id) : undefined}>
                {selectable && (
                  <div className={`absolute inset-0 rounded-2xl z-10 border-2 transition-all pointer-events-none ${isSelected ? 'border-[#00E676] bg-[#00E676]/5' : 'border-transparent hover:border-white/20'}`}>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#00E676] flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5 text-black" />
                      </div>
                    )}
                  </div>
                )}
                <MatchCard fixture={fixture} onSelect={exportMode ? undefined : onSelectFixture}
                  isFavoriteHome={favoriteTeamIds.includes(fixture.homeTeam?._id)}
                  isFavoriteAway={favoriteTeamIds.includes(fixture.awayTeam?._id)}
                  onToggleFavorite={onToggleFavorite} />
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-4 text-center">
        <button onClick={onBackToHome} className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /><span>Return to League Homepage</span>
        </button>
      </div>
    </div>
  );
}
