// Shared constants and helper utilities for player registration, profiles, and dossiers

export const NATIONALITIES = [
  { name: 'Nigeria', flag: '🇳🇬' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Cameroon', flag: '🇨🇲' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Ivory Coast', flag: '🇨🇮' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Egypt', flag: '🇪🇬' },
  { name: 'Morocco', flag: '🇲🇦' },
  { name: 'Mali', flag: '🇲🇱' },
  { name: 'Algeria', flag: '🇩🇿' },
  { name: 'DR Congo', flag: '🇨🇩' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'Spain', flag: '🇪🇸' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Netherlands', flag: '🇳🇱' },
  { name: 'Belgium', flag: '🇧🇪' },
  { name: 'Italy', flag: '🇮🇹' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Canada', flag: '🇨🇦' }
];

export const getCountryFlag = (nationality) => {
  if (!nationality) return '🌍';
  const found = NATIONALITIES.find(
    n => n.name.toLowerCase() === nationality.trim().toLowerCase()
  );
  return found ? found.flag : '🌍';
};

export const CORE_POSITIONS = [
  { value: 'Goalkeeper', code: 'GK', label: 'Goalkeeper (GK)' },
  { value: 'Defender', code: 'DEF', label: 'Defender (DEF)' },
  { value: 'Midfielder', code: 'MID', label: 'Midfielder (MID)' },
  { value: 'Forward', code: 'FWD', label: 'Forward (FWD)' }
];

export const SUB_ROLES = [
  { group: 'Goalkeeping', roles: ['GK - Goalkeeper', 'Sweeper Keeper'] },
  { group: 'Defense', roles: ['CB - Center Back', 'LB - Left Back', 'RB - Right Back', 'LWB - Left Wing Back', 'RWB - Right Wing Back'] },
  { group: 'Midfield', roles: ['CDM - Defensive Midfielder', 'CM - Central Midfielder', 'CAM - Attacking Midfielder', 'LM - Left Midfielder', 'RM - Right Midfielder'] },
  { group: 'Attack', roles: ['LW - Left Winger', 'RW - Right Winger', 'ST - Striker', 'CF - Center Forward'] }
];

export const PLAYER_ROLES = [
  { id: 'Captain', label: 'Captain', icon: '👑', color: 'bg-amber-400 text-black border-amber-300' },
  { id: 'Vice Captain', label: 'Vice Captain', icon: '🛡️', color: 'bg-cyan-400 text-black border-cyan-300' },
  { id: 'Penalty Taker', label: 'Penalty Taker', icon: '🎯', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: 'Free Kick Specialist', label: 'Free Kick Specialist', icon: '⚡', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { id: 'Regular Squad Player', label: 'Regular Squad Player', icon: '⚽', color: 'bg-slate-700/50 text-slate-300 border-slate-600/50' }
];

export const PREFERRED_FEET = ['Right', 'Left', 'Both'];

export const calculateAge = (dobString) => {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 && age < 100 ? age : null;
};

export const formatHeight = (heightCm) => {
  if (!heightCm || isNaN(Number(heightCm))) return null;
  const cm = Number(heightCm);
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${cm} cm (${feet}'${inches}")`;
};

export const formatWeight = (weightKg) => {
  if (!weightKg || isNaN(Number(weightKg))) return null;
  const kg = Number(weightKg);
  const lbs = Math.round(kg * 2.20462);
  return `${kg} kg (${lbs} lbs)`;
};
