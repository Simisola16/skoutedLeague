import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Users,
  UserPlus,
  Sparkles,
  Check,
  AlertCircle,
  AlertTriangle,
  Upload,
  Star,
  X,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Trophy,
  Flame,
  Zap,
  Footprints,
  KeyRound,
  Lock,
  LogOut,
  RefreshCw,
  ChevronRight,
  Activity,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Shirt,
  Search,
  Filter,
  Palette,
  Send,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import PlayerDetailModal from './PlayerDetailModal';
import PlayerFormModal from './PlayerFormModal';

// Tactical formation coordinate presets (percentage values for pitch x, y)
const FORMATION_PRESETS = {
  '4-3-3': [
    { pos: 'GK', label: 'Goalkeeper', gridX: 50, gridY: 10 },
    { pos: 'LB', label: 'Left Back', gridX: 18, gridY: 28 },
    { pos: 'CB', label: 'Center Back (L)', gridX: 38, gridY: 25 },
    { pos: 'CB', label: 'Center Back (R)', gridX: 62, gridY: 25 },
    { pos: 'RB', label: 'Right Back', gridX: 82, gridY: 28 },
    { pos: 'CDM', label: 'Defensive Mid', gridX: 50, gridY: 46 },
    { pos: 'CM', label: 'Center Mid (L)', gridX: 32, gridY: 58 },
    { pos: 'CM', label: 'Center Mid (R)', gridX: 68, gridY: 58 },
    { pos: 'LW', label: 'Left Wing', gridX: 20, gridY: 78 },
    { pos: 'ST', label: 'Striker', gridX: 50, gridY: 86 },
    { pos: 'RW', label: 'Right Wing', gridX: 80, gridY: 78 }
  ],
  '4-4-2': [
    { pos: 'GK', label: 'Goalkeeper', gridX: 50, gridY: 10 },
    { pos: 'LB', label: 'Left Back', gridX: 18, gridY: 28 },
    { pos: 'CB', label: 'Center Back (L)', gridX: 38, gridY: 25 },
    { pos: 'CB', label: 'Center Back (R)', gridX: 62, gridY: 25 },
    { pos: 'RB', label: 'Right Back', gridX: 82, gridY: 28 },
    { pos: 'LM', label: 'Left Mid', gridX: 18, gridY: 55 },
    { pos: 'CM', label: 'Center Mid (L)', gridX: 40, gridY: 55 },
    { pos: 'CM', label: 'Center Mid (R)', gridX: 60, gridY: 55 },
    { pos: 'RM', label: 'Right Mid', gridX: 82, gridY: 55 },
    { pos: 'ST', label: 'Striker (L)', gridX: 38, gridY: 84 },
    { pos: 'ST', label: 'Striker (R)', gridX: 62, gridY: 84 }
  ],
  '4-2-3-1': [
    { pos: 'GK', label: 'Goalkeeper', gridX: 50, gridY: 10 },
    { pos: 'LB', label: 'Left Back', gridX: 18, gridY: 28 },
    { pos: 'CB', label: 'Center Back (L)', gridX: 38, gridY: 25 },
    { pos: 'CB', label: 'Center Back (R)', gridX: 62, gridY: 25 },
    { pos: 'RB', label: 'Right Back', gridX: 82, gridY: 28 },
    { pos: 'CDM', label: 'Defensive Mid (L)', gridX: 36, gridY: 46 },
    { pos: 'CDM', label: 'Defensive Mid (R)', gridX: 64, gridY: 46 },
    { pos: 'LAM', label: 'Attacking Mid (L)', gridX: 22, gridY: 68 },
    { pos: 'CAM', label: 'Central Attacking Mid', gridX: 50, gridY: 66 },
    { pos: 'RAM', label: 'Attacking Mid (R)', gridX: 78, gridY: 68 },
    { pos: 'ST', label: 'Striker', gridX: 50, gridY: 86 }
  ],
  '3-5-2': [
    { pos: 'GK', label: 'Goalkeeper', gridX: 50, gridY: 10 },
    { pos: 'CB', label: 'Center Back (L)', gridX: 25, gridY: 26 },
    { pos: 'CB', label: 'Center Back (C)', gridX: 50, gridY: 24 },
    { pos: 'CB', label: 'Center Back (R)', gridX: 75, gridY: 26 },
    { pos: 'LWB', label: 'Left Wing Back', gridX: 14, gridY: 52 },
    { pos: 'CM', label: 'Center Mid (L)', gridX: 38, gridY: 50 },
    { pos: 'CDM', label: 'Holding Mid', gridX: 50, gridY: 42 },
    { pos: 'CM', label: 'Center Mid (R)', gridX: 62, gridY: 50 },
    { pos: 'RWB', label: 'Right Wing Back', gridX: 86, gridY: 52 },
    { pos: 'ST', label: 'Striker (L)', gridX: 38, gridY: 84 },
    { pos: 'ST', label: 'Striker (R)', gridX: 62, gridY: 84 }
  ]
};

