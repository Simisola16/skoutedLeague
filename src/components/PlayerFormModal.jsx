import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  User,
  Shield,
  Camera,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Footprints,
  Ruler,
  Weight,
  Globe,
  Award,
  Loader2,
  Shirt
} from 'lucide-react';
import {
  NATIONALITIES,
  getCountryFlag,
  CORE_POSITIONS,
  SUB_ROLES,
  PLAYER_ROLES,
  PREFERRED_FEET,
  calculateAge,
  formatHeight,
  formatWeight
} from '../utils/playerConstants';

export default function PlayerFormModal({
  isOpen,
  mode = 'add', // 'add' | 'edit'
  player = null,
  team = null,
  existingSquad = [],
  isAdmin = false,
  onClose,
  onSubmit, // async function(formData, rawState)
  isSubmitting = false
}) {

  const fileInputRef = useRef(null);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [position, setPosition] = useState('Midfielder');
  const [subPosition, setSubPosition] = useState('');
  const [roles, setRoles] = useState(['Regular Squad Player']);
  const [preferredFoot, setPreferredFoot] = useState('Right');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [nationality, setNationality] = useState('Nigeria');
  const [customNationality, setCustomNationality] = useState('');

  // Admin-only fields
  const [status, setStatus] = useState('Eligible');
  const [suspensionReason, setSuspensionReason] = useState('');

  // Photo State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Validation / Local Feedback
  const [localError, setLocalError] = useState('');

  // Initialize or reset form when modal opens or player changes
  useEffect(() => {
    if (mode === 'edit' && player) {
      setFirstName(player.firstName || '');
      setLastName(player.lastName || '');
      setJerseyNumber(player.jerseyNumber !== undefined ? String(player.jerseyNumber) : '');

      // Format dateOfBirth to YYYY-MM-DD for HTML5 date input
      if (player.dateOfBirth) {
        try {
          const d = new Date(player.dateOfBirth);
          if (!isNaN(d.getTime())) {
            setDateOfBirth(d.toISOString().split('T')[0]);
          } else {
            setDateOfBirth('');
          }
        } catch {
          setDateOfBirth('');
        }
      } else {
        setDateOfBirth('');
      }

      // Map position (either 'MID' or 'Midfielder')
      const posMap = {
        GK: 'Goalkeeper',
        DEF: 'Defender',
        MID: 'Midfielder',
        FWD: 'Forward'
      };
      setPosition(posMap[player.position] || player.position || 'Midfielder');
      setSubPosition(player.subPosition || '');

      // Roles array
      if (Array.isArray(player.roles) && player.roles.length > 0) {
        setRoles(player.roles);
      } else if (player.role) {
        setRoles([player.role]);
      } else {
        setRoles(['Regular Squad Player']);
      }

      setPreferredFoot(player.preferredFoot || 'Right');
      setHeightCm(player.heightCm ? String(player.heightCm) : '');
      setWeightKg(player.weightKg ? String(player.weightKg) : '');

      const nat = player.nationality || 'Nigeria';
      const existsInList = NATIONALITIES.some(n => n.name.toLowerCase() === nat.toLowerCase());
      if (existsInList) {
        setNationality(nat);
        setCustomNationality('');
      } else {
        setNationality('Other');
        setCustomNationality(nat);
      }

      // Photo
      setPhotoFile(null);
      setPhotoPreview(player.photoUrl || player.photo || '');

      // Admin fields
      setStatus(player.status || 'Eligible');
      setSuspensionReason(player.suspensionReason || '');
    } else {
      // Default Add Form
      setFirstName('');
      setLastName('');
      setJerseyNumber('');
      setDateOfBirth('');
      setPosition('Midfielder');
      setSubPosition('CM - Central Midfielder');
      setRoles(['Regular Squad Player']);
      setPreferredFoot('Right');
      setHeightCm('');
      setWeightKg('');
      setNationality('Nigeria');
      setCustomNationality('');
      setPhotoFile(null);
      setPhotoPreview('');
      setStatus('Eligible');
      setSuspensionReason('');
    }
    setLocalError('');
  }, [mode, player, isOpen]);

  // Clean up blob URL on unmount or file change
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // Guard placed AFTER all hooks to satisfy React's Rules of Hooks
  if (!isOpen) return null;

  // Calculated Age
  const currentAge = calculateAge(dateOfBirth);

  // Duplicate Jersey Number Check
  const numVal = Number(jerseyNumber);
  const isDuplicateJersey =
    numVal > 0 &&
    existingSquad.some(p => {
      if (mode === 'edit' && player && (p._id === player._id || p.id === player._id)) {
        return false;
      }
      return Number(p.jerseyNumber) === numVal;
    });

  const duplicateOwner = isDuplicateJersey
    ? existingSquad.find(p => Number(p.jerseyNumber) === numVal)
    : null;

  // Handle Photo Selection
  const handlePhotoSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLocalError('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setLocalError('Image file size must be under 8MB');
      return;
    }
    setLocalError('');
    setPhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
  };

  const handleRemovePhoto = () => {
    if (photoPreview && photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoFile(null);
    setPhotoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle Role Badge
  const handleToggleRole = (roleId) => {
    if (roleId === 'Regular Squad Player') {
      setRoles(['Regular Squad Player']);
      return;
    }
    setRoles(prev => {
      let filtered = prev.filter(r => r !== 'Regular Squad Player');
      if (filtered.includes(roleId)) {
        filtered = filtered.filter(r => r !== roleId);
        if (filtered.length === 0) return ['Regular Squad Player'];
        return filtered;
      } else {
        return [...filtered, roleId];
      }
    });
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoSelect(e.dataTransfer.files[0]);
    }
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!firstName.trim()) {
      setLocalError('First name is required');
      return;
    }
    if (!lastName.trim()) {
      setLocalError('Last name is required');
      return;
    }
    if (!jerseyNumber || isNaN(numVal) || numVal < 1 || numVal > 99) {
      setLocalError('Valid shirt / jersey number between 1 and 99 is required');
      return;
    }
    if (isDuplicateJersey) {
      setLocalError(
        `Jersey #${numVal} is already assigned to ${duplicateOwner?.firstName} ${duplicateOwner?.lastName}. Please pick a unique number.`
      );
      return;
    }
    if (!dateOfBirth) {
      setLocalError('Player date of birth is required');
      return;
    }

    const finalNationality = nationality === 'Other' ? (customNationality.trim() || 'Nigeria') : nationality;

    // Build FormData for upload
    const formData = new FormData();
    formData.append('firstName', firstName.trim());
    formData.append('lastName', lastName.trim());
    formData.append('jerseyNumber', numVal);
    formData.append('dateOfBirth', dateOfBirth);
    if (currentAge !== null) formData.append('age', currentAge);
    formData.append('position', position);
    formData.append('subPosition', subPosition || '');
    formData.append('roles', JSON.stringify(roles));
    formData.append('role', roles.includes('Captain') ? 'Captain' : roles.includes('Vice Captain') ? 'Vice Captain' : roles[0]);
    formData.append('preferredFoot', preferredFoot);
    if (heightCm) formData.append('heightCm', Number(heightCm));
    if (weightKg) formData.append('weightKg', Number(weightKg));
    formData.append('nationality', finalNationality);

    if (photoFile) {
      formData.append('photo', photoFile);
    } else if (photoPreview && !photoPreview.startsWith('blob:')) {
      formData.append('photoUrl', photoPreview);
    }

    if (isAdmin) {
      formData.append('status', status);
      formData.append('isEligible', status === 'Eligible');
      if (status === 'Suspended') {
        formData.append('suspensionReason', suspensionReason.trim());
      }
    }

    try {
      await onSubmit(formData, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        jerseyNumber: numVal,
        dateOfBirth,
        age: currentAge,
        position,
        subPosition,
        roles,
        preferredFoot,
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        nationality: finalNationality,
        status,
        photoFile,
        photoUrl: photoPreview
      });
    } catch (err) {
      setLocalError(err.message || 'Failed to submit player registration');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-print animate-in fade-in duration-200">
      <div className="bg-[#10131C] border border-[#232838] w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00E676]/15 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {mode === 'add' ? 'Register New Player' : 'Update Player Profile'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {team?.name ? `${team.name} Squad Roster` : 'Official Tournament Player Accreditation'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Error Banner */}
        {localError && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{localError}</span>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form id="playerForm" onSubmit={handleFormSubmit} className="space-y-5 flex-1 overflow-y-auto pr-1 text-xs">
          
          {/* SECTION 1: INSTANT PHOTO UPLOAD & LIVE PREVIEW */}
          <div className="p-4 rounded-2xl bg-[#090B10] border border-[#1E2332] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Player Profile Photo</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Instant Cloudinary Storage</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Avatar Preview Box */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#171B26] border-2 border-[#282E40] overflow-hidden flex items-center justify-center shadow-lg group relative">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Player Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 gap-1">
                      <User className="w-10 h-10 text-slate-600" />
                      <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">No Photo</span>
                    </div>
                  )}

                  {/* Overlay for quick action */}
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                    >
                      <Camera className="w-4 h-4 mb-1" />
                      <span>Change</span>
                    </button>
                  )}
                </div>

                {/* Jersey Number Badge Over Preview */}
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg bg-[#00E676] text-black font-mono font-black text-xs flex items-center justify-center shadow-md border-2 border-[#090B10]">
                  #{jerseyNumber || '?'}
                </div>
              </div>

              {/* Upload Drop Zone / Actions */}
              <div className="flex-1 w-full space-y-2">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#00E676] bg-[#00E676]/10 text-[#00E676]'
                      : 'border-[#232838] hover:border-slate-500 bg-[#121622]/50 text-slate-400'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto mb-1.5 text-[#00E676]" />
                  <p className="font-semibold text-white text-xs">
                    {photoPreview ? 'Click or drop to replace photo' : 'Tap to upload or drag & drop player avatar'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    PNG, JPG, WEBP up to 8MB • Instant live preview
                  </p>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>{photoPreview ? 'Change Photo' : 'Select Photo'}</span>
                  </button>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePhotoSelect(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CORE IDENTITY (2-Column Grid on Desktop, Stacked on Mobile) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* First Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                First Name <span className="text-[#00E676]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Victor"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-[#090B10] border border-[#232838] focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Last Name <span className="text-[#00E676]">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Osimhen"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-[#090B10] border border-[#232838] focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            {/* Jersey Number with Duplicate Warning */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Jersey / Shirt Number <span className="text-[#00E676]">*</span>
                </label>
                {isDuplicateJersey && (
                  <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Already Taken
                  </span>
                )}
              </div>
              <input
                type="number"
                min="1"
                max="99"
                required
                placeholder="e.g. 9"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                className={`w-full bg-[#090B10] border rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none transition-colors ${
                  isDuplicateJersey
                    ? 'border-rose-500/70 focus:border-rose-400 text-rose-300'
                    : 'border-[#232838] focus:border-[#00E676]'
                }`}
              />
              {isDuplicateJersey && (
                <p className="text-[10px] text-rose-400 mt-1">
                  Assigned to {duplicateOwner?.firstName} {duplicateOwner?.lastName}. Shirt numbers must be unique per squad.
                </p>
              )}
            </div>

            {/* Date of Birth with Live Auto-Calculated Age */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Date of Birth</span>
                  <span className="text-[#00E676]">*</span>
                </label>
                {currentAge !== null && (
                  <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30">
                    {currentAge} Years Old
                  </span>
                )}
              </div>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-[#090B10] border border-[#232838] focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-white focus:outline-none transition-colors [color-scheme:dark]"
              />
            </div>

          </div>

          {/* SECTION 3: TACTICAL POSITION & SUB-ROLES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Primary Position */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Primary Field Position <span className="text-[#00E676]">*</span>
              </label>
              <select
                value={position}
                onChange={(e) => {
                  const newPos = e.target.value;
                  setPosition(newPos);
                  // Auto-suggest sub-role
                  if (newPos === 'Goalkeeper') setSubPosition('GK - Goalkeeper');
                  else if (newPos === 'Defender') setSubPosition('CB - Center Back');
                  else if (newPos === 'Midfielder') setSubPosition('CM - Central Midfielder');
                  else if (newPos === 'Forward') setSubPosition('ST - Striker');
                }}
                className="w-full bg-[#090B10] border border-[#232838] focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-white focus:outline-none transition-colors"
              >
                {CORE_POSITIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Tactical Sub-Position */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Tactical Sub-Role
              </label>
              <select
                value={subPosition}
                onChange={(e) => setSubPosition(e.target.value)}
                className="w-full bg-[#090B10] border border-[#232838] focus:border-[#00E676] rounded-xl px-3.5 py-2.5 text-white focus:outline-none transition-colors"
              >
                <option value="">Select Tactical Sub-Role...</option>
                {SUB_ROLES.map(group => (
                  <optgroup key={group.group} label={group.group}>
                    {group.roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

          </div>

          {/* SECTION 4: PHYSICAL & TECHNICAL ATTRIBUTES */}
          <div className="p-4 rounded-2xl bg-[#090B10] border border-[#1E2332] space-y-3">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Physical & Technical Specifications
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Preferred Foot */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-[#00E676]" />
                  <span>Preferred Foot</span>
                </label>
                <select
                  value={preferredFoot}
                  onChange={(e) => setPreferredFoot(e.target.value)}
                  className="w-full bg-[#121622] border border-[#232838] focus:border-[#00E676] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {PREFERRED_FEET.map(foot => (
                    <option key={foot} value={foot}>{foot} Foot</option>
                  ))}
                </select>
              </div>

              {/* Height (cm) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-blue-400" />
                    <span>Height (cm)</span>
                  </label>
                  {heightCm && (
                    <span className="text-[9px] font-mono text-slate-400">
                      {formatHeight(heightCm)?.split(' ')[2] || ''}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="120"
                  max="230"
                  placeholder="e.g. 182"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full bg-[#121622] border border-[#232838] focus:border-[#00E676] rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

              {/* Weight (kg) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Weight className="w-3 h-3 text-amber-400" />
                    <span>Weight (kg)</span>
                  </label>
                  {weightKg && (
                    <span className="text-[9px] font-mono text-slate-400">
                      {formatWeight(weightKg)?.split(' ')[2] || ''}
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="35"
                  max="140"
                  placeholder="e.g. 75"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-[#121622] border border-[#232838] focus:border-[#00E676] rounded-xl px-3 py-2 text-white font-mono focus:outline-none"
                />
              </div>

            </div>

            {/* Nationality */}
            <div className="pt-2 border-t border-white/5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#00E676]" />
                <span>Nationality / Country of Origin</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-[#121622] border border-[#232838] focus:border-[#00E676] rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {NATIONALITIES.map(n => (
                    <option key={n.name} value={n.name}>
                      {n.flag} {n.name}
                    </option>
                  ))}
                  <option value="Other">🌍 Other Nation...</option>
                </select>

                {nationality === 'Other' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter country name..."
                    value={customNationality}
                    onChange={(e) => setCustomNationality(e.target.value)}
                    className="w-full bg-[#121622] border border-[#232838] focus:border-[#00E676] rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                )}
              </div>
            </div>

          </div>

          {/* SECTION 5: SQUAD & MATCHDAY ROLES (MULTI-SELECT PILLS) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Squad & Tactical Roles</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Tap badges to toggle</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {PLAYER_ROLES.map(r => {
                const isSelected = roles.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleToggleRole(r.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? `${r.color} shadow-md scale-[1.02]`
                        : 'bg-[#090B10] text-slate-400 border-[#232838] hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 6: ADMIN OVERSIGHT CONTROLS (IF ADMIN) */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Tournament Administrator Oversight
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Accreditation Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#090B10] border border-[#232838] focus:border-amber-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Eligible">Eligible (Match Ready)</option>
                    <option value="Suspended">Suspended (Disciplinary / Red Cards)</option>
                    <option value="Under Review">Under Review (Document Audit)</option>
                  </select>
                </div>

                {status === 'Suspended' && (
                  <div>
                    <label className="block text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                      Suspension Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2nd yellow in MD2 vs Telu FC"
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      className="w-full bg-[#090B10] border border-rose-500/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        </form>

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-white/10 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold transition-colors cursor-pointer disabled:opacity-50 text-xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="playerForm"
            disabled={isSubmitting || isDuplicateJersey}
            className="btn-primary px-6 py-2.5 rounded-xl font-extrabold uppercase tracking-wider text-xs shadow-lg shadow-[#00E676]/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading & Saving...</span>
              </>
            ) : (
              <span>{mode === 'add' ? 'Accredit & Register Player' : 'Save Profile Changes'}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
