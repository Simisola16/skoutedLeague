import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Sparkles,
  Wand2,
  Zap,
  CalendarDays,
  Settings2,
  Layers,
  Lock,
  Radio,
  Calendar,
  Users,
  Trophy,
  ArrowRight,
  LogOut,
  Plus,
  Minus,
  AlertTriangle,
  Check,
  Flame,
  Clock,
  Trash2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Edit2,
  Printer,
  Mail,
  UserCheck,
  UserX,
  X,
  User,
  CheckCircle2,
  XCircle,
  Send,
  FileText,
  ArrowRightLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import socket from '../services/socket';
import PlayerDetailModal from './PlayerDetailModal';
import PlayerFormModal from './PlayerFormModal';

export default function AdminPortal({ onExit }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Admin View Tab
  const [adminTab, setAdminTab] = useState('operator'); // 'operator' | 'fixtures' | 'teams' | 'transfer' | 'system'

  // League Settings & Transfer Window State
  const [leagueSettings, setLeagueSettings] = useState(null);
  const [settingsUpdating, setSettingsUpdating] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [transferWindowClosingDate, setTransferWindowClosingDate] = useState('');

  // Data
  const [fixtures, setFixtures] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedFixtureId, setSelectedFixtureId] = useState('');

  // Admin Teams & Squad Explorer State
  const [adminTeams, setAdminTeams] = useState([]);
  const [adminTeamsLoading, setAdminTeamsLoading] = useState(false);
  const [teamSearch, setTeamSearch] = useState('');
  const [teamGroupFilter, setTeamGroupFilter] = useState('All');
  const [teamStatusFilter, setTeamStatusFilter] = useState('All'); // 'All' | 'pending' | 'approved' | 'rejected'
  const [verifyingTeamId, setVerifyingTeamId] = useState('');
  const [teamVerificationToast, setTeamVerificationToast] = useState(null);
  const [rejectingTeam, setRejectingTeam] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // Roster Inspector State
  const [selectedTeamForRoster, setSelectedTeamForRoster] = useState(null);
  const [selectedTeamRoster, setSelectedTeamRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterPositionFilter, setRosterPositionFilter] = useState('All');
  const [rosterStatusFilter, setRosterStatusFilter] = useState('All');

  // Player Quick Edit & Add State
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showAdminAddPlayerModal, setShowAdminAddPlayerModal] = useState(false);
  const [editPlayerForm, setEditPlayerForm] = useState({
    firstName: '',
    lastName: '',
    jerseyNumber: '',
    position: 'MID',
    role: 'Squad Player',
    status: 'Eligible',
    isEligible: true,
    suspensionReason: '',
    age: 18
  });
  const [editPlayerLoading, setEditPlayerLoading] = useState(false);
  const [editPlayerErr, setEditPlayerErr] = useState('');
  const [editPlayerSuccess, setEditPlayerSuccess] = useState('');

  // Lineup Oversight State
  const [inspectingFixtureLineups, setInspectingFixtureLineups] = useState(null);
  const [lineupReminderStatus, setLineupReminderStatus] = useState({}); // { [fixtureId]: { loading: boolean, msg: string, err: string } }

  // Printable Match Sheet State
  const [printableSheetTeam, setPrintableSheetTeam] = useState(null);

  // Player Full Details Dossier State
  const [selectedPlayerForDetails, setSelectedPlayerForDetails] = useState(null);

  // Operator Match Control State
  const [activeFixture, setActiveFixture] = useState(null);
  const [fixtureEvents, setFixtureEvents] = useState([]);
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);

  // Event logging
  const [eventType, setEventType] = useState('GOAL');
  const [eventTeamId, setEventTeamId] = useState('');
  const [eventPlayerId, setEventPlayerId] = useState('');
  const [assistPlayerId, setAssistPlayerId] = useState('');
  const [eventMinute, setEventMinute] = useState(0);
  const [eventDescription, setEventDescription] = useState('');
  const [eventLoading, setEventLoading] = useState(false);
  const [eventSuccessMsg, setEventSuccessMsg] = useState('');

  // Fixture creation
  const [stage, setStage] = useState('Matchday 1');
  const [matchday, setMatchday] = useState(1);
  const [leg, setLeg] = useState(1);
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchTime, setMatchTime] = useState('16:00');
  const [venue, setVenue] = useState('Lekan Salami Stadium, Adamasingba, Ibadan');
  const [createFixtureLoading, setCreateFixtureLoading] = useState(false);
  const [createFixtureMsg, setCreateFixtureMsg] = useState('');
  const [createFixtureErr, setCreateFixtureErr] = useState('');

  // Automated Tournament Scheduling Engine State
  const [showAutoScheduleModal, setShowAutoScheduleModal] = useState(false);
  const [autoScheduleMode, setAutoScheduleMode] = useState('LEAGUE_22'); // 'LEAGUE_22' | 'ALL_IN_ONE' | 'BY_GROUPS' | 'KNOCKOUT'
  const [autoScheduleLegs, setAutoScheduleLegs] = useState('2_LEGS'); // '2_LEGS' (Home & Away) | '1_LEG' (Single Leg Neutral)
  const [autoScheduleStartDate, setAutoScheduleStartDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [autoScheduleDaysBetween, setAutoScheduleDaysBetween] = useState(7);
  const [autoScheduleTimeSlots, setAutoScheduleTimeSlots] = useState(['10:00', '13:00', '15:30', '18:00']);
  const [autoScheduleVenues, setAutoScheduleVenues] = useState(['Lekan Salami Stadium, Adamasingba, Ibadan', 'Legacy Arena Pitch 1']);
  const [autoScheduleClearExisting, setAutoScheduleClearExisting] = useState(true);
  const [autoScheduleNotifyManagers, setAutoScheduleNotifyManagers] = useState(false);
  const [autoScheduleLoading, setAutoScheduleLoading] = useState(false);
  const [autoScheduleSuccessMsg, setAutoScheduleSuccessMsg] = useState('');
  const [autoScheduleErrMsg, setAutoScheduleErrMsg] = useState('');

  // Recalculate message
  const [syncMsg, setSyncMsg] = useState('');

  // 1. Check existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('skouted_token');
    if (token) {
      api.getMe()
        .then(res => {
          if (res.success && res.data?.role === 'admin') {
            setAdminUser(res.data);
          } else {
            // Not an admin
            setAdminUser(null);
          }
        })
        .catch(() => setAdminUser(null))
        .finally(() => setLoadingAuth(false));
    } else {
      setLoadingAuth(false);
    }
  }, []);

  // 2. Fetch fixtures, teams, and admin team directory when authenticated
  const loadAdminData = async () => {
    try {
      const [fixRes, teamRes, adminTeamRes, settingsRes] = await Promise.all([
        api.getFixtures(),
        api.getTeams(),
        api.getAdminTeams({ search: teamSearch, group: teamGroupFilter }),
        api.getAdminSettings()
      ]);
      if (fixRes.success) {
        setFixtures(fixRes.data || []);
        if (fixRes.data?.length > 0 && !selectedFixtureId) {
          setSelectedFixtureId(fixRes.data[0]._id);
        }
      }
      if (teamRes.success) {
        setTeams(teamRes.data || []);
        if (teamRes.data?.length >= 2) {
          if (!homeTeamId) setHomeTeamId(teamRes.data[0]._id);
          if (!awayTeamId) setAwayTeamId(teamRes.data[1]._id);
        }
      }
      if (adminTeamRes?.success) {
        setAdminTeams(adminTeamRes.data || []);
      }
      if (settingsRes?.success && settingsRes.data) {
        setLeagueSettings(settingsRes.data);
        if (settingsRes.data.transferWindowClosesAt) {
          setTransferWindowClosingDate(new Date(settingsRes.data.transferWindowClosesAt).toISOString().split('T')[0]);
        }
      }
    } catch (err) {
      console.error('[Load Admin Data Error]:', err);
    }
  };

  // Real-time listener for league settings and transfer window updates
  useEffect(() => {
    const handleSettingsUpdated = (updated) => {
      setLeagueSettings(updated);
      if (updated.transferWindowClosesAt) {
        setTransferWindowClosingDate(new Date(updated.transferWindowClosesAt).toISOString().split('T')[0]);
      }
    };

    socket.on('league_settings_updated', handleSettingsUpdated);
    return () => {
      socket.off('league_settings_updated', handleSettingsUpdated);
    };
  }, []);

  // Update League Settings API handler
  const handleUpdateLeagueSettings = async (patch) => {
    setSettingsUpdating(true);
    try {
      const res = await api.updateAdminSettings(patch);
      if (res.success && res.data) {
        setLeagueSettings(res.data);
        if (res.data.transferWindowClosesAt) {
          setTransferWindowClosingDate(new Date(res.data.transferWindowClosesAt).toISOString().split('T')[0]);
        }
        setTeamVerificationToast({
          type: 'success',
          msg: patch.transferWindowStatus
            ? `Transfer Window is now ${patch.transferWindowStatus.toUpperCase()}`
            : 'League settings successfully updated and broadcast to all platforms.'
        });
        setTimeout(() => setTeamVerificationToast(null), 6000);
      } else {
        throw new Error(res.error || 'Failed to update league settings');
      }
    } catch (err) {
      setTeamVerificationToast({
        type: 'error',
        msg: 'Settings update failed: ' + err.message
      });
      setTimeout(() => setTeamVerificationToast(null), 6000);
    } finally {
      setSettingsUpdating(false);
    }
  };

  // Toggle Transfer Window (Open / Closed)
  const handleToggleTransferWindow = () => {
    const isCurrentlyOpen = leagueSettings?.transferWindowStatus === 'open';
    const nextStatus = isCurrentlyOpen ? 'closed' : 'open';
    const patch = {
      transferWindowStatus: nextStatus,
      registrationLocked: nextStatus === 'open' ? false : leagueSettings?.registrationLocked,
      seasonPhase: nextStatus === 'open' ? 'mid_season_break' : leagueSettings?.seasonPhase
    };
    handleUpdateLeagueSettings(patch);
  };

  // Toggle Registration Lock
  const handleToggleRegistrationLock = () => {
    const isCurrentlyLocked = Boolean(leagueSettings?.registrationLocked);
    handleUpdateLeagueSettings({ registrationLocked: !isCurrentlyLocked });
  };

  // Broadcast Transfer Window Announcement via Resend
  const handleBroadcastTransferWindow = async () => {
    if (!window.confirm('Dispatch Transfer Window Announcement email via Resend to all 12 verified team managers?')) {
      return;
    }
    setBroadcastLoading(true);
    try {
      const res = await api.broadcastTransferWindowEmail();
      if (res.success) {
        setTeamVerificationToast({
          type: 'success',
          msg: `Transfer Window announcement broadcast dispatched to ${res.sentCount || 12} verified team managers via Resend.`
        });
        setTimeout(() => setTeamVerificationToast(null), 6000);
      } else {
        throw new Error(res.error || 'Failed to send broadcast');
      }
    } catch (err) {
      setTeamVerificationToast({
        type: 'error',
        msg: 'Failed to dispatch email broadcast: ' + err.message
      });
      setTimeout(() => setTeamVerificationToast(null), 6000);
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Re-fetch admin teams on search or filter change
  const fetchFilteredTeams = async (search = teamSearch, group = teamGroupFilter, status = teamStatusFilter) => {
    setAdminTeamsLoading(true);
    try {
      const res = await api.getAdminTeams({
        search,
        group,
        verificationStatus: status !== 'All' ? status : undefined
      });
      if (res.success) {
        setAdminTeams(res.data || []);
      }
    } catch (err) {
      console.error('[Fetch Admin Teams Error]:', err);
    } finally {
      setAdminTeamsLoading(false);
    }
  };

  // Open Roster Inspector for a Team
  const handleOpenRoster = async (team) => {
    setSelectedTeamForRoster(team);
    setRosterLoading(true);
    setRosterSearch('');
    setRosterPositionFilter('All');
    setRosterStatusFilter('All');
    try {
      const res = await api.getAdminTeamPlayers(team._id);
      if (res.success) {
        setSelectedTeamRoster(res.data?.players || []);
      } else {
        alert(res.error || 'Failed to load team roster');
      }
    } catch (err) {
      alert('Error fetching squad: ' + err.message);
    } finally {
      setRosterLoading(false);
    }
  };

  // Toggle Player Eligibility (Eligible <-> Suspended)
  const handleToggleEligibility = async (player) => {
    const isCurrentlyEligible = player.status === 'Eligible' && player.isEligible;
    const newStatus = isCurrentlyEligible ? 'Suspended' : 'Eligible';
    const newIsEligible = !isCurrentlyEligible;
    const defaultReason = isCurrentlyEligible ? 'Suspension applied by Tournament Oversight' : '';

    try {
      const res = await api.updateAdminPlayer(player._id, {
        status: newStatus,
        isEligible: newIsEligible,
        suspensionReason: defaultReason
      });
      if (res.success) {
        setSelectedTeamRoster(prev => prev.map(p => p._id === player._id ? res.data : p));
        // Update in operator home/away squad lists if relevant
        setHomePlayers(prev => prev.map(p => p._id === player._id ? res.data : p));
        setAwayPlayers(prev => prev.map(p => p._id === player._id ? res.data : p));
      } else {
        alert(res.error || 'Failed to update player status');
      }
    } catch (err) {
      alert('Error updating eligibility: ' + err.message);
    }
  };

  // Open Quick Edit for Player
  const handleOpenQuickEdit = (player) => {
    setEditingPlayer(player);
  };

  // Save Player Edit
  const handleSavePlayerEdit = async (formData, rawState) => {
    if (!editingPlayer) return;
    setEditPlayerLoading(true);

    try {
      const res = await api.updateAdminPlayer(editingPlayer._id, formData, true);
      if (res.success && res.data) {
        setSelectedTeamRoster(prev => prev.map(p => p._id === editingPlayer._id ? res.data : p));
        setHomePlayers(prev => prev.map(p => p._id === editingPlayer._id ? res.data : p));
        setAwayPlayers(prev => prev.map(p => p._id === editingPlayer._id ? res.data : p));
        setEditingPlayer(null);
      } else {
        throw new Error(res.error || 'Failed to update player');
      }
    } finally {
      setEditPlayerLoading(false);
    }
  };

  // Admin Add Player to Squad
  const handleAddPlayerAdmin = async (formData, rawState) => {
    if (!selectedTeamForRoster) return;
    setEditPlayerLoading(true);

    try {
      const res = await api.addAdminPlayer(selectedTeamForRoster._id, formData, true);
      if (res.success && res.data) {
        setSelectedTeamRoster(prev => [...prev, res.data].sort((a, b) => a.jerseyNumber - b.jerseyNumber));
        setShowAdminAddPlayerModal(false);
      } else {
        throw new Error(res.error || 'Failed to register player');
      }
    } finally {
      setEditPlayerLoading(false);
    }
  };

  // Send Urgent Lineup Reminder Email
  const handleSendLineupReminder = async (fixtureId, teamId = null) => {
    setLineupReminderStatus(prev => ({
      ...prev,
      [fixtureId]: { loading: true, msg: '', err: '' }
    }));

    try {
      const res = await api.sendAdminLineupReminder(fixtureId, teamId);
      if (res.success) {
        setLineupReminderStatus(prev => ({
          ...prev,
          [fixtureId]: {
            loading: false,
            msg: res.message || 'Lineup reminder dispatched to team manager!',
            err: ''
          }
        }));
        setTimeout(() => {
          setLineupReminderStatus(prev => {
            const next = { ...prev };
            delete next[fixtureId];
            return next;
          });
        }, 5000);
      } else {
        setLineupReminderStatus(prev => ({
          ...prev,
          [fixtureId]: { loading: false, msg: '', err: res.error || 'Failed to dispatch email' }
        }));
      }
    } catch (err) {
      setLineupReminderStatus(prev => ({
        ...prev,
        [fixtureId]: { loading: false, msg: '', err: err.message || 'Network error' }
      }));
    }
  };

  // Direct Admin Team Approval (Triggers Automated Resend Email & Unlocks Squad Gate)
  const handleApproveTeam = async (teamId) => {
    setVerifyingTeamId(teamId);
    try {
      const res = await api.approveAdminTeam(teamId);
      if (res.success) {
        try {
          confetti({
            particleCount: 65,
            spread: 70,
            origin: { y: 0.75 }
          });
        } catch (e) {}

        setAdminTeams(prev => prev.map(t => {
          if (t._id === teamId) {
            return {
              ...t,
              verificationStatus: 'approved',
              status: 'Verified',
              isVerified: true,
              verifiedAt: new Date(),
              rejectionReason: '',
              managerUser: t.managerUser ? { ...t.managerUser, isVerified: true } : null
            };
          }
          return t;
        }));

        if (selectedTeamForRoster?._id === teamId) {
          setSelectedTeamForRoster(prev => ({
            ...prev,
            verificationStatus: 'approved',
            status: 'Verified',
            isVerified: true
          }));
        }

        setTeamVerificationToast({
          type: 'success',
          msg: res.message || 'Team registration officially approved! Confirmation email dispatched to manager.'
        });
        setTimeout(() => setTeamVerificationToast(null), 6000);
      } else {
        setTeamVerificationToast({
          type: 'error',
          msg: res.error || 'Failed to approve team'
        });
        setTimeout(() => setTeamVerificationToast(null), 6000);
      }
    } catch (err) {
      setTeamVerificationToast({
        type: 'error',
        msg: 'Approval error: ' + err.message
      });
      setTimeout(() => setTeamVerificationToast(null), 6000);
    } finally {
      setVerifyingTeamId('');
    }
  };

  // Open Rejection Modal
  const handleOpenRejectModal = (team) => {
    setRejectingTeam(team);
    setRejectionReasonInput('');
  };

  // Confirm Rejection & Dispatch Resend Notice
  const handleConfirmRejectTeam = async () => {
    if (!rejectingTeam) return;
    setRejectLoading(true);
    try {
      const res = await api.rejectAdminTeam(rejectingTeam._id, rejectionReasonInput);
      if (res.success) {
        setAdminTeams(prev => prev.map(t => {
          if (t._id === rejectingTeam._id) {
            return {
              ...t,
              verificationStatus: 'rejected',
              status: 'Pending Verification',
              isVerified: false,
              rejectionReason: rejectionReasonInput || 'Registration details did not meet the competition verification standards.',
              verifiedAt: null
            };
          }
          return t;
        }));

        if (selectedTeamForRoster?._id === rejectingTeam._id) {
          setSelectedTeamForRoster(prev => ({
            ...prev,
            verificationStatus: 'rejected',
            status: 'Pending Verification',
            isVerified: false,
            rejectionReason: rejectionReasonInput
          }));
        }

        setTeamVerificationToast({
          type: 'success',
          msg: res.message || 'Team registration marked as rejected. Notice email dispatched to manager.'
        });
        setTimeout(() => setTeamVerificationToast(null), 6000);
        setRejectingTeam(null);
        setRejectionReasonInput('');
      } else {
        setTeamVerificationToast({
          type: 'error',
          msg: res.error || 'Failed to reject team'
        });
        setTimeout(() => setTeamVerificationToast(null), 6000);
      }
    } catch (err) {
      setTeamVerificationToast({
        type: 'error',
        msg: 'Rejection error: ' + err.message
      });
      setTimeout(() => setTeamVerificationToast(null), 6000);
    } finally {
      setRejectLoading(false);
    }
  };

  // Revoke / Return Team to Pending Verification
  const handleRevokeTeam = async (teamId) => {
    setVerifyingTeamId(teamId);
    try {
      const res = await api.revokeAdminTeam(teamId);
      if (res.success) {
        setAdminTeams(prev => prev.map(t => {
          if (t._id === teamId) {
            return {
              ...t,
              verificationStatus: 'pending',
              status: 'Pending Verification',
              isVerified: false,
              verifiedAt: null,
              rejectionReason: ''
            };
          }
          return t;
        }));

        if (selectedTeamForRoster?._id === teamId) {
          setSelectedTeamForRoster(prev => ({
            ...prev,
            verificationStatus: 'pending',
            status: 'Pending Verification',
            isVerified: false
          }));
        }

        setTeamVerificationToast({
          type: 'success',
          msg: res.message || 'Team status returned to pending review.'
        });
        setTimeout(() => setTeamVerificationToast(null), 6000);
      } else {
        setTeamVerificationToast({
          type: 'error',
          msg: res.error || 'Failed to revoke team approval'
        });
        setTimeout(() => setTeamVerificationToast(null), 6000);
      }
    } catch (err) {
      setTeamVerificationToast({
        type: 'error',
        msg: 'Revoke error: ' + err.message
      });
      setTimeout(() => setTeamVerificationToast(null), 6000);
    } finally {
      setVerifyingTeamId('');
    }
  };

  // Direct Admin Team & Manager Verification (Bypass OTP)
  const handleVerifyTeam = async (teamId, status = 'Verified') => {
    if (status === 'Verified') {
      return handleApproveTeam(teamId);
    } else {
      return handleRevokeTeam(teamId);
    }
  };

  // Automated Tournament Scheduling Engine Handler
  const handleAutoGenerateFixtures = async () => {
    setAutoScheduleLoading(true);
    setAutoScheduleErrMsg('');
    setAutoScheduleSuccessMsg('');

    try {
      const res = await api.autoGenerateFixtures({
        mode: autoScheduleMode,
        legs: autoScheduleLegs === '2_LEGS' ? 2 : 1,
        startDate: autoScheduleStartDate,
        daysBetweenRounds: Number(autoScheduleDaysBetween),
        timeSlots: autoScheduleTimeSlots,
        venues: autoScheduleVenues,
        clearExistingUpcoming: autoScheduleClearExisting,
        autoNotifyManagers: autoScheduleNotifyManagers
      });

      if (res.success) {
        try {
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {}

        setAutoScheduleSuccessMsg(res.message);
        
        // Refresh fixtures and standings in admin portal
        const updatedFix = await api.getFixtures();
        if (updatedFix.success) {
          setFixtures(updatedFix.data || []);
          if (updatedFix.data?.length > 0 && !selectedFixtureId) {
            setSelectedFixtureId(updatedFix.data[0]._id);
          }
        }

        setTimeout(() => {
          setShowAutoScheduleModal(false);
          setAutoScheduleSuccessMsg('');
        }, 2200);
      } else {
        setAutoScheduleErrMsg(res.error || 'Failed to auto-generate tournament schedule');
      }
    } catch (err) {
      setAutoScheduleErrMsg('Error generating schedule: ' + err.message);
    } finally {
      setAutoScheduleLoading(false);
    }
  };

  useEffect(() => {
    if (adminUser) {
      loadAdminData();
    }
  }, [adminUser]);

  // 3. Load active fixture details & squads when selectedFixtureId changes
  useEffect(() => {
    if (!selectedFixtureId) {
      setActiveFixture(null);
      return;
    }

    const current = fixtures.find(f => f._id === selectedFixtureId);
    if (current) {
      setActiveFixture(current);
      setEventMinute(current.minute || 0);
      setEventTeamId(current.homeTeam?._id || current.homeTeam || '');
    }

    api.getFixture(selectedFixtureId).then(res => {
      if (res.success && res.data) {
        setActiveFixture(res.data.fixture);
        setFixtureEvents(res.data.events || []);
        setEventMinute(res.data.fixture.minute || 0);

        const hId = res.data.fixture.homeTeam?._id || res.data.fixture.homeTeam;
        const aId = res.data.fixture.awayTeam?._id || res.data.fixture.awayTeam;
        setEventTeamId(hId);

        // Fetch squad players for event dropdowns
        if (hId) {
          api.getTeam(hId).then(tRes => {
            if (tRes.success && tRes.data?.team?.squad) {
              setHomePlayers(tRes.data.team.squad);
            }
          });
        }
        if (aId) {
          api.getTeam(aId).then(tRes => {
            if (tRes.success && tRes.data?.team?.squad) {
              setAwayPlayers(tRes.data.team.squad);
            }
          });
        }
      }
    });
  }, [selectedFixtureId]);

  // 4. Socket listener for real-time sync in operator pad
  useEffect(() => {
    const handleFixtureUpdated = (updated) => {
      setFixtures(prev => prev.map(f => (f._id === updated._id ? updated : f)));
      if (activeFixture?._id === updated._id) {
        setActiveFixture(updated);
        setEventMinute(updated.minute || 0);
      }
    };

    const handleNewEvent = (newEvent) => {
      if (newEvent.fixture === activeFixture?._id || newEvent.fixture?._id === activeFixture?._id) {
        setFixtureEvents(prev => [...prev, newEvent]);
      }
    };

    socket.on('fixture_updated', handleFixtureUpdated);
    socket.on('new_match_event', handleNewEvent);

    return () => {
      socket.off('fixture_updated', handleFixtureUpdated);
      socket.off('new_match_event', handleNewEvent);
    };
  }, [activeFixture]);

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await api.login(loginEmail, loginPassword);
      if (res.success && res.data?.user) {
        if (res.data.user.role !== 'admin') {
          setLoginError('Access Denied: Insufficient administrative clearance.');
          localStorage.removeItem('skouted_token');
          return;
        }
        localStorage.setItem('skouted_token', res.data.token);
        setAdminUser(res.data.user);
      } else {
        setLoginError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setLoginError(err.message || 'Error connecting to auth server.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('skouted_token');
    setAdminUser(null);
  };

  // Score quick update
  const handleQuickScore = async (homeDelta, awayDelta) => {
    if (!activeFixture) return;
    const newHome = Math.max(0, (activeFixture.homeScore || 0) + homeDelta);
    const newAway = Math.max(0, (activeFixture.awayScore || 0) + awayDelta);

    try {
      const res = await api.updateScore(activeFixture._id, newHome, newAway, eventMinute);
      if (res.success) {
        setActiveFixture(res.data);
      }
    } catch (err) {
      alert('Error updating score: ' + err.message);
    }
  };

  // Period switch
  const handlePeriodSwitch = async (newStatus) => {
    if (!activeFixture) return;
    try {
      const res = await api.updatePeriod(activeFixture._id, newStatus, eventMinute);
      if (res.success) {
        setActiveFixture(res.data);
      }
    } catch (err) {
      alert('Error updating match period: ' + err.message);
    }
  };

  // Minute adjust
  const handleMinuteAdjust = async (delta) => {
    if (!activeFixture) return;
    const newMin = Math.max(0, (activeFixture.minute || 0) + delta);
    setEventMinute(newMin);
    try {
      const res = await api.updateScore(activeFixture._id, activeFixture.homeScore, activeFixture.awayScore, newMin);
      if (res.success) {
        setActiveFixture(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Event Logger Submit
  const handleLogEventSubmit = async (e) => {
    e.preventDefault();
    if (!activeFixture) return;

    setEventLoading(true);
    setEventSuccessMsg('');

    try {
      const payload = {
        minute: Number(eventMinute),
        type: eventType,
        teamId: eventTeamId,
        playerId: eventPlayerId || null,
        assistPlayerId: assistPlayerId || null,
        description: eventDescription
      };

      const res = await api.logMatchEvent(activeFixture._id, payload);
      if (res.success) {
        setEventSuccessMsg(`${eventType} recorded and broadcasted!`);
        if (eventType === 'GOAL') {
          confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
        }
        setEventDescription('');
        setEventPlayerId('');
        setAssistPlayerId('');
        setTimeout(() => setEventSuccessMsg(''), 4000);
      } else {
        alert(res.error || 'Failed to log event');
      }
    } catch (err) {
      alert('Error logging event: ' + err.message);
    } finally {
      setEventLoading(false);
    }
  };

  // Create Fixture Submit
  const handleCreateFixtureSubmit = async (e) => {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId) {
      setCreateFixtureErr('Please select both Home and Away teams');
      return;
    }
    if (homeTeamId === awayTeamId) {
      setCreateFixtureErr('Home and Away teams must be different');
      return;
    }

    setCreateFixtureLoading(true);
    setCreateFixtureErr('');
    setCreateFixtureMsg('');

    try {
      const payload = {
        homeTeam: homeTeamId,
        awayTeam: awayTeamId,
        stage,
        matchday: Number(matchday) || 1,
        leg: Number(leg) || 1,
        date: matchDate,
        time: matchTime,
        venue
      };

      const res = await api.createFixture(payload);
      if (res.success) {
        setCreateFixtureMsg('Fixture scheduled! Notice emails dispatched to both club managers.');
        loadAdminData();
        setTimeout(() => setCreateFixtureMsg(''), 5000);
      } else {
        setCreateFixtureErr(res.error || 'Failed to schedule fixture');
      }
    } catch (err) {
      setCreateFixtureErr(err.message || 'Error scheduling fixture');
    } finally {
      setCreateFixtureLoading(false);
    }
  };

  // Delete Fixture
  const handleDeleteFixture = async (fixtureId) => {
    if (!confirm('Are you sure you want to delete this fixture?')) return;
    try {
      const res = await api.deleteFixture(fixtureId);
      if (res.success) {
        setFixtures(prev => prev.filter(f => f._id !== fixtureId));
        if (selectedFixtureId === fixtureId) {
          setSelectedFixtureId(fixtures[0]?._id || '');
        }
      } else {
        alert(res.error || 'Could not delete fixture');
      }
    } catch (err) {
      alert(err.message || 'Error deleting fixture');
    }
  };

  // Force Recalculate Standings
  const handleRecalculateStandings = async () => {
    try {
      const res = await api.recalculateStandings();
      if (res.success) {
        setSyncMsg('Championship table standings successfully recalculated and broadcasted.');
        setTimeout(() => setSyncMsg(''), 4000);
      } else {
        alert(res.error || 'Failed to recalculate');
      }
    } catch (err) {
      alert(err.message || 'Error recalculating');
    }
  };

  // Active Team Players for Event Dropdown
  const activeTeamSquad =
    eventTeamId === (activeFixture?.homeTeam?._id || activeFixture?.homeTeam)
      ? homePlayers
      : awayPlayers;

  // -------------------------------------------------------------
  // VIEW A: Loading state
  // -------------------------------------------------------------
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin"></div>
          <span className="text-xs font-mono text-slate-400">Verifying Administrative Clearance...</span>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW B: Isolated Admin Security Gate (Login)
  // -------------------------------------------------------------
  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#07090D] flex flex-col justify-center items-center p-4 selection:bg-rose-500 selection:text-white">
        <div className="w-full max-w-sm bg-[#10131A] border border-[#232838] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-500/10">
              <Lock className="w-6 h-6" />
            </div>
            <span className="inline-block text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
              RESTRICTED WORKSPACE
            </span>
            <h2 className="text-lg font-display font-extrabold text-white tracking-tight">Skouted League Ops</h2>
            <p className="text-xs text-slate-400">Tournament Administration & Pitch-side Match Operator Console</p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@skoutedleague.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Master Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <span>{loginLoading ? 'Authenticating...' : 'Enter Operations Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center border-t border-white/5">
            <button
              type="button"
              onClick={onExit}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Return to Public Fan App
            </button>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW C: Authenticated Admin Operations Dashboard
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 flex flex-col font-sans pb-16">
      
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#0E1118]/95 backdrop-blur-md border-b border-[#1E2332] px-3 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-sm tracking-tight text-white">SKOUTED LEAGUE</span>
              <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
                OPS CONTROL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Restricted Management Console</p>
          </div>
        </div>

        {/* Right Exit / Sign out */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block text-right pr-2 border-r border-white/10">
            <div className="text-xs font-bold text-white">{adminUser.name}</div>
            <div className="text-[10px] text-rose-400 font-mono uppercase">Administrator</div>
          </div>

          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            title="View public live site"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public League</span>
          </button>

          <button
            onClick={handleAdminLogout}
            className="w-9 h-9 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center transition-all"
            title="Sign out of Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Nav Tabs for Admin Workspaces */}
      <div className="max-w-6xl w-full mx-auto px-3 sm:px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-[#1E2332]">
          {[
            { id: 'operator', label: '📱 Matchday Operator', icon: Radio, count: fixtures.filter(f => f.status.includes('HALF') || f.status === 'HT').length },
            { id: 'fixtures', label: '📅 Fixtures & Schedule', icon: Calendar, count: fixtures.length },
            { id: 'teams', label: '🛡️ Teams & Squad Explorer', icon: Users, count: adminTeams.length || teams.length },
            { id: 'transfer', label: '🔄 Transfer Window & Roster Engine', icon: ArrowRightLeft, isLive: leagueSettings?.transferWindowStatus === 'open' },
            { id: 'system', label: '⚙️ Diagnostics & Sync', icon: RefreshCw }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id || (tab.id === 'teams' && adminTab === 'clubs');
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                  isActive
                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                    : 'bg-[#121520] border-[#222738] text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.isLive && (
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-full bg-[#00E676] text-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                    <span>OPEN</span>
                  </span>
                )}
                {tab.count !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/30' : 'bg-white/10'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 flex-1">
        
        {/* ========================================================= */}
        {/* 1. MATCHDAY OPERATOR PAD (Pitch-side console) */}
        {/* ========================================================= */}
        {adminTab === 'operator' && (
          <div className="space-y-4">
            
            {/* Fixture Selector Strip */}
            <div className="bg-[#121520] border border-[#222738] rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Select Target Match:</span>
              </div>
              <select
                value={selectedFixtureId}
                onChange={(e) => setSelectedFixtureId(e.target.value)}
                className="bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-rose-500 flex-1 sm:max-w-md"
              >
                {fixtures.length === 0 ? (
                  <option value="">No fixtures scheduled yet</option>
                ) : (
                  fixtures.map(f => (
                    <option key={f._id} value={f._id}>
                      [{f.status}] {f.homeTeam?.name || 'Home'} vs {f.awayTeam?.name || 'Away'} ({f.homeScore ?? 0} - {f.awayScore ?? 0}) • {f.stage}
                    </option>
                  ))
                )}
              </select>
            </div>

            {!activeFixture ? (
              <div className="glass-card rounded-3xl p-12 text-center text-slate-400 space-y-3">
                <Calendar className="w-10 h-10 mx-auto text-slate-600" />
                <h4 className="font-bold text-white text-base">No Match Selected</h4>
                <p className="text-xs">Schedule fixtures first in the "Fixtures & Schedule" tab to begin matchday operations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Scoreboard & Period Switcher (2 Cols) */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* Big Athletic Scorecard */}
                  <div className="bg-[#131622] border border-[#232838] rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                      <span>{activeFixture.stage} • {activeFixture.venue}</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold">
                        {activeFixture.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 items-center py-6 text-center">
                      {/* Home */}
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#1C2030] border border-[#2B3145] p-2 flex items-center justify-center mb-2 shadow-lg">
                          {activeFixture.homeTeam?.logo ? (
                            <img src={activeFixture.homeTeam.logo} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span className="font-black text-sm text-[#00E676]">{activeFixture.homeTeam?.shortCode || 'HOM'}</span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm text-white line-clamp-1">{activeFixture.homeTeam?.name || 'Home'}</h4>
                        <span className="text-[11px] font-mono text-slate-400">{activeFixture.homeTeam?.shortCode}</span>
                        
                        {/* Quick +/- score */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleQuickScore(-1, 0)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleQuickScore(1, 0)}
                            className="w-8 h-8 rounded-lg bg-[#00E676] text-black font-extrabold flex items-center justify-center shadow"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Score Digits & Clock */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-widest flex items-center gap-2">
                          <span>{activeFixture.homeScore || 0}</span>
                          <span className="text-slate-600">:</span>
                          <span>{activeFixture.awayScore || 0}</span>
                        </div>
                        
                        {/* Minute Clock Adjust */}
                        <div className="mt-3 flex items-center gap-1.5 bg-[#090B10] px-3 py-1 rounded-full border border-[#222738] text-xs font-mono font-bold text-[#00E676]">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>{activeFixture.minute || 0}'</span>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-2 text-[10px] font-mono">
                          <button onClick={() => handleMinuteAdjust(-1)} className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400">
                            -1m
                          </button>
                          <button onClick={() => handleMinuteAdjust(1)} className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400">
                            +1m
                          </button>
                          <button onClick={() => handleMinuteAdjust(5)} className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400">
                            +5m
                          </button>
                        </div>
                      </div>

                      {/* Away */}
                      <div className="flex flex-col items-center">
                        <div className="w-14 h-14 rounded-2xl bg-[#1C2030] border border-[#2B3145] p-2 flex items-center justify-center mb-2 shadow-lg">
                          {activeFixture.awayTeam?.logo ? (
                            <img src={activeFixture.awayTeam.logo} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <span className="font-black text-sm text-[#00E676]">{activeFixture.awayTeam?.shortCode || 'AWY'}</span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm text-white line-clamp-1">{activeFixture.awayTeam?.name || 'Away'}</h4>
                        <span className="text-[11px] font-mono text-slate-400">{activeFixture.awayTeam?.shortCode}</span>
                        
                        {/* Quick +/- score */}
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleQuickScore(0, -1)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold flex items-center justify-center"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleQuickScore(0, 1)}
                            className="w-8 h-8 rounded-lg bg-[#00E676] text-black font-extrabold flex items-center justify-center shadow"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Period Switcher Toolbar */}
                    <div className="pt-3 border-t border-white/5">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold">
                        Switch Match Period:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-xs font-bold font-mono">
                        {[
                          { id: '1ST HALF', label: '1st Half' },
                          { id: 'HT', label: 'Half Time (HT)' },
                          { id: '2ND HALF', label: '2nd Half' },
                          { id: 'FT', label: 'Full Time (FT)' },
                          { id: 'PENS', label: 'Shootout' }
                        ].map(period => (
                          <button
                            key={period.id}
                            onClick={() => handlePeriodSwitch(period.id)}
                            className={`py-2 px-2 rounded-xl text-center transition-all border ${
                              activeFixture.status === period.id
                                ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                                : 'bg-[#090B10] border-[#222738] text-slate-400 hover:text-white'
                            }`}
                          >
                            {period.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Match In-Game Events Timeline */}
                  <div className="bg-[#131622] border border-[#232838] rounded-3xl p-5 space-y-3">
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#FFB800]" />
                      <span>Live Event Feed ({fixtureEvents.length})</span>
                    </h4>

                    {fixtureEvents.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500">
                        No match events logged yet. Use the event recorder on the right to log goals, cards, and subs.
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5 space-y-2">
                        {fixtureEvents.map((evt, idx) => (
                          <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono font-bold text-[#00E676] bg-[#00E676]/10 px-1.5 py-0.5 rounded text-[11px]">
                                {evt.minute}'
                              </span>
                              <span className="font-bold text-white">
                                {evt.type === 'GOAL' && '⚽ GOAL'}
                                {evt.type === 'YELLOW_CARD' && '🟨 Yellow Card'}
                                {evt.type === 'RED_CARD' && '🟥 Red Card'}
                                {evt.type === 'SUB_IN' && '🔄 Substitution'}
                                {evt.type === 'VAR' && '📺 VAR Check'}
                                {evt.type === 'OWN_GOAL' && '🥅 Own Goal'}
                              </span>
                              <span className="text-slate-300">
                                {evt.player?.firstName} {evt.player?.lastName}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {evt.team?.shortCode || evt.team?.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right: Pitch-side Event Logger Modal / Panel */}
                <div className="space-y-4">
                  <div className="bg-[#131622] border border-[#232838] rounded-3xl p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                      <Radio className="w-4 h-4 text-rose-500" />
                      <h4 className="font-extrabold text-sm text-white">Event Recorder</h4>
                    </div>

                    {eventSuccessMsg && (
                      <div className="p-3 bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{eventSuccessMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleLogEventSubmit} className="space-y-3">
                      
                      {/* Event Type Grid */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Event Type
                        </label>
                        <select
                          value={eventType}
                          onChange={(e) => setEventType(e.target.value)}
                          className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-bold"
                        >
                          <option value="GOAL">⚽ Goal</option>
                          <option value="OWN_GOAL">🥅 Own Goal</option>
                          <option value="YELLOW_CARD">🟨 Yellow Card</option>
                          <option value="RED_CARD">🟥 Red Card</option>
                          <option value="SUB_IN">🔄 Substitution</option>
                          <option value="VAR">📺 VAR Review</option>
                        </select>
                      </div>

                      {/* Team Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Team
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setEventTeamId(activeFixture.homeTeam?._id || activeFixture.homeTeam)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold truncate border ${
                              eventTeamId === (activeFixture.homeTeam?._id || activeFixture.homeTeam)
                                ? 'bg-[#00E676] text-black border-[#00E676]'
                                : 'bg-[#090B10] border-[#232838] text-slate-300'
                            }`}
                          >
                            {activeFixture.homeTeam?.name || 'Home'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEventTeamId(activeFixture.awayTeam?._id || activeFixture.awayTeam)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold truncate border ${
                              eventTeamId === (activeFixture.awayTeam?._id || activeFixture.awayTeam)
                                ? 'bg-[#00E676] text-black border-[#00E676]'
                                : 'bg-[#090B10] border-[#232838] text-slate-300'
                            }`}
                          >
                            {activeFixture.awayTeam?.name || 'Away'}
                          </button>
                        </div>
                      </div>

                      {/* Player Selector */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Player
                        </label>
                        <select
                          value={eventPlayerId}
                          onChange={(e) => setEventPlayerId(e.target.value)}
                          className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                        >
                          <option value="">-- Select Squad Player --</option>
                          {activeTeamSquad.map(p => (
                            <option key={p._id} value={p._id}>
                              #{p.jerseyNumber} {p.firstName} {p.lastName} ({p.position})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Assist Player (only for Goal) */}
                      {eventType === 'GOAL' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Assist By (Optional)
                          </label>
                          <select
                            value={assistPlayerId}
                            onChange={(e) => setAssistPlayerId(e.target.value)}
                            className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
                          >
                            <option value="">-- No Assist / Solo --</option>
                            {activeTeamSquad.map(p => (
                              <option key={p._id} value={p._id}>
                                #{p.jerseyNumber} {p.firstName} {p.lastName} ({p.position})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Minute */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Minute
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="130"
                          value={eventMinute}
                          onChange={(e) => setEventMinute(e.target.value)}
                          className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      {/* Note */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Description Note
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Header from corner kick"
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                          className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={eventLoading}
                        className="w-full py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00c968] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00E676]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>{eventLoading ? 'Recording...' : 'Log & Broadcast Event'}</span>
                      </button>

                    </form>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ========================================================= */}
        {/* 2. FIXTURES & SCHEDULE MANAGEMENT */}
        {/* ========================================================= */}
        {adminTab === 'fixtures' && (
          <div className="space-y-6">
            
            {/* Automated Tournament Fixtures Engine Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#121828] via-[#151D30] to-[#0D1220] border border-[#2B354F] rounded-3xl p-6 sm:p-7 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>ALGORITHMIC FIXTURE SCHEDULER</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
                    Automated Tournament Fixture Engine
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Generate mathematically balanced round-robin match schedules for the 12-club youth league championship with automated venue allocation, time slot distribution, and real-time manager notifications in one click.
                  </p>
                  
                  {/* Status pills */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                      <strong className="text-[#00E676]">{teams.length}</strong> Registered Clubs
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                      <strong className="text-[#00E676]">22</strong> Matchdays (Home & Away)
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                      <strong className="text-white">{fixtures.length}</strong> Scheduled Matches
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => {
                      setAutoScheduleErrMsg('');
                      setAutoScheduleSuccessMsg('');
                      setShowAutoScheduleModal(true);
                    }}
                    className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#34f195] hover:to-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#00E676]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <Wand2 className="w-4 h-4 text-black" />
                    <span>⚡ Auto-Generate Tournament Schedule</span>
                  </button>
                  <span className="text-[11px] text-center text-slate-400 font-mono">
                    Berger circle algorithm • Zero self-matchups
                  </span>
                </div>
              </div>
            </div>

            {/* Fixture Creator Form */}
            <div className="bg-[#131622] border border-[#232838] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#00E676]" />
                  <h3 className="font-extrabold text-base text-white">Manual Fixture Scheduler</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAutoScheduleErrMsg('');
                      setAutoScheduleSuccessMsg('');
                      setShowAutoScheduleModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/30 text-[#00E676] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Auto-Schedule Wizard</span>
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">Auto Manager Notice Enabled</span>
                </div>
              </div>

              {createFixtureMsg && (
                <div className="p-3 bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{createFixtureMsg}</span>
                </div>
              )}

              {createFixtureErr && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createFixtureErr}</span>
                </div>
              )}

              <form onSubmit={handleCreateFixtureSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Home Team */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Home Team *
                    </label>
                    <select
                      value={homeTeamId}
                      onChange={(e) => setHomeTeamId(e.target.value)}
                      required
                      className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    >
                      <option value="">-- Select Home Club --</option>
                      {teams.map(t => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.shortCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Away Team */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Away Team *
                    </label>
                    <select
                      value={awayTeamId}
                      onChange={(e) => setAwayTeamId(e.target.value)}
                      required
                      className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    >
                      <option value="">-- Select Away Club --</option>
                      {teams.map(t => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.shortCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stage</label>
                    <input
                      type="text"
                      required
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      placeholder="Matchday 1"
                      className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Matchday</label>
                    <input
                      type="number"
                      min="1"
                      max="22"
                      required
                      value={matchday}
                      onChange={(e) => setMatchday(Math.max(1, Math.min(22, Number(e.target.value))))}
                      placeholder="1-22"
                      className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E676]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Match Leg</label>
                    <select
                      value={leg}
                      onChange={(e) => setLeg(Number(e.target.value))}
                      className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    >
                      <option value={1}>Leg 1 (Home)</option>
                      <option value={2}>Leg 2 (Away)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={matchDate}
                      onChange={(e) => setMatchDate(e.target.value)}
                      className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kickoff Time</label>
                    <input
                      type="time"
                      required
                      value={matchTime}
                      onChange={(e) => setMatchTime(e.target.value)}
                      className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Venue</label>
                    <input
                      type="text"
                      required
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createFixtureLoading || teams.length < 2}
                  className="btn-primary py-2.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{createFixtureLoading ? 'Dispatching...' : 'Schedule & Notify Managers'}</span>
                </button>
              </form>
            </div>

            {/* Existing Fixtures List */}
            <div className="bg-[#131622] border border-[#232838] rounded-3xl p-5 space-y-4">
              <h4 className="font-extrabold text-sm text-white">All Scheduled Fixtures ({fixtures.length})</h4>

              {fixtures.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No fixtures scheduled yet. Use the form above to add tournament matches.
                </div>
              ) : (
                <div className="divide-y divide-white/5 space-y-4">
                  {fixtures.map(f => {
                    const homeLineupLocked = f.homeLineup?.isLocked;
                    const awayLineupLocked = f.awayLineup?.isLocked;
                    const homeStartersCount = f.homeLineup?.startingXI?.length || 0;
                    const awayStartersCount = f.awayLineup?.startingXI?.length || 0;

                    // 3-Hour Cutoff Detection
                    const fixtureDateTime = new Date(`${f.date}T${f.time || '16:00'}:00`);
                    const now = new Date();
                    const diffHours = (fixtureDateTime - now) / (1000 * 60 * 60);
                    const isUpcoming = f.status === 'UPCOMING';
                    const isCutoffPeriod = isUpcoming && diffHours > 0 && diffHours <= 3;
                    const isOverdueLineup = isUpcoming && diffHours <= 0;
                    const cutoffAlert = (isCutoffPeriod || isOverdueLineup) && (!homeLineupLocked || !awayLineupLocked);
                    const reminderState = lineupReminderStatus[f._id];

                    return (
                      <div key={f._id} className="pt-4 pb-1 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-white flex-wrap">
                              <span className="text-[#00E676]">{f.homeTeam?.name || 'Home'}</span>
                              <span className="font-mono text-slate-500">vs</span>
                              <span className="text-[#00E676]">{f.awayTeam?.name || 'Away'}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                                f.status.includes('HALF') || f.status === 'HT'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse font-bold'
                                  : f.status === 'FT'
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-white/10 text-slate-300'
                              }`}>
                                {f.status}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                                {f.stage}
                              </span>
                              {f.matchday && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E676]/10 text-[#00E676] font-bold border border-[#00E676]/20">
                                  Matchday {f.matchday}
                                </span>
                              )}
                              {f.leg && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                                  Leg {f.leg}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>📅 {f.date} at {f.time}</span>
                              <span>•</span>
                              <span>📍 {f.venue}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setInspectingFixtureLineups(f)}
                              className="px-3 py-1.5 rounded-xl bg-[#1C2030] hover:bg-[#252B40] text-xs font-bold text-slate-200 hover:text-white border border-[#2B3145] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                              title="Inspect both teams' Starting XI & Bench"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#00E676]" />
                              <span>Inspect Lineups</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedFixtureId(f._id);
                                setAdminTab('operator');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 hover:text-white border border-white/10 flex items-center gap-1 cursor-pointer"
                            >
                              <span>Operator Pad →</span>
                            </button>

                            <button
                              onClick={() => handleDeleteFixture(f._id)}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 cursor-pointer"
                              title="Delete Fixture"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Starting XI Submission Status Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-[#090B10] border border-[#1E2332] text-xs">
                          <div className="flex items-center gap-4 flex-wrap text-[11px]">
                            {/* Home Status */}
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-400">{f.homeTeam?.shortCode || 'Home'}:</span>
                              {homeLineupLocked ? (
                                <span className="inline-flex items-center gap-1 text-[#00E676] font-mono font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Locked ({homeStartersCount}/11)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-400 font-mono font-semibold">
                                  <Clock className="w-3.5 h-3.5" /> Pending Lineup
                                </span>
                              )}
                            </div>

                            <span className="text-slate-700">|</span>

                            {/* Away Status */}
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-400">{f.awayTeam?.shortCode || 'Away'}:</span>
                              {awayLineupLocked ? (
                                <span className="inline-flex items-center gap-1 text-[#00E676] font-mono font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Locked ({awayStartersCount}/11)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-400 font-mono font-semibold">
                                  <Clock className="w-3.5 h-3.5" /> Pending Lineup
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Resend Lineup Reminder Email Button */}
                          {(!homeLineupLocked || !awayLineupLocked) && (
                            <button
                              onClick={() => handleSendLineupReminder(f._id)}
                              disabled={reminderState?.loading}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
                              title="Dispatches direct Resend notification to team manager"
                            >
                              <Mail className="w-3 h-3 text-amber-400" />
                              <span>{reminderState?.loading ? 'Sending Notice...' : 'Resend Lineup Reminder Email'}</span>
                            </button>
                          )}
                        </div>

                        {/* Cutoff Flag Notice */}
                        {cutoffAlert && (
                          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg shadow-rose-500/10">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                              <span className="font-bold">
                                🚨 3-Hour Pre-Match Cutoff Active: Lineup missing from {(!homeLineupLocked && !awayLineupLocked) ? 'BOTH teams' : !homeLineupLocked ? (f.homeTeam?.name || 'Home Club') : (f.awayTeam?.name || 'Away Club')}!
                              </span>
                            </div>
                            <button
                              onClick={() => handleSendLineupReminder(f._id)}
                              disabled={reminderState?.loading}
                              className="px-3 py-1 rounded-lg bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider hover:bg-rose-400 transition-all shrink-0 cursor-pointer self-start sm:self-auto"
                            >
                              Send Urgent Cutoff Alert
                            </button>
                          </div>
                        )}

                        {/* Lineup Reminder Status Banner */}
                        {reminderState?.msg && (
                          <div className="p-2.5 rounded-xl bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>{reminderState.msg}</span>
                          </div>
                        )}
                        {reminderState?.err && (
                          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{reminderState.err}</span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 3. TEAMS DIRECTORY & SQUAD EXPLORER */}
        {/* ========================================================= */}
        {(adminTab === 'teams' || adminTab === 'clubs') && (
          <div className="space-y-5">
            
            {/* Header & Filter Controls Card */}
            <div className="bg-[#131622] border border-[#232838] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#00E676]" />
                    <h3 className="font-extrabold text-base text-white tracking-tight">Team Directory & Squad Explorer</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official participating clubs, player accreditation oversight, and pitch-side match sheets.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300">
                    <strong className="text-white">{adminTeams.length}</strong> Clubs Registered
                  </span>
                  <button
                    onClick={() => fetchFilteredTeams(teamSearch, teamGroupFilter)}
                    disabled={adminTeamsLoading}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer transition-all"
                    title="Refresh Team Directory"
                  >
                    <RefreshCw className={`w-4 h-4 ${adminTeamsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'All', label: 'All Clubs', count: adminTeams.length },
                  { id: 'pending', label: 'Pending Verification', count: adminTeams.filter(t => (t.verificationStatus || (t.status === 'Verified' ? 'approved' : 'pending')) === 'pending').length, isPending: true },
                  { id: 'approved', label: 'Approved Clubs', count: adminTeams.filter(t => (t.verificationStatus || (t.status === 'Verified' ? 'approved' : 'pending')) === 'approved').length, isApproved: true },
                  { id: 'rejected', label: 'Rejected', count: adminTeams.filter(t => t.verificationStatus === 'rejected').length, isRejected: true }
                ].map(filterTab => {
                  const isActive = teamStatusFilter === filterTab.id;
                  return (
                    <button
                      key={filterTab.id}
                      onClick={() => {
                        setTeamStatusFilter(filterTab.id);
                        fetchFilteredTeams(teamSearch, teamGroupFilter, filterTab.id);
                      }}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border cursor-pointer ${
                        isActive
                          ? filterTab.isPending
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-500/10 font-black'
                            : filterTab.isRejected
                            ? 'bg-rose-500/20 border-rose-500/60 text-rose-300 shadow-md shadow-rose-500/10 font-black'
                            : 'bg-[#00E676]/20 border-[#00E676] text-[#00E676] shadow-md shadow-[#00E676]/15 font-black'
                          : 'bg-[#141720] border-[#222735] text-slate-400 hover:text-white hover:border-slate-600'
                      }`}
                    >
                      {filterTab.isPending && filterTab.count > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                      <span>{filterTab.label}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? filterTab.isPending
                            ? 'bg-amber-500/30 text-amber-200'
                            : filterTab.isRejected
                            ? 'bg-rose-500/30 text-rose-200'
                            : 'bg-[#00E676]/30 text-white'
                          : 'bg-white/5 text-slate-400'
                      }`}>
                        {filterTab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Group Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div className="sm:col-span-2 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={teamSearch}
                    onChange={(e) => {
                      setTeamSearch(e.target.value);
                      fetchFilteredTeams(e.target.value, teamGroupFilter, teamStatusFilter);
                    }}
                    placeholder="Search by club name or short code (e.g. Telu FC, TLU)..."
                    className="w-full bg-[#090B10] border border-[#232838] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676] transition-colors"
                  />
                  {teamSearch && (
                    <button
                      onClick={() => {
                        setTeamSearch('');
                        fetchFilteredTeams('', teamGroupFilter, teamStatusFilter);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Group Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500 shrink-0" />
                  <select
                    value={teamGroupFilter}
                    onChange={(e) => {
                      setTeamGroupFilter(e.target.value);
                      fetchFilteredTeams(teamSearch, e.target.value, teamStatusFilter);
                    }}
                    className="w-full bg-[#090B10] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676] cursor-pointer"
                  >
                    <option value="All">All Groups / Divisions</option>
                    <option value="Group A">Group A</option>
                    <option value="Group B">Group B</option>
                    <option value="Group C">Group C</option>
                    <option value="Group D">Group D</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Verification Alert Toast */}
            {teamVerificationToast && (
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all shadow-lg animate-in fade-in slide-in-from-top-2 ${
                teamVerificationToast.type === 'success'
                  ? 'bg-[#00E676]/15 border-[#00E676]/30 text-[#00E676]'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              }`}>
                <div className="flex items-center gap-2.5">
                  {teamVerificationToast.type === 'success' ? (
                    <ShieldCheck className="w-5 h-5 shrink-0 text-[#00E676]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                  )}
                  <div>
                    <strong className="block text-white font-bold">
                      {teamVerificationToast.type === 'success' ? 'Verification Updated' : 'Action Failed'}
                    </strong>
                    <span className="opacity-90">{teamVerificationToast.msg}</span>
                  </div>
                </div>
                <button
                  onClick={() => setTeamVerificationToast(null)}
                  className="text-current opacity-70 hover:opacity-100 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Team Directory Grid */}
            {adminTeamsLoading ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs font-mono">Loading Team Directory & Roster Stats...</p>
              </div>
            ) : adminTeams.length === 0 ? (
              <div className="glass-card rounded-3xl p-12 text-center text-slate-400 space-y-3">
                <Users className="w-10 h-10 mx-auto text-slate-600" />
                <h4 className="font-bold text-white text-base">No Clubs Matching Criteria</h4>
                <p className="text-xs">Adjust your search keyword, group filter, or verification status to view clubs.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {adminTeams.map(t => {
                  const verificationStatus = t.verificationStatus || (t.status === 'Verified' ? 'approved' : 'pending');
                  const isApproved = verificationStatus === 'approved';
                  const isPending = verificationStatus === 'pending';
                  const isRejected = verificationStatus === 'rejected';

                  const isLineupLocked = t.lineupStatus === 'Lineup Locked';
                  const isPendingLineup = t.lineupStatus === 'Pending Lineup';

                  return (
                    <div
                      key={t._id}
                      className="bg-[#121520] hover:bg-[#141824] border border-[#222738] hover:border-[#2C344B] rounded-2xl p-4 sm:p-5 transition-all space-y-4 shadow-lg group"
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-[#1A1E2C] border border-white/10 p-1.5 flex items-center justify-center shrink-0 shadow-inner group-hover:border-[#00E676]/40 transition-colors">
                            {t.logo ? (
                              <img src={t.logo} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <span className="font-mono font-black text-sm text-[#00E676]">{t.shortCode || 'FC'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-white truncate">{t.name}</h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300 shrink-0">
                                {t.shortCode}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                              <span className="text-slate-300 font-semibold">{t.group || 'Group A'}</span>
                              <span>•</span>
                              <span className="truncate">{t.homeGround || 'Home Ground'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {isApproved ? (
                            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
                              <span>Approved ✓</span>
                            </span>
                          ) : isRejected ? (
                            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                              <span>Rejected</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>Pending Review</span>
                            </span>
                          )}

                          {/* Lineup Status Badge */}
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isLineupLocked
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold'
                              : isPendingLineup
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold'
                              : 'bg-white/5 text-slate-400'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{t.lineupStatus || 'No Match'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Rejection Reason notice if rejected */}
                      {isRejected && t.rejectionReason && (
                        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 leading-relaxed flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                          <div>
                            <strong className="block text-white text-[11px] uppercase tracking-wider font-bold">Rejection Reason:</strong>
                            <span className="text-[11px]">{t.rejectionReason}</span>
                          </div>
                        </div>
                      )}

                      {/* Squad Count & Manager Info Strip */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#090B10] border border-[#1E2332] text-xs">
                        <div className="space-y-0.5">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Registered Squad</div>
                          <div className="flex items-center gap-1.5 text-white font-mono font-bold text-sm">
                            <Users className="w-4 h-4 text-[#00E676]" />
                            <span>{t.squadCount ?? 0} Players</span>
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Team Manager</div>
                          <div className="text-slate-200 font-semibold truncate text-[11px]">
                            {t.managerName || 'Manager'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {t.managerEmail}
                          </div>
                        </div>
                      </div>

                      {/* Verification Quick Action Bar */}
                      <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApproveTeam(t._id)}
                                disabled={verifyingTeamId === t._id}
                                className="py-1.5 px-3.5 rounded-xl bg-[#00E676] hover:bg-[#00c968] active:scale-[0.98] text-black font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00E676]/20 cursor-pointer disabled:opacity-50"
                              >
                                {verifyingTeamId === t._id ? (
                                  <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Approve Team</span>
                              </button>

                              <button
                                onClick={() => handleOpenRejectModal(t)}
                                disabled={verifyingTeamId === t._id}
                                className="py-1.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <>
                              <button
                                onClick={() => handleRevokeTeam(t._id)}
                                disabled={verifyingTeamId === t._id}
                                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                title="Return team to pending review"
                              >
                                {verifyingTeamId === t._id ? (
                                  <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                                ) : (
                                  <RefreshCw className="w-3 h-3 text-slate-400" />
                                )}
                                <span>Revoke / Set Pending</span>
                              </button>

                              <button
                                onClick={() => handleOpenRejectModal(t)}
                                disabled={verifyingTeamId === t._id}
                                className="py-1.5 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-medium text-xs flex items-center gap-1 transition-all cursor-pointer"
                                title="Reject club accreditation"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {isRejected && (
                            <>
                              <button
                                onClick={() => handleApproveTeam(t._id)}
                                disabled={verifyingTeamId === t._id}
                                className="py-1.5 px-3.5 rounded-xl bg-[#00E676] hover:bg-[#00c968] text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#00E676]/20 cursor-pointer"
                              >
                                {verifyingTeamId === t._id ? (
                                  <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Approve Team</span>
                              </button>

                              <button
                                onClick={() => handleRevokeTeam(t._id)}
                                disabled={verifyingTeamId === t._id}
                                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>Reset to Pending</span>
                              </button>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenRoster(t)}
                            className="py-1.5 px-3 rounded-xl bg-[#00E676]/15 hover:bg-[#00E676]/25 border border-[#00E676]/30 text-[#00E676] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Squad ({t.squadCount ?? 0})</span>
                          </button>

                          <button
                            onClick={async () => {
                              if (!selectedTeamRoster || selectedTeamForRoster?._id !== t._id) {
                                const res = await api.getAdminTeamPlayers(t._id);
                                if (res.success) setSelectedTeamRoster(res.data?.players || []);
                              }
                              setPrintableSheetTeam(t);
                            }}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title="Print official match sheet"
                          >
                            <Printer className="w-4 h-4 text-slate-400" />
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
        {/* 3B. TRANSFER WINDOW & SQUAD CAPACITY ENGINE */}
        {/* ========================================================= */}
        {adminTab === 'transfer' && (
          <div className="space-y-6">
            
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#121B28] via-[#101726] to-[#0A0D15] border border-[#2B354F] rounded-3xl p-6 sm:p-7 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#00E676]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-xs font-mono font-bold tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>OFFICIAL ROSTER & TRANSFER ENGINE</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
                    Roster Capacity & Mid-Season Transfer Window
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Automated transfer window state machine with Leg 1 completion hooks, 35-player hard squad caps, registration cutoffs, and automated email broadcasts via Resend.
                  </p>
                </div>

                {/* Primary Quick Toggle Button */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto shrink-0">
                  <button
                    onClick={handleToggleTransferWindow}
                    disabled={settingsUpdating}
                    className={`px-5 py-3.5 rounded-2xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer disabled:opacity-50 ${
                      leagueSettings?.transferWindowStatus === 'open'
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                        : 'bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#34f195] hover:to-[#00E676] text-black shadow-[#00E676]/25'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>
                      {settingsUpdating
                        ? 'Updating Engine...'
                        : leagueSettings?.transferWindowStatus === 'open'
                        ? 'Close Transfer Window'
                        : '⚡ Open Transfer Window Now'}
                    </span>
                  </button>
                  <span className="text-[11px] text-center text-slate-400 font-mono">
                    {leagueSettings?.transferWindowStatus === 'open'
                      ? 'Registration currently unlocked for all clubs'
                      : 'Player registration locked once cutoff lapses'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Status Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Window Status */}
              <div className="p-4 rounded-2xl bg-[#121622] border border-[#232838] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Transfer Window</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    leagueSettings?.transferWindowStatus === 'open' ? 'bg-[#00E676] animate-ping' : 'bg-slate-600'
                  }`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black font-display uppercase ${
                    leagueSettings?.transferWindowStatus === 'open' ? 'text-[#00E676]' : 'text-slate-400'
                  }`}>
                    {leagueSettings?.transferWindowStatus === 'open' ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {leagueSettings?.transferWindowStatus === 'open'
                    ? 'Clubs can add new players up to 35 maximum'
                    : 'Additions blocked until mid-season window'}
                </p>
              </div>

              {/* Card 2: Registration Lock */}
              <div className="p-4 rounded-2xl bg-[#121622] border border-[#232838] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Registration Gate</span>
                  <Lock className={`w-3.5 h-3.5 ${leagueSettings?.registrationLocked ? 'text-amber-400' : 'text-[#00E676]'}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black font-display uppercase ${
                    leagueSettings?.registrationLocked ? 'text-amber-400' : 'text-[#00E676]'
                  }`}>
                    {leagueSettings?.registrationLocked ? 'LOCKED' : 'UNLOCKED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {leagueSettings?.registrationLocked
                    ? 'Player additions locked on team dashboards'
                    : 'Approved clubs are eligible to add players'}
                </p>
              </div>

              {/* Card 3: Season Phase */}
              <div className="p-4 rounded-2xl bg-[#121622] border border-[#232838] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Season Phase</span>
                  <Trophy className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black font-mono uppercase text-white truncate">
                    {leagueSettings?.seasonPhase?.replace('_', ' ') || 'PRE SEASON'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {leagueSettings?.seasonPhase === 'mid_season_break'
                    ? 'Leg 1 completed • Mid-season recess'
                    : leagueSettings?.seasonPhase === 'leg_1'
                    ? 'Leg 1 underway • Initial cutoff active'
                    : leagueSettings?.seasonPhase === 'leg_2'
                    ? 'Leg 2 underway • Registrations locked'
                    : 'Tournament pre-season stage'}
                </p>
              </div>

              {/* Card 4: Squad Hard Cap */}
              <div className="p-4 rounded-2xl bg-[#121622] border border-[#232838] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Max Squad Limit</span>
                  <Users className="w-3.5 h-3.5 text-[#00E676]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black font-mono text-[#00E676]">
                    {leagueSettings?.maxSquadSize || 35} Players
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Hard cap: 36th player rejected across API & portal
                </p>
              </div>

            </div>

            {/* Main Operations Controls Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Left Column: Direct Manual Controls */}
              <div className="bg-[#131622] border border-[#232838] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-[#00E676]" />
                    <h4 className="font-extrabold text-sm text-white">Manual Admin Overrides</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Real-time socket sync</span>
                </div>

                {/* 1. Transfer Window Toggle */}
                <div className="p-4 rounded-2xl bg-[#090B10] border border-[#232838] flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs text-white">Transfer Window (Open / Closed)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Status: <strong className={leagueSettings?.transferWindowStatus === 'open' ? 'text-[#00E676]' : 'text-slate-300'}>
                        {leagueSettings?.transferWindowStatus === 'open' ? 'OPEN' : 'CLOSED'}
                      </strong>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleTransferWindow}
                    disabled={settingsUpdating}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      leagueSettings?.transferWindowStatus === 'open'
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                        : 'bg-[#00E676]/20 hover:bg-[#00E676]/30 text-[#00E676] border border-[#00E676]/30'
                    }`}
                  >
                    {leagueSettings?.transferWindowStatus === 'open' ? 'Close Window' : 'Open Window'}
                  </button>
                </div>

                {/* 2. Registration Lock Toggle */}
                <div className="p-4 rounded-2xl bg-[#090B10] border border-[#232838] flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-xs text-white">Player Registration Lock</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Status: <strong className={leagueSettings?.registrationLocked ? 'text-amber-400' : 'text-[#00E676]'}>
                        {leagueSettings?.registrationLocked ? 'LOCKED' : 'UNLOCKED'}
                      </strong>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleRegistrationLock}
                    disabled={settingsUpdating}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      leagueSettings?.registrationLocked
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {leagueSettings?.registrationLocked ? 'Unlock Registration' : 'Lock Registration'}
                  </button>
                </div>

                {/* 3. Window Closing Date Picker */}
                <div className="p-4 rounded-2xl bg-[#090B10] border border-[#232838] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-white">Window Closing Date</label>
                    <span className="text-[10px] font-mono text-slate-400">
                      Current: {leagueSettings?.transferWindowClosesAt ? new Date(leagueSettings.transferWindowClosesAt).toLocaleDateString() : 'Not Set'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={transferWindowClosingDate}
                      onChange={(e) => setTransferWindowClosingDate(e.target.value)}
                      className="flex-1 bg-[#121622] border border-[#232838] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    />
                    <button
                      onClick={() => handleUpdateLeagueSettings({ transferWindowClosesAt: transferWindowClosingDate ? new Date(transferWindowClosingDate) : null })}
                      disabled={settingsUpdating}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Save Date
                    </button>
                  </div>
                </div>

                {/* 4. Season Phase Dropdown */}
                <div className="p-4 rounded-2xl bg-[#090B10] border border-[#232838] space-y-2">
                  <label className="font-bold text-xs text-white">Current Season Phase</label>
                  <select
                    value={leagueSettings?.seasonPhase || 'pre_season'}
                    onChange={(e) => handleUpdateLeagueSettings({ seasonPhase: e.target.value })}
                    disabled={settingsUpdating}
                    className="w-full bg-[#121622] border border-[#232838] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                  >
                    <option value="pre_season">Pre-Season (Initial Registration Window)</option>
                    <option value="leg_1">Leg 1 (Matches Underway • Initial Cutoff Active)</option>
                    <option value="mid_season_break">Mid-Season Break (Transfer Window Active)</option>
                    <option value="leg_2">Leg 2 (Fixtures Resumed • Registrations Locked)</option>
                    <option value="completed">Championship Completed</option>
                  </select>
                </div>

              </div>

              {/* Right Column: Resend Broadcast & Automated State Machine */}
              <div className="bg-[#131622] border border-[#232838] rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 flex flex-col justify-between">
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#00E676]" />
                      <h4 className="font-extrabold text-sm text-white">Manager Email Broadcast Engine</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Resend API Integration</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Dispatch official email notifications to all 12 accredited club managers from <strong className="text-white">Skouted League &lt;tournaments@thevillagecoders.com&gt;</strong> with live squad counts, the 35-player ceiling, and direct dashboard access links.
                  </p>

                  <div className="p-4 rounded-2xl bg-[#090B10] border border-white/5 space-y-2.5 text-xs text-slate-300 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Sender Address:</span>
                      <span className="text-white font-bold">tournaments@thevillagecoders.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Email Subject:</span>
                      <span className="text-emerald-400 truncate max-w-[200px]" title="Transfer Window Officially Open | Skouted Youth League Championship">
                        Transfer Window Officially Open | ...
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Eligible Recipients:</span>
                      <span className="text-white">{adminTeams.filter(t => (t.verificationStatus === 'approved' || (t.status === 'Verified' && t.verificationStatus !== 'rejected'))).length || 12} Verified Clubs</span>
                    </div>
                  </div>

                  <button
                    onClick={handleBroadcastTransferWindow}
                    disabled={broadcastLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00E676] to-[#00C853] hover:from-[#34f195] hover:to-[#00E676] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#00E676]/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {broadcastLoading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                        <span>Dispatching via Resend...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Broadcast Announcement to All Club Managers</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Automated Leg 1 Hook Info Box */}
                <div className="p-4 rounded-2xl bg-[#0A0E18] border border-[#232838] space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Sparkles className="w-4 h-4 text-[#00E676]" />
                    <span>Automated Leg 1 Completion Hook</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    When the final fixture of Matchday 11 (the conclusion of Leg 1 for all 12 teams) is marked as <strong className="text-white">Full Time (FT)</strong>, the backend automatically transitions <code className="text-[#00E676]">transferWindowStatus</code> to <code className="text-[#00E676]">'open'</code>, sets <code className="text-[#00E676]">registrationLocked = false</code>, updates <code className="text-[#00E676]">seasonPhase = 'mid_season_break'</code>, and dispatches individual manager emails.
                  </p>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* 4. DIAGNOSTICS & SYSTEM SYNC */}
        {/* ========================================================= */}
        {adminTab === 'system' && (
          <div className="space-y-4">
            <div className="bg-[#131622] border border-[#232838] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#00E676]" />
                <span>Tournament Operations Diagnostics</span>
              </h3>

              {syncMsg && (
                <div className="p-3 bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{syncMsg}</span>
                </div>
              )}

              {/* Automated Tournament Engine Controls */}
              <div className="p-4 rounded-2xl bg-[#090B10] border border-[#232838] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#00E676]" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Automated Tournament Fixture Engine</h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 font-bold self-start sm:self-auto">
                    ALGORITHMIC ENGINE ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Run the Berger round-robin polygon scheduling engine to automatically generate balanced match schedules for the 12-Club Youth League Championship (22 matchdays, Home & Away) with automated pitch and time slot allocation.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setAutoScheduleErrMsg('');
                      setAutoScheduleSuccessMsg('');
                      setShowAutoScheduleModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#00E676] hover:bg-[#00c968] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00E676]/20 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Launch Auto-Scheduler Wizard</span>
                  </button>
                </div>
              </div>

              {/* Transfer Window Quick Access Card in System tab */}
              <div className="p-4 rounded-2xl bg-[#090B10] border border-[#232838] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-[#00E676]" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Transfer Window & Roster Engine</h4>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold self-start sm:self-auto ${
                    leagueSettings?.transferWindowStatus === 'open'
                      ? 'bg-[#00E676]/15 border-[#00E676]/30 text-[#00E676]'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    {leagueSettings?.transferWindowStatus === 'open' ? 'WINDOW OPEN' : 'WINDOW CLOSED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Manage the official mid-season transfer window, registration cutoffs, 35-player squad hard cap, and automated Leg 1 completion hooks.
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => setAdminTab('transfer')}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-white/15 cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Open Transfer Window Engine</span>
                  </button>
                  <button
                    onClick={handleToggleTransferWindow}
                    disabled={settingsUpdating}
                    className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
                      leagueSettings?.transferWindowStatus === 'open'
                        ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30'
                        : 'bg-[#00E676]/20 hover:bg-[#00E676]/30 text-[#00E676] border border-[#00E676]/30'
                    }`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{leagueSettings?.transferWindowStatus === 'open' ? 'Close Window' : 'Open Window'}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#090B10] border border-[#232838] space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">League Standings Table Calculation</h4>
                <p className="text-xs text-slate-400">
                  Force a full recalculation of points (PTS), goals (GF/GA/GD), and form guides (W/D/L) across all finished fixtures (`FT`).
                </p>
                <button
                  onClick={handleRecalculateStandings}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-white/15 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Recalculate Championship Table</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#090B10] border border-[#232838] space-y-2 text-xs">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Live System Information</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-400 font-mono text-[11px]">
                  <div>Server Port: <span className="text-[#00E676]">5055</span></div>
                  <div>Database: <span className="text-[#00E676]">MongoDB Atlas (skoutedLeague)</span></div>
                  <div>Live Feeds: <span className="text-[#00E676]">Socket.io Active</span></div>
                  <div>Cron Scheduler: <span className="text-[#00E676]">Active (Every 5 mins)</span></div>
                  <div>Sender Email: <span className="text-[#00E676]">tournaments@thevillagecoders.com</span></div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL 1: ROSTER INSPECTOR MODAL */}
      {/* ========================================================= */}
      {selectedTeamForRoster && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
          <div className="bg-[#10131C] border border-[#232838] w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#1C2030] border border-white/10 p-1 flex items-center justify-center shrink-0">
                  {selectedTeamForRoster.logo ? (
                    <img src={selectedTeamForRoster.logo} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-black text-sm text-[#00E676]">{selectedTeamForRoster.shortCode}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-white">{selectedTeamForRoster.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {selectedTeamForRoster.shortCode}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                      {selectedTeamForRoster.group || 'Group A'}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      (selectedTeamForRoster.status === 'Verified' || selectedTeamForRoster.isVerified)
                        ? 'bg-[#00E676]/15 text-[#00E676] border-[#00E676]/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {(selectedTeamForRoster.status === 'Verified' || selectedTeamForRoster.isVerified) ? 'Verified' : 'Pending OTP'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Manager: {selectedTeamForRoster.managerName} • {selectedTeamForRoster.managerEmail}
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {/* Admin Direct Verify Action (Bypass OTP) */}
                <button
                  onClick={() => handleVerifyTeam(
                    selectedTeamForRoster._id,
                    (selectedTeamForRoster.status === 'Verified' || selectedTeamForRoster.isVerified) ? 'Pending Verification' : 'Verified'
                  )}
                  disabled={verifyingTeamId === selectedTeamForRoster._id}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                    (selectedTeamForRoster.status === 'Verified' || selectedTeamForRoster.isVerified)
                      ? 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      : 'bg-[#00E676] hover:bg-[#00c968] text-black font-extrabold border-[#00E676] shadow-lg shadow-[#00E676]/20'
                  }`}
                  title="Toggle team verification without requiring manager OTP"
                >
                  {verifyingTeamId === selectedTeamForRoster._id ? (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {(selectedTeamForRoster.status === 'Verified' || selectedTeamForRoster.isVerified)
                      ? 'Set Pending'
                      : 'Verify Club (No OTP)'}
                  </span>
                </button>

                <button
                  onClick={() => setShowAdminAddPlayerModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#00E676] hover:bg-[#00c968] text-black font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#00E676]/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Player</span>
                </button>

                <button
                  onClick={() => setPrintableSheetTeam(selectedTeamForRoster)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
                >
                  <Printer className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>Print Match Sheet</span>
                </button>

                <button
                  onClick={() => setSelectedTeamForRoster(null)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Squad Stats Bar */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#090B10] border border-[#1E2332] text-xs shrink-0">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">Total Registered</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {selectedTeamRoster.length} Players
                </div>
              </div>
              <div className="text-center border-x border-white/5">
                <div className="text-[10px] uppercase font-bold text-slate-500">Accredited & Eligible</div>
                <div className="text-base font-bold text-[#00E676] font-mono mt-0.5">
                  {selectedTeamRoster.filter(p => p.status === 'Eligible' && p.isEligible !== false).length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">Suspended / Ineligible</div>
                <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
                  {selectedTeamRoster.filter(p => p.status === 'Suspended' || p.isEligible === false).length}
                </div>
              </div>
            </div>

            {/* Squad Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter squad by name or jersey #..."
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="w-full bg-[#090B10] border border-[#232838] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E676]"
                />
              </div>

              {/* Position Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {['All', 'GK', 'DEF', 'MID', 'FWD'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => setRosterPositionFilter(pos)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                      rosterPositionFilter === pos
                        ? 'bg-[#00E676] text-black font-extrabold'
                        : 'bg-[#181C28] text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={rosterStatusFilter}
                onChange={(e) => setRosterStatusFilter(e.target.value)}
                className="bg-[#090B10] border border-[#232838] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E676]"
              >
                <option value="All">All Eligibility</option>
                <option value="Eligible">Eligible Only</option>
                <option value="Suspended">Suspended Only</option>
              </select>
            </div>

            {/* Player Squad Table / List (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {rosterLoading ? (
                <div className="py-12 text-center text-slate-400">
                  <div className="w-7 h-7 rounded-full border-2 border-[#00E676] border-t-transparent animate-spin mx-auto mb-2" />
                  <span className="text-xs font-mono">Fetching full team roster...</span>
                </div>
              ) : selectedTeamRoster.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No players registered in this squad yet.
                </div>
              ) : (
                (() => {
                  const filtered = selectedTeamRoster.filter(p => {
                    const matchSearch =
                      !rosterSearch ||
                      `${p.firstName} ${p.lastName}`.toLowerCase().includes(rosterSearch.toLowerCase()) ||
                      p.jerseyNumber?.toString() === rosterSearch.trim();
                    const matchPos =
                      rosterPositionFilter === 'All' || p.position === rosterPositionFilter;
                    const matchStatus =
                      rosterStatusFilter === 'All' ||
                      (rosterStatusFilter === 'Eligible' && p.status === 'Eligible' && p.isEligible !== false) ||
                      (rosterStatusFilter === 'Suspended' && (p.status === 'Suspended' || p.isEligible === false));
                    return matchSearch && matchPos && matchStatus;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        No players match the applied search or filter.
                      </div>
                    );
                  }

                  return filtered.map(p => {
                    const isEligible = p.status === 'Eligible' && p.isEligible !== false;
                    const role = p.role || 'Squad Player';

                    // Position badge colors
                    const posColor =
                      p.position === 'GK'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : p.position === 'DEF'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : p.position === 'MID'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

                    return (
                      <div
                        key={p._id}
                        className="p-3 rounded-2xl bg-[#090B10] hover:bg-[#121622] border border-[#202536] hover:border-[#2C344B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        {/* Player Left: Photo, Jersey, Name, Position (Clickable to view full details) */}
                        <div
                          onClick={() => setSelectedPlayerForDetails(p)}
                          className="flex items-center gap-3 flex-1 cursor-pointer group/player"
                          title="Click to view full player details & tournament stats"
                        >
                          {/* Profile Photo */}
                          <div className="w-11 h-11 rounded-xl bg-[#1C2030] border border-white/10 overflow-hidden shrink-0 flex items-center justify-center group-hover/player:border-[#00E676]/50 transition-colors shadow-inner">
                            {p.photo ? (
                              <img src={p.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-slate-500" />
                            )}
                          </div>

                          {/* Jersey & Name */}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-sm text-[#00E676]">
                                #{p.jerseyNumber}
                              </span>
                              <span className="font-bold text-sm text-white group-hover/player:text-[#00E676] transition-colors flex items-center gap-1.5">
                                {p.firstName} {p.lastName}
                                <span className="text-[10px] text-slate-500 font-normal font-sans group-hover/player:text-slate-300">
                                  (view details)
                                </span>
                              </span>
                              
                              {/* Role Badges */}
                              {role === 'Captain' && (
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-black uppercase tracking-wider">
                                  C
                                </span>
                              )}
                              {role === 'Vice Captain' && (
                                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-cyan-400 text-black uppercase tracking-wider">
                                  VC
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                              <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${posColor}`}>
                                {p.position}
                              </span>
                              <span>•</span>
                              <span>Age: {p.age || 'N/A'}</span>
                              <span>•</span>
                              <span>Registered {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Active'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Player Right: Eligibility Status & Action Buttons */}
                        <div className="flex items-center gap-2 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                          {/* Eligibility Badge */}
                          <div className="text-right">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              isEligible
                                ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}>
                              {isEligible ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span>{isEligible ? 'Eligible' : 'Suspended'}</span>
                            </span>
                            {p.suspensionReason && !isEligible && (
                              <div className="text-[10px] text-rose-400/80 font-mono max-w-[140px] truncate" title={p.suspensionReason}>
                                {p.suspensionReason}
                              </div>
                            )}
                          </div>

                          {/* View Full Dossier Button */}
                          <button
                            onClick={() => setSelectedPlayerForDetails(p)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                            title="View Full Player Dossier & Tournament Statistics"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#00E676]" />
                          </button>

                          {/* Quick Toggle Eligibility Button */}
                          <button
                            onClick={() => handleToggleEligibility(p)}
                            className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              isEligible
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                                : 'bg-[#00E676]/10 hover:bg-[#00E676]/20 text-[#00E676] border-[#00E676]/30'
                            }`}
                            title={isEligible ? 'Suspend player from matchday participation' : 'Restore player eligibility'}
                          >
                            {isEligible ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            <span className="text-[10px] hidden sm:inline">
                              {isEligible ? 'Suspend' : 'Reinstate'}
                            </span>
                          </button>

                          {/* Quick Edit Info Button */}
                          <button
                            onClick={() => handleOpenQuickEdit(p)}
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                            title="Edit / Correct Player Name, Jersey, Position, Role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="font-mono">Skouted League Roster Verification Protocol Active</span>
              <button
                onClick={() => setSelectedTeamForRoster(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2A: ADMIN ADD PLAYER TO TEAM MODAL */}
      {/* ========================================================= */}
      <PlayerFormModal
        isOpen={showAdminAddPlayerModal}
        mode="add"
        team={selectedTeamForRoster}
        existingSquad={selectedTeamRoster}
        isAdmin={true}
        onClose={() => setShowAdminAddPlayerModal(false)}
        onSubmit={handleAddPlayerAdmin}
        isSubmitting={editPlayerLoading}
      />

      {/* ========================================================= */}
      {/* MODAL 2B: QUICK EDIT PLAYER MODAL */}
      {/* ========================================================= */}
      <PlayerFormModal
        isOpen={Boolean(editingPlayer)}
        mode="edit"
        player={editingPlayer}
        team={selectedTeamForRoster}
        existingSquad={selectedTeamRoster}
        isAdmin={true}
        onClose={() => setEditingPlayer(null)}
        onSubmit={handleSavePlayerEdit}
        isSubmitting={editPlayerLoading}
      />

      {/* ========================================================= */}
      {/* MODAL 3: MATCHDAY LINEUP INSPECTION MODAL */}
      {/* ========================================================= */}
      {inspectingFixtureLineups && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
          <div className="bg-[#10131C] border border-[#232838] w-full max-w-4xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#00E676]" />
                  <h3 className="font-extrabold text-base text-white">Matchday Starting XI & Bench Inspection</h3>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {inspectingFixtureLineups.homeTeam?.name} vs {inspectingFixtureLineups.awayTeam?.name} • {inspectingFixtureLineups.date} at {inspectingFixtureLineups.time} ({inspectingFixtureLineups.venue})
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendLineupReminder(inspectingFixtureLineups._id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Resend Lineup Reminder</span>
                </button>

                <button
                  onClick={() => setInspectingFixtureLineups(null)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Side-by-Side Lineup Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
              
              {/* Home Team Column */}
              <div className="p-4 rounded-2xl bg-[#090B10] border border-[#202536] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{inspectingFixtureLineups.homeTeam?.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({inspectingFixtureLineups.homeTeam?.shortCode})</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    inspectingFixtureLineups.homeLineup?.isLocked
                      ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {inspectingFixtureLineups.homeLineup?.isLocked ? '✅ Lineup Locked' : '⏳ Pending Submission'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Starting XI ({inspectingFixtureLineups.homeLineup?.startingXI?.length || 0}/11)
                  </div>
                  {(!inspectingFixtureLineups.homeLineup?.startingXI || inspectingFixtureLineups.homeLineup.startingXI.length === 0) ? (
                    <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-slate-500">
                      No Starting XI submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {inspectingFixtureLineups.homeLineup.startingXI.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedPlayerForDetails({
                              ...p,
                              firstName: p.firstName || (p.name ? p.name.split(' ')[0] : 'Player'),
                              lastName: p.lastName || (p.name ? p.name.split(' ').slice(1).join(' ') : `#${p.jerseyNumber}`),
                              team: inspectingFixtureLineups.homeTeam
                            });
                          }}
                          className="p-2 rounded-xl bg-[#121522] hover:bg-[#1A1F30] border border-white/5 hover:border-[#00E676]/40 flex items-center justify-between text-xs cursor-pointer transition-all group"
                          title="Click to view full player details & stats"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-center font-mono font-black text-[#00E676]">#{p.jerseyNumber}</span>
                            <span className="font-semibold text-white group-hover:text-[#00E676] transition-colors">
                              {p.name || `${p.firstName} ${p.lastName}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                              {p.position || 'MID'}
                            </span>
                            <Eye className="w-3 h-3 text-slate-500 group-hover:text-[#00E676] transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bench */}
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
                    Substitutes / Bench ({inspectingFixtureLineups.homeLineup?.bench?.length || 0})
                  </div>
                  {(!inspectingFixtureLineups.homeLineup?.bench || inspectingFixtureLineups.homeLineup.bench.length === 0) ? (
                    <div className="p-3 rounded-xl bg-white/5 text-center text-xs text-slate-500">
                      No substitutes listed.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {inspectingFixtureLineups.homeLineup.bench.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedPlayerForDetails({
                              ...p,
                              firstName: p.firstName || (p.name ? p.name.split(' ')[0] : 'Player'),
                              lastName: p.lastName || (p.name ? p.name.split(' ').slice(1).join(' ') : `#${p.jerseyNumber}`),
                              team: inspectingFixtureLineups.homeTeam
                            });
                          }}
                          className="p-2 rounded-xl bg-[#121522] hover:bg-[#1A1F30] border border-white/5 hover:border-[#00E676]/40 flex items-center justify-between text-xs text-slate-300 cursor-pointer transition-all group"
                          title="Click to view full player details & stats"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-center font-mono font-bold text-slate-400">#{p.jerseyNumber}</span>
                            <span className="group-hover:text-white transition-colors">{p.name || `${p.firstName} ${p.lastName}`}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                              {p.position || 'SUB'}
                            </span>
                            <Eye className="w-3 h-3 text-slate-500 group-hover:text-[#00E676] transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Away Team Column */}
              <div className="p-4 rounded-2xl bg-[#090B10] border border-[#202536] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{inspectingFixtureLineups.awayTeam?.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({inspectingFixtureLineups.awayTeam?.shortCode})</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    inspectingFixtureLineups.awayLineup?.isLocked
                      ? 'bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {inspectingFixtureLineups.awayLineup?.isLocked ? '✅ Lineup Locked' : '⏳ Pending Submission'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Starting XI ({inspectingFixtureLineups.awayLineup?.startingXI?.length || 0}/11)
                  </div>
                  {(!inspectingFixtureLineups.awayLineup?.startingXI || inspectingFixtureLineups.awayLineup.startingXI.length === 0) ? (
                    <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-slate-500">
                      No Starting XI submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {inspectingFixtureLineups.awayLineup.startingXI.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedPlayerForDetails({
                              ...p,
                              firstName: p.firstName || (p.name ? p.name.split(' ')[0] : 'Player'),
                              lastName: p.lastName || (p.name ? p.name.split(' ').slice(1).join(' ') : `#${p.jerseyNumber}`),
                              team: inspectingFixtureLineups.awayTeam
                            });
                          }}
                          className="p-2 rounded-xl bg-[#121522] hover:bg-[#1A1F30] border border-white/5 hover:border-[#00E676]/40 flex items-center justify-between text-xs cursor-pointer transition-all group"
                          title="Click to view full player details & stats"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-center font-mono font-black text-[#00E676]">#{p.jerseyNumber}</span>
                            <span className="font-semibold text-white group-hover:text-[#00E676] transition-colors">
                              {p.name || `${p.firstName} ${p.lastName}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                              {p.position || 'MID'}
                            </span>
                            <Eye className="w-3 h-3 text-slate-500 group-hover:text-[#00E676] transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bench */}
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">
                    Substitutes / Bench ({inspectingFixtureLineups.awayLineup?.bench?.length || 0})
                  </div>
                  {(!inspectingFixtureLineups.awayLineup?.bench || inspectingFixtureLineups.awayLineup.bench.length === 0) ? (
                    <div className="p-3 rounded-xl bg-white/5 text-center text-xs text-slate-500">
                      No substitutes listed.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {inspectingFixtureLineups.awayLineup.bench.map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedPlayerForDetails({
                              ...p,
                              firstName: p.firstName || (p.name ? p.name.split(' ')[0] : 'Player'),
                              lastName: p.lastName || (p.name ? p.name.split(' ').slice(1).join(' ') : `#${p.jerseyNumber}`),
                              team: inspectingFixtureLineups.awayTeam
                            });
                          }}
                          className="p-2 rounded-xl bg-[#121522] hover:bg-[#1A1F30] border border-white/5 hover:border-[#00E676]/40 flex items-center justify-between text-xs text-slate-300 cursor-pointer transition-all group"
                          title="Click to view full player details & stats"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 text-center font-mono font-bold text-slate-400">#{p.jerseyNumber}</span>
                            <span className="group-hover:text-white transition-colors">{p.name || `${p.firstName} ${p.lastName}`}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                              {p.position || 'SUB'}
                            </span>
                            <Eye className="w-3 h-3 text-slate-500 group-hover:text-[#00E676] transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end">
              <button
                onClick={() => setInspectingFixtureLineups(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: PRINTABLE OFFICIAL TEAM MATCH SHEET */}
      {/* ========================================================= */}
      {printableSheetTeam && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          
          {/* Action Bar Floating (Hidden during print) */}
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 no-print bg-[#121522] p-2 rounded-2xl border border-white/15 shadow-2xl">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#00E676] hover:bg-[#00c968] text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#00E676]/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Match Sheet (A4)</span>
            </button>
            <button
              onClick={() => setPrintableSheetTeam(null)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Printable Match Sheet Card */}
          <div
            id="printable-match-sheet"
            className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 my-auto max-h-[95vh] overflow-y-auto font-sans"
          >
            {/* Sheet Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                  OFFICIAL LEAGUE ACCREDITATION ROSTER
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  SKOUTED YOUTH LEAGUE 2026
                </h1>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">
                  Official Matchday Squad Sheet & Pitch-side Verification Record
                </div>
              </div>
              <div className="text-right text-xs font-mono text-slate-600">
                <div>Printed: {new Date().toLocaleDateString()}</div>
                <div>Status: <span className="font-bold text-slate-900 uppercase">VERIFIED</span></div>
              </div>
            </div>

            {/* Club Details Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Club Name</div>
                <div className="font-extrabold text-sm text-slate-900">{printableSheetTeam.name}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Short Code / Group</div>
                <div className="font-mono font-bold text-sm text-slate-900">
                  {printableSheetTeam.shortCode} • {printableSheetTeam.group || 'Group A'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Team Manager</div>
                <div className="font-bold text-slate-900">{printableSheetTeam.managerName || 'Verified Manager'}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">Manager Contact</div>
                <div className="font-mono text-slate-700">{printableSheetTeam.managerPhone || printableSheetTeam.managerEmail}</div>
              </div>
            </div>

            {/* Squad Table */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 uppercase font-mono font-black text-[11px]">
                    <th className="py-2.5 px-3 w-12 text-center border-r border-slate-200">#</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">Player Full Name</th>
                    <th className="py-2.5 px-2 w-14 text-center border-r border-slate-200">Pos</th>
                    <th className="py-2.5 px-2 w-24 text-center border-r border-slate-200">Role</th>
                    <th className="py-2.5 px-2 w-24 text-center border-r border-slate-200">Eligibility</th>
                    <th className="py-2.5 px-3 w-28 text-center border-r border-slate-200">Check-in (Init.)</th>
                    <th className="py-2.5 px-3 w-36 text-center">Referee Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-sans">
                  {(selectedTeamRoster.length > 0 ? selectedTeamRoster : []).map((player, idx) => {
                    const isEligible = player.status === 'Eligible' && player.isEligible !== false;
                    return (
                      <tr key={player._id || idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 text-center font-mono font-black border-r border-slate-200">
                          #{player.jerseyNumber}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900 border-r border-slate-200">
                          {player.firstName} {player.lastName}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-semibold border-r border-slate-200">
                          {player.position}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-[10px] border-r border-slate-200">
                          {player.role || 'Squad Player'}
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-200">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 font-black'
                          }`}>
                            {isEligible ? 'ELIGIBLE' : 'SUSPENDED'}
                          </span>
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          <div className="w-16 h-5 border-b border-dashed border-slate-400 mx-auto"></div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="w-24 h-5 border-b border-dashed border-slate-400 mx-auto"></div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official Sign-off Grid */}
            <div className="pt-4 border-t-2 border-slate-900 grid grid-cols-3 gap-6 text-xs text-slate-700">
              <div className="space-y-4">
                <div className="font-bold uppercase text-[10px] text-slate-500">Team Manager Signature</div>
                <div className="h-10 border-b border-slate-400"></div>
                <div className="text-[10px] text-slate-500 font-mono">Date: ____________________</div>
              </div>

              <div className="space-y-4">
                <div className="font-bold uppercase text-[10px] text-slate-500">Lead Match Referee Signature</div>
                <div className="h-10 border-b border-slate-400"></div>
                <div className="text-[10px] text-slate-500 font-mono">Date: ____________________</div>
              </div>

              <div className="space-y-4">
                <div className="font-bold uppercase text-[10px] text-slate-500">Match Commissioner Signature</div>
                <div className="h-10 border-b border-slate-400"></div>
                <div className="text-[10px] text-slate-500 font-mono">Date: ____________________</div>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 font-mono">
              Skouted Youth League • Official Matchday Form • All rights reserved • Verification ID: {printableSheetTeam._id}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: AUTOMATED TOURNAMENT FIXTURE GENERATOR MODAL */}
      {/* ========================================================= */}
      {showAutoScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
          <div className="bg-[#10131C] border border-[#2B354F] w-full max-w-3xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 my-auto max-h-[92vh] flex flex-col text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676] shadow-lg shadow-[#00E676]/10">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-lg text-white tracking-tight">
                      Automated Tournament Scheduler
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30 font-bold uppercase">
                      Algorithmic Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Berger circle method • Balanced home/away rotation • Pitch & time slot distribution
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAutoScheduleModal(false)}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error & Success Feedback Banners */}
            {autoScheduleErrMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 shrink-0 shadow-lg shadow-rose-500/10">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{autoScheduleErrMsg}</span>
              </div>
            )}

            {autoScheduleSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-[#00E676]/15 border border-[#00E676]/40 text-[#00E676] text-xs flex items-center gap-2.5 shrink-0 shadow-lg shadow-[#00E676]/10">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-bold">{autoScheduleSuccessMsg}</span>
              </div>
            )}

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* 1. Tournament Competition Mode */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#00E676]" />
                  <span>1. Select Tournament Competition Format</span>
                </label>

                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      id: 'LEAGUE_22',
                      title: '12-Club Youth League Championship',
                      sub: '22 Matchdays (Round-Robin Home & Away)',
                      desc: 'Official 12-team youth league championship structure. Clubs face every opponent home & away across 22 sequential matchdays using the Berger rotation engine.',
                      badge: 'Official Competition Format'
                    }
                  ].map(mode => {
                    const isSelected = autoScheduleMode === mode.id || true;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => setAutoScheduleMode(mode.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#00E676]/10 border-[#00E676] shadow-lg shadow-[#00E676]/10 ring-1 ring-[#00E676]'
                            : 'bg-[#090B10] border-[#222738] hover:border-[#323B50]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{mode.title}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold ${
                              isSelected ? 'bg-[#00E676] text-black' : 'bg-white/10 text-slate-400'
                            }`}>
                              {mode.badge}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-[#00E676]">{mode.sub}</div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{mode.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#00E676] bg-[#00E676]' : 'border-slate-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                          <span className={isSelected ? 'text-[#00E676]' : 'text-slate-500'}>
                            {isSelected ? 'Official Active Format' : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Match Legs Configuration (Home & Away Engine) */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00E676]" />
                  <span>2. Match Leg Engine Configuration</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: '2_LEGS',
                      title: '2 Legs (Home & Away)',
                      badge: 'Default • Official',
                      desc: 'Each club faces every opponent twice: Leg 1 (Home) and Leg 2 (Away with inverted home/away). Fixtures are scheduled so clubs never face the same opponent on consecutive matchdays.',
                      matchesPerClub: '22 Matches / Club (for 12 clubs)'
                    },
                    {
                      id: '1_LEG',
                      title: 'Single Leg (Neutral)',
                      badge: 'Single Meeting',
                      desc: 'Each club plays each opponent once in a single round-robin matchup at neutral or designated venues.',
                      matchesPerClub: '11 Matches / Club (for 12 clubs)'
                    }
                  ].map(legOption => {
                    const isSelected = autoScheduleLegs === legOption.id;
                    return (
                      <div
                        key={legOption.id}
                        onClick={() => setAutoScheduleLegs(legOption.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#00E676]/10 border-[#00E676] shadow-lg shadow-[#00E676]/10 ring-1 ring-[#00E676]'
                            : 'bg-[#090B10] border-[#222738] hover:border-[#323B50]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-white">{legOption.title}</span>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold ${
                              isSelected ? 'bg-[#00E676] text-black' : 'bg-white/10 text-slate-400'
                            }`}>
                              {legOption.badge}
                            </span>
                          </div>
                          <div className="text-[11px] font-semibold text-[#00E676]">{legOption.matchesPerClub}</div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{legOption.desc}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#00E676] bg-[#00E676]' : 'border-slate-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                          <span className={isSelected ? 'text-[#00E676]' : 'text-slate-500'}>
                            {isSelected ? 'Active Mode' : 'Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Schedule Timing & Matchday Progression */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#00E676]" />
                  <span>3. Matchday Calendar & Intervals</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#090B10] border border-[#202536] p-4 rounded-2xl">
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Tournament Start Date
                    </label>
                    <input
                      type="date"
                      value={autoScheduleStartDate}
                      onChange={(e) => setAutoScheduleStartDate(e.target.value)}
                      className="w-full bg-[#121622] border border-[#2B3145] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">Matchday 1 will kick off on this date</span>
                  </div>

                  {/* Days Between Rounds */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Interval Between Matchdays (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={autoScheduleDaysBetween}
                      onChange={(e) => setAutoScheduleDaysBetween(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-[#121622] border border-[#2B3145] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#00E676]"
                    />
                    
                    {/* Quick Interval Preset Chips */}
                    <div className="flex items-center gap-1.5 pt-1">
                      {[
                        { label: '3d (Fast)', val: 3 },
                        { label: '7d (Weekly)', val: 7 },
                        { label: '14d (Bi-weekly)', val: 14 }
                      ].map(chip => (
                        <button
                          key={chip.val}
                          type="button"
                          onClick={() => setAutoScheduleDaysBetween(chip.val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            autoScheduleDaysBetween === chip.val
                              ? 'bg-[#00E676] text-black font-extrabold'
                              : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Daily Kickoff Time Slots & Stadium Venues */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Time Slots */}
                <div className="space-y-2.5 bg-[#090B10] border border-[#202536] p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>Kickoff Time Slots</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAutoScheduleTimeSlots(['10:00', '13:00', '15:30', '18:00'])}
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
                    >
                      Reset Default
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {autoScheduleTimeSlots.map((ts, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#121622] border border-[#2B3145] text-xs font-mono text-slate-200"
                      >
                        {ts}
                        {autoScheduleTimeSlots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setAutoScheduleTimeSlots(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 ml-1"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add Custom Time Slot */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="time"
                      id="newTimeSlotInput"
                      defaultValue="19:00"
                      className="bg-[#121622] border border-[#2B3145] rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#00E676]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('newTimeSlotInput');
                        if (el && el.value && !autoScheduleTimeSlots.includes(el.value)) {
                          setAutoScheduleTimeSlots(prev => [...prev, el.value].sort());
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                    >
                      + Add Time
                    </button>
                  </div>
                </div>

                {/* Venues */}
                <div className="space-y-2.5 bg-[#090B10] border border-[#202536] p-4 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#00E676]" />
                      <span>Venues / Pitches</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAutoScheduleVenues(['Lekan Salami Stadium, Adamasingba, Ibadan', 'Legacy Arena Pitch 1'])}
                      className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
                    >
                      Reset Default
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {autoScheduleVenues.map((v, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#121622] border border-[#2B3145] text-[11px] font-mono text-slate-200"
                      >
                        {v}
                        {autoScheduleVenues.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setAutoScheduleVenues(prev => prev.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 ml-1"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Add Custom Venue */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      id="newVenueInput"
                      placeholder="e.g. Lekan Salami Stadium"
                      className="bg-[#121622] border border-[#2B3145] rounded-lg px-2.5 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00E676] flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('newVenueInput');
                        if (el && el.value.trim() && !autoScheduleVenues.includes(el.value.trim())) {
                          setAutoScheduleVenues(prev => [...prev, el.value.trim()]);
                          el.value = '';
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold shrink-0"
                    >
                      + Add Venue
                    </button>
                  </div>
                </div>

              </div>

              {/* 5. Automated Execution Settings */}
              <div className="space-y-2.5 bg-[#090B10] border border-[#202536] p-4 rounded-2xl">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings2 className="w-3.5 h-3.5 text-[#00E676]" />
                  <span>5. Automation & Notification Preferences</span>
                </label>

                <div className="space-y-2 text-xs">
                  {/* Clear Existing Checkbox */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl bg-[#121622] border border-[#232838] cursor-pointer hover:border-white/15 transition-colors">
                    <input
                      type="checkbox"
                      checked={autoScheduleClearExisting}
                      onChange={(e) => setAutoScheduleClearExisting(e.target.checked)}
                      className="mt-0.5 accent-[#00E676] w-4 h-4 rounded cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white">Reset Existing Unplayed Fixtures</div>
                      <div className="text-[11px] text-slate-400">
                        Removes existing upcoming (unplayed) fixtures so the new schedule starts fresh with no duplicate matches.
                      </div>
                    </div>
                  </label>

                  {/* Auto Notify Managers Checkbox */}
                  <label className="flex items-start gap-2.5 p-2 rounded-xl bg-[#121622] border border-[#232838] cursor-pointer hover:border-white/15 transition-colors">
                    <input
                      type="checkbox"
                      checked={autoScheduleNotifyManagers}
                      onChange={(e) => setAutoScheduleNotifyManagers(e.target.checked)}
                      className="mt-0.5 accent-[#00E676] w-4 h-4 rounded cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white">Email Match Announcements to Club Managers</div>
                      <div className="text-[11px] text-slate-400">
                        Automatically dispatch fixture schedule confirmation emails with date, kickoff time, and venue to verified team managers.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 6. Pre-flight Calculation & Summary Card */}
              {(() => {
                const mult = autoScheduleLegs === '2_LEGS' ? 2 : 1;
                const n = teams.length;
                const estMatches = n >= 2 ? ((n * (n - 1)) / 2) * mult : 0;
                const estRounds = n >= 2 ? (n % 2 === 0 ? n - 1 : n) * mult : 0;

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00E676]/10 via-[#101926] to-[#0A0D15] border border-[#00E676]/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#00E676]" />
                        <span className="font-bold text-xs text-white uppercase tracking-wider">
                          Pre-Flight Engine Simulation
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E676]/20 text-[#00E676] font-bold">
                        Calculated
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Teams</div>
                        <div className="text-base font-bold font-mono text-[#00E676] mt-0.5">
                          {teams.length}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Match Engine</div>
                        <div className="text-base font-bold font-mono text-white mt-0.5">
                          {autoScheduleLegs === '2_LEGS' ? '2 Legs (H&A)' : 'Single Leg'}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Total Matches</div>
                        <div className="text-base font-bold font-mono text-[#00E676] mt-0.5">
                          {estMatches}
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Matchdays</div>
                        <div className="text-base font-bold font-mono text-white mt-0.5">
                          {estRounds} Matchdays
                        </div>
                      </div>
                    </div>

                    {teams.length < 2 && (
                      <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>At least 2 registered teams are required to generate an automated schedule.</span>
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <ShieldCheck className="w-4 h-4 text-[#00E676]" />
                <span>Zero duplicate or self-matchups guarantee</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowAutoScheduleModal(false)}
                  disabled={autoScheduleLoading}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleAutoGenerateFixtures}
                  disabled={autoScheduleLoading || teams.length < 2}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00E676] hover:bg-[#00c968] text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-[#00E676]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {autoScheduleLoading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                      <span>Generating Match Schedule...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Generate & Broadcast Schedule</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: ATHLETE FULL DETAILS DOSSIER */}
      {/* ========================================================= */}
      {/* MODAL 5: ATHLETE FULL DETAILS DOSSIER */}
      {/* ========================================================= */}
      {selectedPlayerForDetails && (
        <PlayerDetailModal
          player={selectedPlayerForDetails}
          team={selectedTeamForRoster || selectedPlayerForDetails.team}
          isAdmin={true}
          onClose={() => setSelectedPlayerForDetails(null)}
          onToggleEligibility={async (p) => {
            await handleToggleEligibility(p);
            setSelectedPlayerForDetails(prev => {
              if (!prev) return null;
              const willBeEligible = !(prev.status === 'Eligible' && prev.isEligible);
              return {
                ...prev,
                status: willBeEligible ? 'Eligible' : 'Suspended',
                isEligible: willBeEligible,
                suspensionReason: willBeEligible ? '' : 'Suspension applied by Tournament Oversight'
              };
            });
          }}
          onEdit={(p) => {
            setSelectedPlayerForDetails(null);
            handleOpenQuickEdit(p);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 7: REJECT / SUSPEND CLUB ACCREDITATION MODAL */}
      {/* ========================================================= */}
      {rejectingTeam && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
          <div className="bg-[#10131C] border border-rose-500/30 w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Reject Team Registration</h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Club: <span className="text-white font-bold">{rejectingTeam.name}</span> ({rejectingTeam.shortCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setRejectingTeam(null);
                  setRejectionReasonInput('');
                }}
                disabled={rejectLoading}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed">
                Rejecting this team will lock their player registration access in the manager dashboard and notify the team manager via automated email.
              </p>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Rejection Reason / Guidance for Manager (Optional)
                </label>
                <textarea
                  rows={4}
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g. Club credentials or official academy affiliation proof could not be verified. Please update your registration documents or contact league officials."
                  className="w-full bg-[#090B10] border border-[#232838] focus:border-rose-500/60 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30 resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>An official email with this reason will be dispatched to {rejectingTeam.managerEmail || 'the team manager'}.</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setRejectingTeam(null);
                  setRejectionReasonInput('');
                }}
                disabled={rejectLoading}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRejectTeam}
                disabled={rejectLoading}
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-rose-500/20 cursor-pointer disabled:opacity-50"
              >
                {rejectLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Processing Rejection...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm & Send Rejection Notice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Team Verification Toast */}
      {teamVerificationToast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl border shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
          teamVerificationToast.type === 'error'
            ? 'bg-[#150D11] border-rose-500/40 text-rose-200'
            : 'bg-[#0D1813] border-[#00E676]/40 text-emerald-200'
        }`}>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            teamVerificationToast.type === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-[#00E676]/20 text-[#00E676]'
          }`}>
            {teamVerificationToast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <div className="flex-1 text-xs leading-snug">
            {teamVerificationToast.msg}
          </div>
          <button
            onClick={() => setTeamVerificationToast(null)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
