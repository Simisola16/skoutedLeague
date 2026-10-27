import React, { useState, useMemo, useRef, useCallback } from 'react';
import MatchCard from './MatchCard';
import {
  Calendar, Search, Clock, ArrowLeft, Bell,
  Share2, Image as ImageIcon, FileText, Check,
  Filter, Loader2, Sparkles, Download, Layers
} from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import YouTubeLiveEmbed from './YouTubeLiveEmbed';

/* ── Branded export row ─────────────────────────────────────────────────── */
function ExportCard({ fixture }) {
  const isLive = ['1ST HALF', '2ND HALF', 'HT', 'PENS', 'LIVE'].includes(fixture.status);
  const isFinished = fixture.status === 'FT';
  const homeLogo = fixture.homeTeam?.logoUrl || fixture.homeTeam?.logo;
  const awayLogo = fixture.awayTeam?.logoUrl || fixture.awayTeam?.logo;
  const statusColor = isLive ? '#FF4B4B' : isFinished ? '#94a3b8' : '#00E676';
  const statusLabel = isLive ? 'LIVE' : isFinished ? 'FULL TIME' : (fixture.status === 'RESCHEDULED' ? 'RESCHEDULED' : 'UPCOMING');
  const matchDate = fixture.date
    ? new Date(fixture.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
    : 'TBD';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '11px 16px',
      background: 'linear-gradient(90deg, #121622 0%, #151926 100%)',
      border: '1px solid #23293A',
      borderRadius: 12,
      marginBottom: 8,
      gap: 12,
      boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
    }}>
      {/* Home Team */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end' }}>
        <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 13, textAlign: 'right', fontFamily: 'Inter,system-ui,sans-serif' }}>
          {fixture.homeTeam?.name || 'TBD'}
        </span>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: '#1A2030',
          overflow: 'hidden',
          border: '1px solid #2C354E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {homeLogo ? (
            <img src={homeLogo} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: '#00E676', fontWeight: 900, fontSize: 13 }}>{(fixture.homeTeam?.name || 'H')[0]}</span>
          )}
        </div>
      </div>

      {/* Middle Score / Time */}
      <div style={{ textAlign: 'center', minWidth: 96, flexShrink: 0, padding: '0 6px' }}>
        {(isFinished || isLive) ? (
          <div style={{
            fontFamily: 'monospace',
            fontWeight: 900,
            fontSize: 20,
            color: isLive ? '#FF4B4B' : '#FFFFFF',
            letterSpacing: 2,
            lineHeight: 1.1
          }}>
            {fixture.homeScore ?? 0}&nbsp;–&nbsp;{fixture.awayScore ?? 0}
          </div>
        ) : (
          <div style={{
            fontWeight: 800,
            fontSize: 13,
            color: '#00E676',
            background: 'rgba(0, 230, 118, 0.1)',
            border: '1px solid rgba(0, 230, 118, 0.25)',
            padding: '3px 10px',
            borderRadius: 6,
            display: 'inline-block',
            fontFamily: 'monospace'
          }}>
            {fixture.time || '10:00'}
          </div>
        )}
        <div style={{
          fontSize: 9,
          color: statusColor,
          fontFamily: 'monospace',
          fontWeight: 700,
          letterSpacing: 1,
          marginTop: 4,
          textTransform: 'uppercase'
        }}>
          {statusLabel}
        </div>
      </div>

      {/* Away Team */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: '#1A2030',
          overflow: 'hidden',
          border: '1px solid #2C354E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {awayLogo ? (
            <img src={awayLogo} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span style={{ color: '#3B82F6', fontWeight: 900, fontSize: 13 }}>{(fixture.awayTeam?.name || 'A')[0]}</span>
          )}
        </div>
        <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: 13, fontFamily: 'Inter,system-ui,sans-serif' }}>
          {fixture.awayTeam?.name || 'TBD'}
        </span>
      </div>

      {/* Date & Venue */}
      <div style={{ textAlign: 'right', minWidth: 80, flexShrink: 0, borderLeft: '1px solid #1E2536', paddingLeft: 12 }}>
        <div style={{ fontSize: 10, color: '#CBD5E1', fontFamily: 'monospace', fontWeight: 700 }}>
          {matchDate}
        </div>
        <div style={{ fontSize: 8, color: '#64748B', marginTop: 2, maxWidth: 85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fixture.venue ? fixture.venue.split(',')[0] : 'Adamasingba'}
        </div>
      </div>
    </div>
  );
}