export default function TeamDashboard({
  currentUser,
  onLogout,
  onOpenPublicMatches
}) {
  // Navigation tabs: 'overview' | 'squad' | 'lineup' | 'matches' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Core Data
  const [dashboardData, setDashboardData] = useState(null);
  const [squad, setSquad] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals & Feedback
  const [feedback, setFeedback] = useState({ text: '', type: 'success' });
  const [selectedPlayerForDossier, setSelectedPlayerForDossier] = useState(null);

  // --- SQUAD STATE ---
  const [squadSearch, setSquadSearch] = useState('');
  const [squadPositionFilter, setSquadPositionFilter] = useState('All');
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [addPlayerForm, setAddPlayerForm] = useState({
    firstName: '',
    lastName: '',
    jerseyNumber: '',
    position: 'MID',
    subPosition: '',
    role: 'Squad Player',
    preferredFoot: 'Right',
    age: 18,
    dateOfBirth: ''
  });
  const [addPlayerPhoto, setAddPlayerPhoto] = useState(null);
  const [addPlayerPhotoPreview, setAddPlayerPhotoPreview] = useState('');
  const [addPlayerLoading, setAddPlayerLoading] = useState(false);

  // Quick Edit Player
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editPlayerForm, setEditPlayerForm] = useState({});
  const [editPlayerPhoto, setEditPlayerPhoto] = useState(null);
  const [editPlayerLoading, setEditPlayerLoading] = useState(false);

  // Delete Player Confirmation
  const [deletingPlayer, setDeletingPlayer] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- LINEUP STATE ---
  const [selectedFixtureId, setSelectedFixtureId] = useState('');
  const [formation, setFormation] = useState('4-3-3');
  const [startingXI, setStartingXI] = useState([]);
  const [captainId, setCaptainId] = useState('');
  const [bench, setBench] = useState([]);
  const [showLockConfirmModal, setShowLockConfirmModal] = useState(false);
  const [lineupSubmitting, setLineupSubmitting] = useState(false);

  // --- SETTINGS STATE ---
  const [profileForm, setProfileForm] = useState({
    homeGround: '',
    homeKitColor: '#00E676',
    awayKitColor: '#3B82F6',
    managerName: '',
    managerPhone: ''
  });
  const [crestFile, setCrestFile] = useState(null);
  const [crestPreview, setCrestPreview] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password change
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  // Countdown clock state
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const notify = (text, type = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback({ text: '', type: 'success' }), 4000);
  };

  // -------------------------------------------------------------
  // Load All Team Data
  // -------------------------------------------------------------
  const loadTeamData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [dashRes, squadRes, fixRes] = await Promise.all([
        api.getTeamDashboard(),
        api.getTeamRoster(),
        api.getTeamFixtures()
      ]);

      if (dashRes.success && dashRes.data) {
        setDashboardData(dashRes.data);
        const t = dashRes.data.team || {};
        setProfileForm({
          homeGround: t.homeGround || '',
          homeKitColor: t.homeKitColor || '#00E676',
          awayKitColor: t.awayKitColor || '#3B82F6',
          managerName: dashRes.data.user?.name || t.managerName || '',
          managerPhone: dashRes.data.user?.phone || t.managerPhone || ''
        });
      }

      if (squadRes.success && squadRes.data?.players) {
        const playersList = squadRes.data.players;
        setSquad(playersList);

        // Auto-assign default starting XI if not already set
        if (startingXI.length === 0 && playersList.length > 0) {
          autoFillStartingXI(playersList, formation);
        }
      }

      if (fixRes.success && fixRes.data) {
        setFixtures(fixRes.data);
        if (!selectedFixtureId && fixRes.data.length > 0) {
          const upcoming = fixRes.data.find(f => f.status !== 'FT') || fixRes.data[0];
          setSelectedFixtureId(upcoming._id);
        }
      }
    } catch (err) {
      console.error('[Load Team Data Error]:', err);
      notify('Failed to load team data: ' + err.message, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, []);

  // Update selected fixture lineup state when fixture changes
  useEffect(() => {
    if (!selectedFixtureId || fixtures.length === 0) return;
    const target = fixtures.find(f => f._id === selectedFixtureId);
    if (!target) return;

    if (target.myLineup && target.myLineup.startingXI && target.myLineup.startingXI.length === 11) {
      setFormation(target.myLineup.formation || '4-3-3');
      setStartingXI(
        target.myLineup.startingXI.map(slot => ({
          playerId: slot.player?._id || slot.player,
          position: slot.position,
          gridX: slot.gridX,
          gridY: slot.gridY,
          isCaptain: !!slot.isCaptain
        }))
      );
      const cap = target.myLineup.startingXI.find(s => s.isCaptain);
      if (cap) setCaptainId(cap.player?._id || cap.player);

      if (target.myLineup.bench) {
        setBench(
          target.myLineup.bench.map(b => ({
            playerId: b.player?._id || b.player,
            position: b.position || 'SUB'
          }))
        );
      }
    } else if (squad.length > 0 && startingXI.length === 0) {
      autoFillStartingXI(squad, formation);
    }
  }, [selectedFixtureId, fixtures]);

  // -------------------------------------------------------------
  // Auto-Fill Starting XI Helper
  // -------------------------------------------------------------
  const autoFillStartingXI = (playersList, selectedFormation = '4-3-3') => {
    const slots = FORMATION_PRESETS[selectedFormation] || FORMATION_PRESETS['4-3-3'];
    const chosen = [];
    const usedIds = new Set();

    // 1. Assign GK
    const gk = playersList.find(p => p.position === 'GK' && p.isEligible !== false);
    if (gk) {
      chosen.push({ playerId: gk._id, position: 'GK', gridX: slots[0].gridX, gridY: slots[0].gridY, isCaptain: false });
      usedIds.add(gk._id);
    }

    // 2. Assign Outfield Slots
    slots.slice(1).forEach(slot => {
      let candidate = playersList.find(p => !usedIds.has(p._id) && p.position !== 'GK' && p.isEligible !== false);
      if (!candidate) candidate = playersList.find(p => !usedIds.has(p._id) && p.isEligible !== false);
      if (candidate) {
        chosen.push({
          playerId: candidate._id,
          position: slot.pos,
          gridX: slot.gridX,
          gridY: slot.gridY,
          isCaptain: false
        });
        usedIds.add(candidate._id);
      }
    });

    // 3. Mark Captain
    if (chosen.length > 0) {
      // Prefer designated captain from squad
      const designatedCap = playersList.find(p => p.role === 'Captain' && usedIds.has(p._id));
      if (designatedCap) {
        const idx = chosen.findIndex(c => c.playerId === designatedCap._id);
        if (idx !== -1) chosen[idx].isCaptain = true;
        setCaptainId(designatedCap._id);
      } else {
        chosen[0].isCaptain = true;
        setCaptainId(chosen[0].playerId);
      }
    }

    setStartingXI(chosen);

    // 4. Fill up to 7 Bench players from remaining eligible
    const remaining = playersList.filter(p => !usedIds.has(p._id) && p.isEligible !== false).slice(0, 7);
    setBench(remaining.map(p => ({ playerId: p._id, position: p.position || 'SUB' })));
  };

  // Change formation preset
  const handleFormationChange = (newForm) => {
    setFormation(newForm);
    const slots = FORMATION_PRESETS[newForm] || FORMATION_PRESETS['4-3-3'];
    setStartingXI(prev => {
      return prev.map((slot, idx) => {
        const preset = slots[idx] || slots[slots.length - 1];
        return {
          ...slot,
          position: preset.pos,
          gridX: preset.gridX,
          gridY: preset.gridY
        };
      });
    });
  };

  // -------------------------------------------------------------
  // Add Player Handler
  // -------------------------------------------------------------
  const handleAddPlayerSubmit = async (formData, rawState) => {
    setAddPlayerLoading(true);

    try {
      const res = await api.addTeamPlayer(formData);
      if (res.success && res.data) {
        notify(`Player #${res.data.jerseyNumber} ${res.data.firstName} ${res.data.lastName} registered!`);
        setSquad(prev => [...prev, res.data].sort((a, b) => a.jerseyNumber - b.jerseyNumber));
        setShowAddPlayerModal(false);
        loadTeamData(true);
      } else {
        throw new Error(res.error || 'Failed to add player');
      }
    } finally {
      setAddPlayerLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Edit Player Handler
  // -------------------------------------------------------------
  const handleSaveEditPlayer = async (formData, rawState) => {
    if (!editingPlayer) return;
    setEditPlayerLoading(true);

    try {
      const res = await api.updateTeamPlayer(editingPlayer._id, formData, true);
      if (res.success && res.data) {
        notify('Player information successfully updated!');
        setSquad(prev => prev.map(p => p._id === editingPlayer._id ? res.data : p));
        setEditingPlayer(null);
        loadTeamData(true);
      } else {
        throw new Error(res.error || 'Failed to update player');
      }
    } finally {
      setEditPlayerLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Delete Player Handler
  // -------------------------------------------------------------
  const handleConfirmDeletePlayer = async () => {
    if (!deletingPlayer) return;
    setDeleteLoading(true);

    try {
      const res = await api.deleteTeamPlayer(deletingPlayer._id);
      if (res.success) {
        notify(`Player #${deletingPlayer.jerseyNumber} removed from roster`);
        setSquad(prev => prev.filter(p => p._id !== deletingPlayer._id));
        setStartingXI(prev => prev.filter(s => s.playerId !== deletingPlayer._id));
        setBench(prev => prev.filter(b => b.playerId !== deletingPlayer._id));
        setDeletingPlayer(null);
        loadTeamData(true);
      } else {
        notify(res.error || 'Failed to remove player', 'error');
      }
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Submit Lineup Handler
  // -------------------------------------------------------------
  const handleConfirmSubmitLineup = async () => {
    if (!selectedFixtureId) return;
    if (startingXI.length !== 11) {
      notify(`11 Starting Players required! Currently: ${startingXI.length}`, 'error');
      return;
    }
    if (!captainId) {
      notify('You must designate 1 Captain among your starting 11 players', 'error');
      return;
    }

    setLineupSubmitting(true);
    try {
      const payload = {
        fixtureId: selectedFixtureId,
        formation,
        startingXI: startingXI.map(s => ({
          ...s,
          isCaptain: s.playerId === captainId
        })),
        bench
      };

      const res = await api.submitTeamLineup(payload);
      if (res.success) {
        notify('Official Starting XI and Matchday Bench successfully locked in and submitted!');
        setShowLockConfirmModal(false);
        loadTeamData(true);
      } else {
        notify(res.error || 'Failed to submit lineup', 'error');
      }
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLineupSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Update Profile & Kit Colors
  // -------------------------------------------------------------
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);

    try {
      const formData = new FormData();
      formData.append('homeGround', profileForm.homeGround);
      formData.append('homeKitColor', profileForm.homeKitColor);
      formData.append('awayKitColor', profileForm.awayKitColor);
      formData.append('managerName', profileForm.managerName);
      formData.append('managerPhone', profileForm.managerPhone);
      if (crestFile) formData.append('crest', crestFile);

      const res = await api.updateTeamProfile(formData);
      if (res.success) {
        notify('Club identity, crest, and kit colors updated successfully!');
        setCrestFile(null);
        setCrestPreview('');
        loadTeamData(true);
      } else {
        notify(res.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  // -------------------------------------------------------------
  // Change Password Handler
  // -------------------------------------------------------------
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError('Password must be at least 6 characters long');
      return;
    }

    setPwLoading(true);
    try {
      const res = await api.changeTeamPassword(pwForm.currentPassword, pwForm.newPassword);
      if (res.success) {
        notify('Password updated! Security confirmation email sent to your inbox.');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwError(res.error || 'Failed to update password');
      }
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Filtered Squad List
  // -------------------------------------------------------------
  const filteredSquad = useMemo(() => {
    return squad.filter(player => {
      const matchesSearch =
        `${player.firstName} ${player.lastName}`.toLowerCase().includes(squadSearch.toLowerCase()) ||
        String(player.jerseyNumber).includes(squadSearch);
      const matchesPos = squadPositionFilter === 'All' || player.position === squadPositionFilter;
      return matchesSearch && matchesPos;
    });
  }, [squad, squadSearch, squadPositionFilter]);

  // Selected fixture in Lineup tab
  const currentSelectedFixture = useMemo(() => {
    return fixtures.find(f => f._id === selectedFixtureId) || (fixtures.length > 0 ? fixtures[0] : null);
  }, [fixtures, selectedFixtureId]);

  // Next match countdown math
  const nextMatch = dashboardData?.nextMatch;
  const nextMatchCountdown = useMemo(() => {
    if (!nextMatch || !nextMatch.kickoffTimestamp) return null;
    const diff = Math.max(0, nextMatch.kickoffTimestamp - now);
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return { days: d, hours: h, minutes: m, seconds: s, totalMs: diff };
  }, [nextMatch, now]);

  const team = dashboardData?.team || {};
  const user = dashboardData?.user || currentUser || {};
  const squadCapacity = Math.round((squad.length / 25) * 100);

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-100 flex flex-col font-sans pb-24 lg:pb-12 selection:bg-[#00E676] selection:text-black">
      
      {/* ========================================================= */}
      {/* 1. TOP URGENT MATCHDAY BANNER */}
      {/* ========================================================= */}
      {dashboardData?.nextMatchAlert && (
        <div className={`px-4 py-3 flex items-center justify-between gap-3 text-xs font-bold border-b transition-all ${
          dashboardData.nextMatchAlert.level === 'danger'
            ? 'bg-rose-950/80 border-rose-500/50 text-rose-200'
            : 'bg-amber-950/80 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 shrink-0 animate-pulse ${
                dashboardData.nextMatchAlert.level === 'danger' ? 'text-rose-400' : 'text-amber-400'
              }`} />
              <span className="leading-snug">{dashboardData.nextMatchAlert.message}</span>
            </div>
            <button
              onClick={() => setActiveTab('lineup')}
              className={`shrink-0 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-transform hover:scale-105 ${
                dashboardData.nextMatchAlert.level === 'danger'
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/50'
                  : 'bg-amber-400 text-black shadow-lg shadow-amber-900/50'
              }`}
            >
              Lock In Lineup Now
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. DASHBOARD HEADER & CLUB IDENTITY */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-30 bg-[#0E1118]/95 backdrop-blur-md border-b border-[#232838] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Club Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#141824] border border-[#2A3146] p-1 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <Shield className="w-6 h-6 text-[#00E676]" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-black text-white text-base sm:text-lg tracking-tight truncate">
                  {team.name || 'Team Academy'}
                </h1>
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                  {team.shortCode || 'CLUB'}
                </span>
                {team.group && (
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                    • {team.group}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="text-slate-300 font-semibold">{user.name || 'Manager'}</span>
                <span>•</span>
                <span className="text-[11px] text-[#00E676] font-mono">Team Manager Clearance Active</span>
              </div>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadTeamData(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              title="Refresh Dashboard Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#00E676]' : ''}`} />
            </button>

            {onOpenPublicMatches && (
              <button
                onClick={onOpenPublicMatches}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-colors"
              >
                <Activity className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Live Matches</span>
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                title="Sign Out of Club Account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>

        </div>

        {/* Desktop Tab Switcher */}
        <div className="max-w-7xl mx-auto hidden lg:flex items-center gap-1 mt-3 pt-3 border-t border-white/5">
          {[
            { id: 'overview', label: 'Overview', icon: Trophy },
            { id: 'squad', label: `Squad Roster (${squad.length}/25)`, icon: Users },
            { id: 'lineup', label: 'Matchday Lineup', icon: Shirt },
            { id: 'matches', label: 'Fixtures & Results', icon: Calendar },
            { id: 'settings', label: 'Club Identity & Settings', icon: Palette }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00E676] text-black shadow-md shadow-[#00E676]/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Floating Feedback Banner */}
      {feedback.text && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 border ${
            feedback.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-500'
              : 'bg-emerald-950 text-emerald-200 border-emerald-500'
          }`}>
            {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            <span>{feedback.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-[#00E676] mx-auto opacity-70" />
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
              Loading Team Manager Command Center...
            </p>
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* VIEW 1: OVERVIEW & NEXT MATCH HUB */}
            {/* ========================================================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Next Match Hero Card */}
                {nextMatch ? (
                  <div className="relative rounded-3xl overflow-hidden border border-[#232838] bg-gradient-to-br from-[#121622] via-[#0E121B] to-[#0A0D14] p-6 sm:p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E676]/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                      
                      {/* Left: Match Info & Opponent */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                            NEXT OFFICIAL FIXTURE
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {nextMatch.round || 'Tournament Stage'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-center sm:text-left">
                            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                              Opponent
                            </div>
                            <div className="text-xl sm:text-2xl font-display font-black text-white mt-0.5 flex items-center gap-2">
                              <span>{nextMatch.opponent?.name || 'Upcoming Opponent'}</span>
                              <span className="text-xs font-mono text-[#00E676]">
                                ({nextMatch.opponent?.shortCode || 'FC'})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{nextMatch.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{nextMatch.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span>📍 {nextMatch.venue || 'National Stadium Pitch'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Countdown Clock & Lineup Submission Status */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-white/5">
                        
                        {/* Countdown to Kickoff */}
                        {nextMatchCountdown && (
                          <div className="space-y-1 text-left lg:text-right">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                              Countdown to Kickoff
                            </div>
                            <div className="flex items-center gap-2 font-mono">
                              <div className="bg-[#171B26] border border-white/10 px-2.5 py-1.5 rounded-xl text-center min-w-[46px]">
                                <div className="text-lg font-black text-white">{String(nextMatchCountdown.days).padStart(2, '0')}</div>
                                <div className="text-[9px] text-slate-500 uppercase">Days</div>
                              </div>
                              <span className="text-slate-600 font-bold">:</span>
                              <div className="bg-[#171B26] border border-white/10 px-2.5 py-1.5 rounded-xl text-center min-w-[46px]">
                                <div className="text-lg font-black text-white">{String(nextMatchCountdown.hours).padStart(2, '0')}</div>
                                <div className="text-[9px] text-slate-500 uppercase">Hours</div>
                              </div>
                              <span className="text-slate-600 font-bold">:</span>
                              <div className="bg-[#171B26] border border-white/10 px-2.5 py-1.5 rounded-xl text-center min-w-[46px]">
                                <div className="text-lg font-black text-white">{String(nextMatchCountdown.minutes).padStart(2, '0')}</div>
                                <div className="text-[9px] text-slate-500 uppercase">Mins</div>
                              </div>
                              <span className="text-slate-600 font-bold">:</span>
                              <div className="bg-[#171B26] border border-white/10 px-2.5 py-1.5 rounded-xl text-center min-w-[46px]">
                                <div className="text-lg font-black text-[#00E676]">{String(nextMatchCountdown.seconds).padStart(2, '0')}</div>
                                <div className="text-[9px] text-slate-500 uppercase">Secs</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Status Chip & CTA */}
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold border ${
                            nextMatch.isLineupSubmitted
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : nextMatch.lineupStatus === 'Late / Unsubmitted'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          }`}>
                            {nextMatch.isLineupSubmitted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                            <span>Lineup: {nextMatch.lineupStatus}</span>
                          </span>

                          <button
                            onClick={() => {
                              setSelectedFixtureId(nextMatch._id);
                              setActiveTab('lineup');
                            }}
                            className="btn-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-[#00E676]/20 flex items-center gap-1.5"
                          >
                            <span>{nextMatch.isLineupSubmitted ? 'Review Starting XI' : 'Prepare Lineup'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                ) : (
                  <div className="p-8 rounded-3xl bg-[#121622] border border-[#232838] text-center space-y-3">
                    <Trophy className="w-10 h-10 text-slate-500 mx-auto opacity-40" />
                    <h3 className="font-display font-black text-white text-base">No Active Upcoming Matches</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Tournament fixtures are being scheduled by the league committee. Check back soon for your matchday notifications.
                    </p>
                  </div>
                )}

                {/* Grid: Squad Capacity & League Snapshot */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Squad Capacity Card */}
                  <div className="rounded-3xl bg-[#121622] border border-[#232838] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#00E676]" />
                        <h4 className="font-extrabold text-sm text-white">Squad Roster</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00E676]">
                        {squad.length} / 25
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="w-full h-2.5 rounded-full bg-[#1A1F2E] overflow-hidden border border-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            squadCapacity >= 100 ? 'bg-amber-400' : 'bg-[#00E676]'
                          }`}
                          style={{ width: `${Math.min(100, squadCapacity)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{25 - squad.length} slots remaining</span>
                        <span>{squadCapacity}% Filled</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('squad');
                        setShowAddPlayerModal(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>Register New Player</span>
                    </button>
                  </div>

                  {/* League Standing Summary */}
                  <div className="rounded-3xl bg-[#121622] border border-[#232838] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <h4 className="font-extrabold text-sm text-white">Tournament Record</h4>
                      </div>
                      <span className="text-xs font-mono font-black text-amber-400">
                        {team.stats?.points || 0} PTS
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-[#090B10] border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">P</div>
                        <div className="text-sm font-mono font-black text-white">{team.stats?.played || 0}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#090B10] border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">W</div>
                        <div className="text-sm font-mono font-black text-emerald-400">{team.stats?.won || 0}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#090B10] border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">D</div>
                        <div className="text-sm font-mono font-black text-slate-300">{team.stats?.drawn || 0}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#090B10] border border-white/5">
                        <div className="text-[10px] text-slate-500 uppercase font-bold">L</div>
                        <div className="text-sm font-mono font-black text-rose-400">{team.stats?.lost || 0}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>GD: {(team.stats?.goalDifference || 0) > 0 ? `+${team.stats?.goalDifference}` : team.stats?.goalDifference || 0}</span>
                      <span>Goals: {team.stats?.goalsFor || 0}F / {team.stats?.goalsAgainst || 0}A</span>
                    </div>
                  </div>

                  {/* Club Colors & Ground */}
                  <div className="rounded-3xl bg-[#121622] border border-[#232838] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-blue-400" />
                        <h4 className="font-extrabold text-sm text-white">Kit & Ground</h4>
                      </div>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="text-[11px] text-[#00E676] hover:underline font-mono"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#090B10] border border-white/5">
                        <span className="text-slate-400">Home Kit Color</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: team.homeKitColor || '#00E676' }}></span>
                          <span className="text-white uppercase">{team.homeKitColor || '#00E676'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#090B10] border border-white/5">
                        <span className="text-slate-400">Away Kit Color</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: team.awayKitColor || '#3B82F6' }}></span>
                          <span className="text-white uppercase">{team.awayKitColor || '#3B82F6'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate">
                      📍 {team.homeGround || 'National Stadium Pitch'}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 2: SQUAD MANAGEMENT (ROSTER) */}
            {/* ========================================================= */}
            {activeTab === 'squad' && (
              <div className="space-y-5">
                
                {/* Squad Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121622] border border-[#232838] p-4 rounded-3xl">
                  
                  {/* Search and Position Filter */}
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search player or #number..."
                        value={squadSearch}
                        onChange={(e) => setSquadSearch(e.target.value)}
                        className="w-full bg-[#090B10] border border-[#232838] rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676]"
                      />
                    </div>

                    <div className="flex items-center gap-1 bg-[#090B10] p-1 rounded-2xl border border-[#232838]">
                      {['All', 'GK', 'DEF', 'MID', 'FWD'].map(pos => (
                        <button
                          key={pos}
                          onClick={() => setSquadPositionFilter(pos)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            squadPositionFilter === pos
                              ? 'bg-[#00E676] text-black font-black'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Register New Player Button */}
                  <button
                    onClick={() => setShowAddPlayerModal(true)}
                    disabled={squad.length >= 25}
                    className="btn-primary px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register Player ({squad.length}/25)</span>
                  </button>
                </div>

                {/* Roster Cards List */}
                {filteredSquad.length === 0 ? (
                  <div className="py-20 text-center rounded-3xl bg-[#121622] border border-[#232838] space-y-3">
                    <Users className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-white">No players found</h4>
                    <p className="text-xs text-slate-400">
                      {squad.length === 0 ? 'Your squad roster is empty. Register your players to prepare for matchday.' : 'No players match your search filter.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredSquad.map(player => {
                      const isEligible = player.status === 'Eligible' && player.isEligible !== false;
                      const role = player.role || 'Squad Player';

                      return (
                        <div
                          key={player._id}
                          className="rounded-2xl bg-[#121622] hover:bg-[#161B2A] border border-[#232838] hover:border-[#00E676]/40 p-4 transition-all duration-200 flex flex-col justify-between gap-3 group relative"
                        >
                          <div className="flex items-start justify-between gap-3">
                            
                            {/* Photo & Number */}
                            <div className="relative shrink-0">
                              <div className="w-14 h-14 rounded-2xl bg-[#171B26] border border-white/10 p-0.5 overflow-hidden flex items-center justify-center">
                                {player.photo ? (
                                  <img src={player.photo} alt={player.firstName} className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                  <span className="font-mono font-black text-sm text-[#00E676]">#{player.jerseyNumber}</span>
                                )}
                              </div>
                              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-[#00E676] text-black font-mono font-black text-[11px] flex items-center justify-center shadow">
                                #{player.jerseyNumber}
                              </span>
                            </div>

                            {/* Name, Position, Role */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {role === 'Captain' && (
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-black uppercase">
                                    👑 Captain
                                  </span>
                                )}
                                {role === 'Vice Captain' && (
                                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-cyan-400 text-black uppercase">
                                    VC
                                  </span>
                                )}
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border font-mono ${
                                  player.position === 'GK'
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    : player.position === 'DEF'
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                    : player.position === 'MID'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                }`}>
                                  {player.position}
                                </span>
                              </div>

                              <h4
                                onClick={() => setSelectedPlayerForDossier(player)}
                                className="font-extrabold text-sm text-white truncate mt-1 group-hover:text-[#00E676] transition-colors cursor-pointer"
                                title="Click to view full player details"
                              >
                                {player.firstName} {player.lastName}
                              </h4>

                              <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                <span>Age: {player.age || 18}</span>
                                <span>•</span>
                                <span>{player.preferredFoot || 'Right'} Foot</span>
                              </div>
                            </div>

                            {/* Status Chip */}
                            <span className={`shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                              isEligible
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                              {isEligible ? 'Eligible' : 'Suspended'}
                            </span>
                          </div>

                          {/* Action Row */}
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                            <button
                              onClick={() => setSelectedPlayerForDossier(player)}
                              className="text-[11px] font-bold text-slate-400 hover:text-[#00E676] flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Dossier</span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingPlayer(player);
                                  setEditPlayerForm({
                                    firstName: player.firstName || '',
                                    lastName: player.lastName || '',
                                    jerseyNumber: player.jerseyNumber || '',
                                    position: player.position || 'MID',
                                    subPosition: player.subPosition || '',
                                    role: player.role || 'Squad Player',
                                    preferredFoot: player.preferredFoot || 'Right',
                                    age: player.age || 18,
                                    dateOfBirth: player.dateOfBirth || ''
                                  });
                                }}
                                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                                title="Edit Player Information"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setDeletingPlayer(player)}
                                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                                title="Remove from Roster"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 3: MATCHDAY LINEUP SUBMISSION (INTERACTIVE PITCH) */}
            {/* ========================================================= */}
            {activeTab === 'lineup' && (
              <div className="space-y-6">
                
                {/* Match Selector & Lineup Meta */}
                <div className="bg-[#121622] border border-[#232838] p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Select Upcoming Fixture */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Select Match to Prepare Lineup
                    </label>
                    <select
                      value={selectedFixtureId}
                      onChange={(e) => setSelectedFixtureId(e.target.value)}
                      className="bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#00E676]"
                    >
                      {fixtures.length === 0 ? (
                        <option value="">No scheduled fixtures available</option>
                      ) : (
                        fixtures.map(f => (
                          <option key={f._id} value={f._id}>
                            {f.date} ({f.time}) vs {f.opponent?.name || 'Opponent'} • {f.lineupStatus}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Formation Selector */}
                  <div className="flex items-center gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Tactical Formation
                      </label>
                      <div className="flex rounded-xl bg-[#090B10] p-1 border border-[#232838]">
                        {Object.keys(FORMATION_PRESETS).map(f => (
                          <button
                            key={f}
                            onClick={() => handleFormationChange(f)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              formation === f ? 'bg-[#00E676] text-black font-black' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => autoFillStartingXI(squad, formation)}
                      className="mt-5 px-3 py-2 rounded-xl bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Auto-pick 11 starters and bench"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Fill XI</span>
                    </button>
                  </div>

                </div>

                {/* Tactical Pitch + Selection Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: 2D Tactical Pitch Diagram */}
                  <div className="lg:col-span-7 bg-[#121622] border border-[#232838] rounded-3xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shirt className="w-4 h-4 text-[#00E676]" />
                        <h4 className="font-extrabold text-sm text-white">Starting XI Pitch Layout ({formation})</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00E676]">
                        {startingXI.length} / 11 Starters Selected
                      </span>
                    </div>

                    {/* 2D Grass Pitch Box */}
                    <div className="football-pitch w-full h-[440px] relative rounded-2xl overflow-hidden select-none border-2 border-white/20 shadow-2xl">
                      <div className="absolute inset-0 pitch-stripes pointer-events-none opacity-50"></div>
                      <div className="absolute inset-2 border border-white/40 rounded-sm pointer-events-none"></div>
                      <div className="absolute top-1/2 left-2 right-2 h-0 border-t border-white/40 -translate-y-1/2 pointer-events-none"></div>
                      <div className="absolute top-1/2 left-1/2 w-24 h-24 border border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-20 border-b border-l border-r border-white/40 pointer-events-none"></div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-48 h-20 border-t border-l border-r border-white/40 pointer-events-none"></div>

                      {/* Render Starting XI slots on pitch */}
                      {startingXI.map((slot, index) => {
                        const playerObj = squad.find(p => p._id === slot.playerId);
                        const isCap = slot.playerId === captainId;

                        return (
                          <div
                            key={index}
                            onClick={() => {
                              // Designate captain on tap
                              setCaptainId(slot.playerId);
                            }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center group transition-transform duration-200 hover:scale-110 z-10"
                            style={{
                              left: `${slot.gridX}%`,
                              top: `${slot.gridY}%`
                            }}
                            title="Click to set as Captain"
                          >
                            <div
                              className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs shadow-xl relative"
                              style={{
                                backgroundColor: slot.position === 'GK' ? '#FFB800' : (team.homeKitColor || '#00E676'),
                                color: slot.position === 'GK' ? '#000000' : '#07120B'
                              }}
                            >
                              {playerObj?.jerseyNumber || slot.position}
                              {isCap && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#FFB800] text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black shadow">
                                  C
                                </span>
                              )}
                            </div>

                            <div className="mt-1 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-sm border border-white/20 text-[10px] font-semibold text-white tracking-tight whitespace-nowrap shadow max-w-[85px] truncate text-center">
                              {playerObj ? playerObj.lastName || playerObj.firstName : slot.position}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-[11px] text-slate-400 text-center font-mono">
                      💡 Tip: Click any player on the pitch to designate them as Captain 👑 (C).
                    </div>
                  </div>

                  {/* Right Column: Starters Checklist, Bench, and Lock-In Button */}
                  <div className="lg:col-span-5 space-y-4">
                    
                    {/* Starters List */}
                    <div className="bg-[#121622] border border-[#232838] rounded-3xl p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <h4 className="font-extrabold text-sm text-white">Starting 11 Players</h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {startingXI.length}/11 Selected
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {startingXI.map((slot, idx) => {
                          const player = squad.find(p => p._id === slot.playerId);
                          const isCap = slot.playerId === captainId;

                          return (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-[#090B10] border border-white/5 flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-5 font-mono font-black text-center text-[#00E676]">
                                  #{player?.jerseyNumber || '?'}
                                </span>
                                <span className="text-white font-semibold truncate">
                                  {player?.firstName} {player?.lastName}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">({slot.position})</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => setCaptainId(slot.playerId)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-black transition-colors ${
                                  isCap
                                    ? 'bg-[#FFB800] text-black shadow'
                                    : 'bg-white/5 text-slate-400 hover:text-white'
                                }`}
                              >
                                {isCap ? '👑 CAPTAIN' : 'SET (C)'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Substitutes / Bench List (up to 7) */}
                    <div className="bg-[#121622] border border-[#232838] rounded-3xl p-5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/5">
                        <h4 className="font-extrabold text-sm text-white">Matchday Substitutes / Bench</h4>
                        <span className="text-[11px] font-mono text-slate-400">
                          {bench.length}/7 Max
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {squad
                          .filter(p => !startingXI.some(s => s.playerId === p._id) && p.isEligible !== false)
                          .map(player => {
                            const isBenchSelected = bench.some(b => b.playerId === player._id);

                            return (
                              <button
                                key={player._id}
                                type="button"
                                onClick={() => {
                                  if (isBenchSelected) {
                                    setBench(prev => prev.filter(b => b.playerId !== player._id));
                                  } else {
                                    if (bench.length >= 7) {
                                      notify('Maximum 7 substitutes allowed on bench', 'error');
                                      return;
                                    }
                                    setBench(prev => [...prev, { playerId: player._id, position: player.position }]);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                                  isBenchSelected
                                    ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/40 shadow-sm'
                                    : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
                                }`}
                              >
                                <span>#{player.jerseyNumber}</span>
                                <span>{player.lastName || player.firstName}</span>
                                {isBenchSelected && <Check className="w-3 h-3 text-[#00E676]" />}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Lock In Lineup CTA Button */}
                    <button
                      onClick={() => setShowLockConfirmModal(true)}
                      disabled={startingXI.length !== 11 || !captainId}
                      className="w-full btn-primary py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-[#00E676]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Lock In & Submit Official Lineup</span>
                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 4: FIXTURES & RESULTS HUB */}
            {/* ========================================================= */}
            {activeTab === 'matches' && (
              <div className="space-y-6">
                
                {fixtures.length === 0 ? (
                  <div className="py-20 text-center rounded-3xl bg-[#121622] border border-[#232838] space-y-3">
                    <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
                    <h4 className="text-sm font-bold text-white">No matches scheduled yet</h4>
                    <p className="text-xs text-slate-400">
                      Match fixtures and pitch assignments will appear here once published by tournament officials.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fixtures.map(fix => {
                      const isPast = fix.status === 'FT';
                      const isLive = ['1ST HALF', 'HT', '2ND HALF', 'PENS'].includes(fix.status);
                      const myScore = fix.isHome ? fix.score?.home : fix.score?.away;
                      const oppScore = fix.isHome ? fix.score?.away : fix.score?.home;

                      let matchResult = null;
                      if (isPast && myScore !== undefined && oppScore !== undefined) {
                        if (myScore > oppScore) matchResult = { label: 'WIN', color: 'bg-emerald-500 text-black' };
                        else if (myScore < oppScore) matchResult = { label: 'LOSS', color: 'bg-rose-500 text-white' };
                        else matchResult = { label: 'DRAW', color: 'bg-slate-400 text-black' };
                      }

                      return (
                        <div
                          key={fix._id}
                          className="rounded-3xl bg-[#121622] border border-[#232838] p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Left: Opponent & Venue */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {matchResult && (
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded font-mono ${matchResult.color}`}>
                                  {matchResult.label}
                                </span>
                              )}
                              {isLive && (
                                <span className="bg-[#FF4B4B] text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse font-mono">
                                  LIVE {fix.minute ? `${fix.minute}'` : ''}
                                </span>
                              )}
                              <span className="text-xs font-mono text-slate-400">
                                {fix.round || 'Tournament Match'} • {fix.isHome ? 'HOME' : 'AWAY'}
                              </span>
                            </div>

                            <div className="text-lg font-display font-black text-white flex items-center gap-2">
                              <span>vs {fix.opponent?.name || 'Opponent'}</span>
                              <span className="text-xs font-mono text-[#00E676]">
                                ({fix.opponent?.shortCode || 'FC'})
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                              <span>📅 {fix.date}</span>
                              <span>⏱ {fix.time}</span>
                              <span>📍 {fix.venue || 'Pitch 1'}</span>
                            </div>
                          </div>

                          {/* Center: Score or Lineup Status */}
                          <div className="text-left md:text-right space-y-1">
                            {isPast ? (
                              <div>
                                <div className="text-2xl font-mono font-black text-white">
                                  {fix.score?.home} - {fix.score?.away}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">Full Time</div>
                              </div>
                            ) : (
                              <div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                                  fix.isLocked
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                }`}>
                                  {fix.isLocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                  <span>{fix.lineupStatus}</span>
                                </span>
                              </div>
                            )}

                            {!isPast && !fix.isLocked && (
                              <button
                                onClick={() => {
                                  setSelectedFixtureId(fix._id);
                                  setActiveTab('lineup');
                                }}
                                className="text-xs text-[#00E676] hover:underline font-bold mt-1 block"
                              >
                                Submit Starting XI →
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 5: CLUB IDENTITY & PROFILE SETTINGS */}
            {/* ========================================================= */}
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Card: Team Profile, Crest, Kit Colors */}
                <div className="bg-[#121622] border border-[#232838] rounded-3xl p-6 space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                    <Palette className="w-4 h-4 text-[#00E676]" />
                    <h4 className="font-extrabold text-sm text-white">Club Visual Identity & Kit Colors</h4>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    
                    {/* Crest Upload */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Official Team Crest / Logo
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-[#090B10] border border-white/10 p-1 flex items-center justify-center shrink-0">
                          {crestPreview || team.logo ? (
                            <img src={crestPreview || team.logo} alt="Crest" className="w-full h-full object-contain rounded-xl" />
                          ) : (
                            <Shield className="w-8 h-8 text-slate-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setCrestFile(file);
                                setCrestPreview(URL.createObjectURL(file));
                              }
                            }}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">Uploaded directly to Cloudinary media storage.</p>
                        </div>
                      </div>
                    </div>

                    {/* Kit Color Pickers */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Home Kit Color</label>
                        <div className="flex items-center gap-2 bg-[#090B10] border border-[#232838] rounded-xl p-2">
                          <input
                            type="color"
                            value={profileForm.homeKitColor}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, homeKitColor: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-xs text-white uppercase">{profileForm.homeKitColor}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Away Kit Color</label>
                        <div className="flex items-center gap-2 bg-[#090B10] border border-[#232838] rounded-xl p-2">
                          <input
                            type="color"
                            value={profileForm.awayKitColor}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, awayKitColor: e.target.value }))}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                          />
                          <span className="font-mono text-xs text-white uppercase">{profileForm.awayKitColor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Home Ground */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Home Ground / Pitch</label>
                      <input
                        type="text"
                        value={profileForm.homeGround}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, homeGround: e.target.value }))}
                        className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                      />
                    </div>

                    {/* Manager Contacts */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Manager Contact Name</label>
                        <input
                          type="text"
                          value={profileForm.managerName}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, managerName: e.target.value }))}
                          className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Manager Phone</label>
                        <input
                          type="tel"
                          value={profileForm.managerPhone}
                          onChange={(e) => setProfileForm(prev => ({ ...prev, managerPhone: e.target.value }))}
                          className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E676]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#00E676]/20 cursor-pointer disabled:opacity-50"
                    >
                      {profileSaving ? 'Saving Updates...' : 'Save Club Settings'}
                    </button>
                  </form>
                </div>

                {/* Right Card: Security & Password Reset */}
                <div className="bg-[#121622] border border-[#232838] rounded-3xl p-6 space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                    <KeyRound className="w-4 h-4 text-[#00E676]" />
                    <h4 className="font-extrabold text-sm text-white">Manager Security & Password</h4>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {pwError && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{pwError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={pwForm.currentPassword}
                        onChange={(e) => setPwForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">New Password (Min. 6 chars)</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={pwForm.newPassword}
                        onChange={(e) => setPwForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={pwForm.confirmPassword}
                        onChange={(e) => setPwForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                      />
                    </div>

                    <p className="text-[11px] text-slate-500">
                      An official confirmation email will be dispatched via Resend SDK upon password update.
                    </p>

                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {pwLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                </div>

              </div>
            )}

          </>
        )}

      </main>

      {/* ========================================================= */}
      {/* 3. MOBILE BOTTOM NAVIGATION (4 TABS) */}
      {/* ========================================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E1118]/95 backdrop-blur-md border-t border-[#232838] px-2 py-2 flex items-center justify-around">
        {[
          { id: 'overview', label: 'Overview', icon: Trophy },
          { id: 'squad', label: 'Squad', icon: Users },
          { id: 'lineup', label: 'Lineup', icon: Shirt },
          { id: 'matches', label: 'Matches', icon: Calendar },
          { id: 'settings', label: 'Settings', icon: Palette }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-[#00E676]' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ========================================================= */}
      {/* MODAL 1: ADD SQUAD PLAYER MODAL */}
      {/* ========================================================= */}
      <PlayerFormModal
        isOpen={showAddPlayerModal}
        mode="add"
        team={team}
        existingSquad={squad}
        onClose={() => setShowAddPlayerModal(false)}
        onSubmit={handleAddPlayerSubmit}
        isSubmitting={addPlayerLoading}
      />

      {/* ========================================================= */}
      {/* MODAL 2: QUICK EDIT PLAYER MODAL */}
      {/* ========================================================= */}
      <PlayerFormModal
        isOpen={Boolean(editingPlayer)}
        mode="edit"
        player={editingPlayer}
        team={team}
        existingSquad={squad}
        onClose={() => setEditingPlayer(null)}
        onSubmit={handleSaveEditPlayer}
        isSubmitting={editPlayerLoading}
      />

      {/* ========================================================= */}
      {/* MODAL 3: DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {deletingPlayer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#232838] w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-white">Remove Player from Roster?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove <strong className="text-white">#{deletingPlayer.jerseyNumber} {deletingPlayer.firstName} {deletingPlayer.lastName}</strong>? This action cannot be undone before tournament accreditation locks.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPlayer(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePlayer}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40"
              >
                {deleteLoading ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: LOCK-IN LINEUP CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {showLockConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#232838] w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Lock In Official Matchday Lineup</h4>
                <p className="text-xs text-slate-400">Confirmation for Referee & Match Commissioner</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#090B10] border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Formation:</span>
                <span className="text-[#00E676] font-bold">{formation}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Starting XI:</span>
                <span className="text-white font-bold">11 Players</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Designated Captain:</span>
                <span className="text-amber-400 font-bold">
                  {(() => {
                    const c = squad.find(p => p._id === captainId);
                    return c ? `#${c.jerseyNumber} ${c.firstName} ${c.lastName}` : 'Selected';
                  })()}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Matchday Bench:</span>
                <span className="text-slate-300 font-bold">{bench.length} Substitutes</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Once submitted, this lineup is officially locked into the referee's match sheet and synchronized across live scoreboards.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLockConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmitLineup}
                disabled={lineupSubmitting}
                className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
              >
                {lineupSubmitting ? 'Locking In...' : 'Confirm & Lock In'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: PLAYER FULL DETAILS DOSSIER */}
      {/* ========================================================= */}
      {selectedPlayerForDossier && (
        <PlayerDetailModal
          player={selectedPlayerForDossier}
          team={team}
          onClose={() => setSelectedPlayerForDossier(null)}
        />
      )}

    </div>
  );
}