/* ── Off-screen export template ─────────────────────────────────────────── */
function ExportTemplate({ fixtures: list, filterLabel }) {
  // Group fixtures by Stage / Matchday
  const groupedFixtures = useMemo(() => {
    const map = new Map();
    list.forEach(f => {
      const key = f.stage || (f.matchday ? `Week ${f.matchday}` : 'Championship Schedule');
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(f);
    });
    return Array.from(map.entries()).sort(([a], [b]) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [list]);

  return (
    <div style={{ width: 840, background: 'linear-gradient(160deg,#0A0D14 0%,#0D1117 50%,#0A0D14 100%)', padding: '36px 40px 32px', fontFamily: 'Inter,system-ui,sans-serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -120, left: -120, width: 440, height: 440, borderRadius: '50%', background: 'rgba(0,230,118,0.06)', filter: 'blur(90px)' }} />
      <div style={{ position: 'absolute', bottom: -120, right: -60, width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,130,246,0.08)', filter: 'blur(90px)' }} />

      {/* Header */}
      <div style={{
        borderBottom: '1.5px solid rgba(0, 230, 118, 0.25)',
        paddingBottom: 22,
        marginBottom: 22,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 20
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(0,230,118,0.2) 0%, rgba(59,130,246,0.15) 100%)',
              border: '1.5px solid rgba(0,230,118,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              boxShadow: '0 0 15px rgba(0,230,118,0.2)'
            }}>
              🏆
            </div>
            <div>
              <div style={{ color: '#00E676', fontWeight: 900, fontSize: 18, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                Skouted Youth League Championship
              </div>
              <div style={{ color: '#E2E8F0', fontSize: 12, fontWeight: 700, marginTop: 2 }}>
                Official Tournament Fixture Sheet &amp; Results Schedule
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11 }}>📍</span>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Lekan Salami Stadium, Adamasingba, Ibadan</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 11 }}>📅</span>
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>Season 2026/2027</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0, 230, 118, 0.12)',
            border: '1px solid rgba(0, 230, 118, 0.3)',
            borderRadius: 6,
            padding: '3px 10px',
            fontSize: 10,
            fontWeight: 800,
            color: '#00E676',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            {filterLabel}
          </div>
          <div style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 800, fontFamily: 'monospace', marginTop: 5 }}>
            {list.length} TOTAL FIXTURES
          </div>
          <div style={{ fontSize: 9, color: '#64748B', fontFamily: 'monospace', marginTop: 3 }}>
            Generated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 8, color: '#475569', fontFamily: 'monospace', marginTop: 2 }}>
            DOC REF: SYL-2026-EXPORT
          </div>
        </div>
      </div>

      {/* Column labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '0 16px' }}>
        {['HOME CLUB', 'SCORE / KICKOFF', 'AWAY CLUB', 'DATE & VENUE'].map(l => (
          <span key={l} style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1 }}>{l}</span>
        ))}
      </div>

      {/* Grouped Rows */}
      {groupedFixtures.map(([stageTitle, stageMatches]) => (
        <div key={stageTitle} style={{ marginBottom: 18 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 14px',
            background: 'linear-gradient(90deg, rgba(0,230,118,0.12) 0%, rgba(59,130,246,0.06) 100%)',
            border: '1px solid rgba(0,230,118,0.25)',
            borderRadius: 10,
            marginBottom: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#00E676', fontWeight: 900, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                ⚽ {stageTitle}
              </span>
              {stageMatches[0]?.leg && (
                <span style={{ fontSize: 9, color: '#94A3B8', background: 'rgba(255,255,255,0.08)', padding: '2px 7px', borderRadius: 4, fontFamily: 'monospace', fontWeight: 600 }}>
                  LEG {stageMatches[0].leg}
                </span>
              )}
            </div>
            <span style={{ color: '#64748B', fontSize: 10, fontFamily: 'monospace', fontWeight: 600 }}>
              {stageMatches.length} {stageMatches.length === 1 ? 'FIXTURE' : 'FIXTURES'}
            </span>
          </div>
          <div>
            {stageMatches.map(f => <ExportCard key={f._id} fixture={f} />)}
          </div>
        </div>
      ))}

      {/* Footer */}
      <div style={{ marginTop: 28, borderTop: '1px solid #1E2330', paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace' }}>skoutedyouthleague.com</span>
        <span style={{ fontSize: 9, color: '#475569', fontFamily: 'monospace' }}>© 2026 Skouted Youth League Championship. All rights reserved.</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#00E676', fontFamily: 'monospace', fontWeight: 700 }}>OFFICIAL VERIFIED SCHEDULE</span>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00E676', display: 'inline-block' }} />
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

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // fixtures per page

  /* export */
  const [exportMode, setExportMode]   = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [exportScope, setExportScope] = useState('all_season');
  const [isExporting, setIsExporting] = useState(false);
  const [exportFmt, setExportFmt]     = useState(null);
  const [exportStep, setExportStep]   = useState('');
  const exportRef = useRef(null);

  /* counts */
  const liveCount     = useMemo(() => fixtures.filter(f => ['1ST HALF','2ND HALF','HT','PENS','LIVE'].includes(f.status)).length, [fixtures]);
  const upcomingCount = useMemo(() => fixtures.filter(f => f.status === 'UPCOMING' || f.status === 'RESCHEDULED').length, [fixtures]);
  const finishedCount = useMemo(() => fixtures.filter(f => f.status === 'FT').length, [fixtures]);
  const stages        = useMemo(() => { const s = new Set(); fixtures.forEach(f => f.stage && s.add(f.stage)); return [...s]; }, [fixtures]);

  const leg1Count = useMemo(() => fixtures.filter(f => {
    const md = parseInt(f.matchday || f.stage?.replace(/\D/g, '') || '0');
    return md >= 1 && md <= 11;
  }).length, [fixtures]);

  const leg2Count = useMemo(() => fixtures.filter(f => {
    const md = parseInt(f.matchday || f.stage?.replace(/\D/g, '') || '0');
    return md >= 12 && md <= 22;
  }).length, [fixtures]);

  /* filtered display list */
  const filteredFixtures = useMemo(() => fixtures.filter(f => {
    const live = ['1ST HALF','2ND HALF','HT','PENS','LIVE'].includes(f.status);
    if (statusFilter === 'live' && !live) return false;
    if (statusFilter === 'upcoming' && f.status !== 'UPCOMING' && f.status !== 'RESCHEDULED') return false;
    if (statusFilter === 'finished' && f.status !== 'FT') return false;
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

  // pagination derived list
  const totalPages = Math.ceil(filteredFixtures.length / itemsPerPage) || 1;
  const paginatedFixtures = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFixtures.slice(start, start + itemsPerPage);
  }, [filteredFixtures, currentPage, itemsPerPage]);

  /* export set */
  const exportFixtures = useMemo(() => {
    if (exportScope === 'all_season') return fixtures;
    if (exportScope === 'visible')    return filteredFixtures;
    if (exportScope === 'page')       return paginatedFixtures;
    if (exportScope === 'leg1')       return fixtures.filter(f => { const md = parseInt(f.matchday || f.stage?.replace(/\D/g,'') || '0'); return md >= 1 && md <= 11; });
    if (exportScope === 'leg2')       return fixtures.filter(f => { const md = parseInt(f.matchday || f.stage?.replace(/\D/g,'') || '0'); return md >= 12 && md <= 22; });
    if (exportScope === 'selected')   return fixtures.filter(f => selectedIds.has(f._id));
    return fixtures;
  }, [exportScope, fixtures, filteredFixtures, paginatedFixtures, selectedIds]);

  const scopeLabel = useMemo(() => ({
    all_season: `Full Season (All ${fixtures.length} Fixtures)`,
    visible:    `Filtered Fixtures (${filteredFixtures.length})`,
    page:       `Current Page (${paginatedFixtures.length})`,
    leg1:       `Leg 1 (Weeks 1–11 · ${leg1Count})`,
    leg2:       `Leg 2 (Weeks 12–22 · ${leg2Count})`,
    selected:   `Selected Fixtures (${selectedIds.size})`
  }[exportScope] || 'Championship Fixtures'), [exportScope, fixtures.length, filteredFixtures.length, paginatedFixtures.length, leg1Count, leg2Count, selectedIds.size]);

  const toggleId  = useCallback(id => setSelectedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);
  const selectAll = () => setSelectedIds(new Set(filteredFixtures.map(f => f._id)));
  const clearAll  = () => setSelectedIds(new Set());

  const handleExport = useCallback(async (fmt) => {
    if (!exportFixtures.length) return;
    setExportFmt(fmt);
    setIsExporting(true);
    setExportStep('Preparing high-resolution render...');
    await new Promise(r => setTimeout(r, 200));

    try {
      const node = exportRef.current;
      if (!node) throw new Error('Export container not mounted');

      setExportStep('Rendering official tournament schedule...');
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#0D1117'
      });

      const slug = (exportScope === 'all_season' ? 'full-season-all-fixtures' : (scopeLabel || 'fixtures'))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const baseName = `skouted-${slug}-${new Date().toISOString().slice(0, 10)}`;

      if (fmt === 'image' || fmt === 'both') {
        setExportStep('Downloading High-Res Image (PNG)...');
        const aImg = document.createElement('a');
        aImg.download = `${baseName}.png`;
        aImg.href = dataUrl;
        document.body.appendChild(aImg);
        aImg.click();
        document.body.removeChild(aImg);
      }

      if (fmt === 'both') {
        setExportStep('Packaging Official PDF Document...');
        await new Promise(r => setTimeout(r, 450));
      }

      if (fmt === 'pdf' || fmt === 'both') {
        setExportStep('Building Official PDF Document...');
        const nodeHeight = node.offsetHeight || 1200;
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: [840, nodeHeight]
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, 840, nodeHeight, undefined, 'FAST');
        pdf.save(`${baseName}.pdf`);
      }

      setExportStep('Done! Download complete.');
      await new Promise(r => setTimeout(r, 800));
    } catch (e) {
      console.error('[Export Error]', e);
      alert('An error occurred during export generation. Please try again.');
    } finally {
      setIsExporting(false);
      setExportFmt(null);
      setExportStep('');
    }
  }, [exportFixtures, exportScope, scopeLabel]);

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
        <div className="rounded-2xl bg-gradient-to-b from-[#10141F] to-[#0D1017] border border-[#00E676]/30 p-4 sm:p-5 space-y-4 shadow-xl shadow-[#00E676]/10 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header row of export panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Official Fixtures Export Hub</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] font-bold">
                    PDF &amp; High-Res PNG
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">Download complete tournament schedules, individual legs, or custom selected fixtures.</p>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-xs font-mono font-bold text-[#00E676] bg-[#00E676]/10 border border-[#00E676]/20 px-2.5 py-1 rounded-lg inline-block">
                {exportFixtures.length} {exportFixtures.length === 1 ? 'fixture' : 'fixtures'} queued
              </span>
            </div>
          </div>

          {/* Scope selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#00E676]" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Export Scope:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all_season', label: '🏆 All Fixtures (Full Season)', count: fixtures.length, highlight: true },
                { id: 'leg1',       label: 'Leg 1 (Weeks 1–11)',            count: leg1Count },
                { id: 'leg2',       label: 'Leg 2 (Weeks 12–22)',           count: leg2Count },
                { id: 'visible',    label: 'Filtered / Active',             count: filteredFixtures.length },
                { id: 'page',       label: 'Current Page',                  count: paginatedFixtures.length },
                { id: 'selected',   label: `Custom Selected (${selectedIds.size})`, count: selectedIds.size },
              ].map(o => {
                const isActive = exportScope === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setExportScope(o.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? o.highlight
                          ? 'bg-[#00E676]/20 border-[#00E676] text-[#00E676] shadow-sm shadow-[#00E676]/20'
                          : 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#60A5FA] shadow-sm shadow-[#3B82F6]/20'
                        : o.highlight
                          ? 'bg-[#00E676]/5 border-[#00E676]/30 text-emerald-300 hover:bg-[#00E676]/10 hover:border-[#00E676]/50'
                          : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{o.label}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${isActive ? 'bg-black/30' : 'bg-white/5'}`}>
                      {o.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {exportScope === 'selected' && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.02] border border-white/5 p-2 rounded-xl">
              <span>Click fixtures below to select.</span>
              <button onClick={selectAll} className="text-[#00E676] font-bold hover:underline cursor-pointer">Select all visible</button>
              <span>·</span>
              <button onClick={clearAll} className="hover:text-white cursor-pointer">Clear</button>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-2.5 pt-2 border-t border-white/5">
            {/* Primary Hero Button: DOWNLOAD BOTH AT ONCE */}
            <button
              onClick={() => handleExport('both')}
              disabled={isExporting || !exportFixtures.length}
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-[#00E676] via-[#10B981] to-[#3B82F6] hover:from-[#00c968] hover:to-[#2563eb] text-[#0A0D14] font-black text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#00E676]/20 hover:shadow-[#00E676]/30 transform active:scale-[0.99]"
            >
              {isExporting && exportFmt === 'both' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#0A0D14]" />
                  <span>{exportStep || 'Generating Both PDF & Image...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 fill-current text-[#0A0D14]" />
                  <span>Download Both at Once (PDF Sheet + High-Res Image)</span>
                  <span className="text-[11px] font-mono bg-black/20 text-[#0A0D14] px-2 py-0.5 rounded-full font-bold">
                    {exportFixtures.length} {exportFixtures.length === 1 ? 'Match' : 'Matches'}
                  </span>
                </>
              )}
            </button>

            {/* Secondary Specific Buttons: PDF or PNG */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting || !exportFixtures.length}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#131E33] hover:bg-[#182642] border border-[#3B82F6]/30 hover:border-[#3B82F6]/60 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting && exportFmt === 'pdf' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#3B82F6]" />
                    <span>{exportStep || 'Exporting PDF...'}</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-[#3B82F6]" />
                    <span>Download Fixture Sheet (PDF)</span>
                    <span className="text-[10px] font-mono bg-[#3B82F6]/20 text-[#60A5FA] px-1.5 py-0.5 rounded font-bold">PDF</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleExport('image')}
                disabled={isExporting || !exportFixtures.length}
                className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0F221A] hover:bg-[#142B21] border border-[#00E676]/30 hover:border-[#00E676]/60 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting && exportFmt === 'image' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#00E676]" />
                    <span>{exportStep || 'Exporting Image...'}</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-[#00E676]" />
                    <span>Share / Export as Image (PNG)</span>
                    <span className="text-[10px] font-mono bg-[#00E676]/20 text-[#00E676] px-1.5 py-0.5 rounded font-bold">PNG</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {!exportFixtures.length && (
            <p className="text-xs text-amber-400/80 text-center py-1">No fixtures match this scope. Change scope or adjust filters.</p>
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

      {/* Automated YouTube Live Broadcast Embed for Matchday */}
      {(statusFilter === 'live' || liveCount > 0) && (
        <YouTubeLiveEmbed className="mb-4" />
      )}

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
          {paginatedFixtures.map((fixture, idx) => {
            const isSelected = selectedIds.has(fixture._id);
            const selectable = exportMode && exportScope === 'selected';
            const displayIndex = (currentPage - 1) * itemsPerPage + idx + 1;
            return (
              <div key={fixture._id} className={`relative transition-all duration-150 ${selectable ? 'cursor-pointer' : ''}`}
                onClick={selectable ? () => toggleId(fixture._id) : undefined}>
                {/* index badge */}
                <div className="absolute left-2 top-2 bg-[#141720]/80 text-xs text-white rounded px-1.5 py-0.5 z-20">#{displayIndex}</div>
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

      {/* ── Pagination Controls ──────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#222735] bg-[#141720] text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                currentPage === page
                  ? 'bg-[#00E676]/15 border-[#00E676] text-[#00E676]'
                  : 'bg-[#141720] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#222735] bg-[#141720] text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Next →
          </button>

          <span className="text-[11px] text-slate-500 font-mono ml-1">
            Page {currentPage} of {totalPages} · {filteredFixtures.length} fixtures
          </span>
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
